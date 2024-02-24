import { Statistic, Statistics } from "../models/Statistics.js";
import { getValidAddActions } from "./addaction-service.js";
import { getAllUserFoodItems } from "./inventory-service.js";
import axios, { all } from "axios";
import dotenv from "dotenv";
dotenv.config();

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_URL = "https://api.spoonacular.com/recipes";

const CURRENT_YEAR = new Date().getFullYear();

const SPOONACULAR_AUTH = {
  "x-api-key": SPOONACULAR_API_KEY,
};

export const getStatistics = async (userId) => {
  const allAddActions = await getValidAddActions(userId);
  const allUserFoodItems = await getAllUserFoodItems(userId);

  const existingStatistics = await useExistingStatistics(userId);

  if (existingStatistics){
    return existingStatistics.statistics;
  }

    try {
      const parsedItems = await getParsedItems(allAddActions);
      const { weightStatistic, costStatistic, macronutrientStatistic } = getSpoonacularStatistics(userId, parsedItems);

      const promises = [
        // need spoonacular
        weightStatistic,
        costStatistic,
        macronutrientStatistic,

        // don't need spoonacular
        getPeakActionMonth(userId, allAddActions), // get peak add action month
        getPeakRemoveActionMonth(userId),  // we dont have remove actions in database
        getUniqueItemsCount(userId, allUserFoodItems),  // just counting all inventory food items
        getUserRankingsPercent(userId, allAddActions),  // just counting add actions per user
      ];
  
      const results = await Promise.all(promises);
      saveStatistics(userId, results);
  
      return results;

    } catch (error) {
      throw error;
    }
};

export const getParsedItems = async (allAddActions) => {
  try {
    // Filter add actions for the current year
    const yearAddActions = allAddActions.filter(action => {
      return action.date.getFullYear() === CURRENT_YEAR;
    });

    // Generate the food string for spoonacular
    let foodString = '';
    yearAddActions.forEach(action => {
      const { quantity, unit, name } = action.foodItem;
      foodString += `${quantity} ${unit} ${name}\n`;
    });

    itemInformationList = (
      await axios.post(SPOONACULAR_URL + '/parseIngredients', {
        params: {
          ingredientList: foodString,
          servings: 1,
          includeNutrition: true,
          language: "en",
        },
        headers: SPOONACULAR_AUTH,
      })
    ).data;

    return itemInformationList;

  } catch (error) {
    throw error;
  }
}

export const getWeightAndCostStatistics = (userId, itemInformationList) => {
  // Initialize category weights
  let grainsWeight = 0;
  let fruitsVegetablesWeight = 0;
  let proteinWeight = 0;
  let dairyWeight = 0;
  let otherWeight = 0;

  let grainsCost = 0;
  let fruitsVegetablesCost = 0;
  let proteinCost = 0;
  let dairyCost = 0;
  let otherCost = 0;

  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  const unitToPounds = {
    'g': 0.00220462, // Grams to pounds
    'lb': 1,         // Pounds to pounds
    'kg': 2.20462,   // Kilograms to pounds
  };

  const unitToDollars = {
    'US Cents': 0.01, // Cents to dollars
    'US Dollar': 1,   // Dollar to dollars
  };

  // Iterate through items
  itemInformationList.forEach(item => {
    const weightInLbs = item.weightPerServing.amount * unitToPounds[item.weightPerServing.unit];
    const costInDollars = item.estimatedCost.value * unitToDollars[item.estimatedCost.unit];

    totalProtein += (item.nutrition.caloricBreakdown.percentProtein / 100) * weightInPounds;
    totalCarbs += (item.nutrition.caloricBreakdown.percentCarbs / 100) * weightInPounds;
    totalFat += (item.nutrition.caloricBreakdown.percentFat / 100) * weightInPounds;

    // Categorize item based on aisle
    switch (item.aisle) {
      case "Bread":
      case "Cereal":
      case "Bakery/Bread":
      case "Pasta and Rice":
      case "Baking":
        grainsWeight += weightInLbs;
        grainsCost += costInDollars;
        break;
      case "Produce":
      case "Dried Fruits":
      case "Nuts":
        fruitsVegetablesWeight += weightInLbs;
        fruitsVegetablesCost += costInDollars;
        break;
      case "Seafood":
      case "Meat":
        proteinWeight += weightInLbs;
        proteinCost += costInDollars;
        break;
      case "Cheese":
      case "Milk":
      case "Eggs":
      case "other Dairy":
        dairyWeight += weightInLbs;
        dairyCost += costInDollars;
        break;
      default:
        otherWeight += weightInLbs;
        otherCost += costInDollars;
        break;
    }
  });

  const totalWeight = grainsWeight + fruitsVegetablesWeight + proteinWeight + dairyWeight + otherWeight;
  const totalCost = grainsCost + fruitsVegetablesCost + proteinCost + dairyCost + otherCost;

  // Recalculate caloric breakdown percentages based on total weight
  const percentProtein = (totalProtein / totalWeight) * 100;
  const percentCarbs = (totalCarbs / totalWeight) * 100;
  const percentFat = (totalFat / totalWeight) * 100;
  
  // Create two Statistic objects based on the categories
  const weightStatistic = new Statistic({
    statisticId: 1, // the statisticId for peak add action month is 4
    ownerId: userId,
    title: "Food Inventory Growth",
    description: "You’ve added {{addedValue}} lbs of food to your inventory this year.",
    foodGroupBreakdown: [
      { category: "Grains", quantity: grainsWeight, unit: "lbs" },
      { category: "Fruits and Vegetables", quantity: fruitsVegetablesWeight, unit: "lbs" },
      { category: "Protein", quantity: proteinWeight, unit: "lbs" },
      { category: "Dairy", quantity: dairyWeight, unit: "lbs" }
    ],
    addedValue: totalWeight,
  });

  const costStatistic = new Statistic({
    statisticId: 2, // the statisticId for peak add action month is 4
    ownerId: userId,
    title: "Monetary Value of Inventory Growth",
    description: "You’ve added approximately ${{addedValue}} worth of food to your inventory this year.",
    foodGroupBreakdown: [
      { category: "Grains", quantity: grainsCost, unit: "$" },
      { category: "Fruits and Vegetables", quantity: fruitsCost, unit: "$" },
      { category: "Protein", quantity: proteinCost, unit: "$" },
      { category: "Dairy", quantity: dairyCost, unit: "$" }
    ],
    addedValue: totalCost,
  });

  const macronutrientStatistic = new Statistic({
    statisticId: 3, // the statisticId for peak add action month is 4
    ownerId: userId,
    title: "Macronutrient Composition",
    description: "You’ve added {{carbsPercent}}% of carbs, {{proteinPercent}}% of protein, and {{fatPercent}}% of fat to your inventory this year.",
    carbsPercent: percentCarbs,
    proteinPercent: percentProtein,
    fatPercent: percentFat,
  });

  return { weightStatistic, costStatistic, macronutrientStatistic };
};

export const getPeakActionMonth = async (userId, actions) => {
  try{
     // Group actions by month and count the number of actions in each month
     const actionsByMonth = {};

     actions.forEach(action => {
       if (action.date.getFullYear() === CURRENT_YEAR) { // Check if action is in the current year
         const monthYear = `${getCapitalizedMonth(action.date)}-${action.date.getFullYear()}`;
         if (!actionsByMonth[monthYear]) {
           actionsByMonth[monthYear] = 1;
         } else {
           actionsByMonth[monthYear]++;
         }
       }
     });

    // Helper function to find the month with the highest number of actions
    let maxActions = 0;
    let peakMonth = null;
    for (const monthYear in actionsByMonth) {
      if (actionsByMonth[monthYear] > maxActions) {
        maxActions = actionsByMonth[monthYear];
        peakMonth = monthYear;
      }
    }
 
     // Create a Statistic object based on the peak month found
     const statistic = new Statistic({
      statisticId: 4, // the statisticId for peak add action month is 4
      ownerId: userId,
      title: "Peak Inventory Addition Month",
      description: "You added the most items to your inventory in:",
      peakMonth: peakMonth
    });
    return statistic;

   } catch (error) {
     throw error;
   }
};

export const getPeakRemoveActionMonth = async (userId) => {
  // when remove actions implemented, just call getPeakActionMonth(userRemoveActions)
  // now, we just return a dummy statistic
  const statistic = new Statistic({
    statisticId: 5, // the statisticId for peak add action month is 4
    ownerId: userId,
    title: "Peak Consumption Month",
    description: "You consumed the most items from your inventory in:",
    peakMonth: getCapitalizedMonth(Date.now),
  });
  return statistic;
};

export const getUniqueItemsCount = async (userId, userFoodItems) => {
  // for now, just get the number of food items in all inventories
  // may not handle the same food items in different inventories
  itemsCount = userFoodItems.length; 

  const statistic = new Statistic({
    statisticId: 6, // the statisticId for peak add action month is 4
    ownerId: userId,
    title: "Unique Items Added",
    description: "You’ve added {{uniqueFoodItems}} different items to your inventory this year.",
    uniqueFoodItems: itemsCount,
  });
  return statistic;
};

// get the user's ranking for add actions
// TODO: when remove actions implemented, add logic in here also
export const getUserRankingsPercent = async (userId) => {
  try {
    // Query all users
    const allUsers = await User.find();

    // Calculate number of add actions in the current year for each user
    const userActionsByYear = {};
    for (const user of allUsers) {
      // Get all addActions for this user
      const userActions = await getValidAddActions(user._id);
      // Get only add actions for the current year
      const actionsInYear = userActions.filter(action => action.date.getFullYear() === CURRENT_YEAR);
      userActionsByYear[user._id] = actionsInYear.length;
    }

    // Sort users based on the number of add actions
    const sortedUsers = Object.entries(userActionsByYear).sort((a, b) => b[1] - a[1]);

    // Find the current user's position in the sorted list
    const currentUserIndex = sortedUsers.findIndex(([userId]) => userId.toString() === userId.toString());

    // Calculate percentile for the current user
    const percentile = (currentUserIndex / sortedUsers.length) * 100;

    const statistic = new Statistic({
      statisticId: 7,
      ownerId: userId,
      title: "User Rankings",
      description: "You are in the top {{consumerPercentage}}% of Kitchenwise users",
      uniqueFoodItems: percentile,
    });

    return statistic;
  } catch (error) {
    throw error;
  }
}

// helper functions

// Function to return capitalized month name
const getCapitalizedMonth = (date) => {
  return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
};


// save newly computed statistics to database
const saveStatistics = async (userId, results) => {
  try {
    const statistics = new Statistics({
      ownerId: userId,
      statistics: results
    });

    await statistics.save();
  } catch (error) {
    throw error;
  }
};

// Reuse already calculated statistics if less than a month has passed
export const useExistingStatistics = async (userId) => {
  try {
    const mostRecentStatistics = await Statistics.findOne({ ownerId: userId })
      .sort({ lastUpdated: -1 }) // Sort by lastUpdated date in descending order to get the most recent statistic first
      .limit(1);

    if (mostRecentStatistics) {
      // Check if the last updated date is less than a month ago
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      if (mostRecentStatistics.lastUpdated > oneMonthAgo) {
        return mostRecentStatistics;
      }
    }
    return null; // Return null if no recent statistic found or it's older than a month
  } catch (error) {
    throw error;
  }
};

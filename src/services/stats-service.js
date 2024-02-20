import { Statistic, Statistics } from "../models/Statistics.js";
import { getValidAddActions } from "./addaction-service.js";
import { getAllUserFoodItems } from "./inventory-service.js";

export const getStatistics = async (userId) => {
  const allAddActions = await getValidAddActions(userId);
  const allUserFoodItems = await getAllUserFoodItems(userId);

  const existingStatistics = await useExistingStatistics(userId);

  if (existingStatistics){
    return existingStatistics.statistics;
  }

    try {
      const promises = [
        // need spoonacular
        getFoodInventoryGrowth(userId, allAddActions),
        getMoneyInventoryGrowth(userId),
        getMacronutrientComposition(userId),

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


export const getFoodInventoryGrowth = async (userId, allAddActions) => {

};

export const getMoneyInventoryGrowth = async (userId) => {

};

export const getMacronutrientComposition = async (userId) => {

};

export const getPeakActionMonth = async (userId, actions) => {
  try{
     // Group actions by month and count the number of actions in each month
     const actionsByMonth = {};
     const currentYear = new Date().getFullYear(); // Get current year
     actions.forEach(action => {
       if (action.date.getFullYear() === currentYear) { // Check if action is in the current year
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
export const getUserRankingsPercent = async (userId, currentUserAddActions) => {
// Also, might be bad to get users by querying all add actions. 
// User schema should have owner Id, no?
  try {
    const allAddActions = await InventoryAddAction.find();
    const currentUserAddActionsCount = currentUserAddActions.length;

    // Calculate the number of add actions for each user
    const userAddActionsCounts = {};
    allAddActions.forEach(action => {
      const ownerId = action.ownerId.toString();
      if (!userAddActionsCounts[ownerId]) {
        userAddActionsCounts[ownerId] = 1;
      } else {
        userAddActionsCounts[ownerId]++;
      }
    });

    // Sort user add actions counts in descending order
    const sortedUserAddActionsCounts = Object.values(userAddActionsCounts).sort((a, b) => b - a);

    // Find the position of the current user's add actions count in the sorted list
    const currentUserIndex = sortedUserAddActionsCounts.findIndex(count => count === currentUserAddActionsCount);

    const percentile = (currentUserIndex / sortedUserAddActionsCounts.length) * 100;
    
    const statistic = new Statistic({
      statisticId: 7, // the statisticId for peak add action month is 4
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

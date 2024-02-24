import { compareTwoStrings } from "string-similarity";
import { Types } from "mongoose";
import Inventory from "../models/Inventory.js";
import { parseFoodItem } from "./fooditem-service.js";

export const getInventoryById = async (inventoryId) => {
  return await Inventory.findById(inventoryId);
};

export const getUserDefaultInventory = async (userId) => {
  const inventory = await Inventory.findOne({
    ownerId: new Types.ObjectId(userId),
    default: true,
  });
  if (!inventory) return null;
  return inventory;
};

export const getUserInventories = async (userId) => {
  const inventories = await Inventory.find({
    ownerId: new Types.ObjectId(userId),
  });
  return inventories;
};

const inventoryNameThreshold = 0.7;

export const locationNameToInventory = async (locationName, userId) => {
  const inventories = await getUserInventories(userId);
  let bestMatch = [0, null];
  for (const inv of inventories) {
    const currSimilarity = compareTwoStrings(
      locationName.toLowerCase(),
      inv.title.toLowerCase()
    );
    if (currSimilarity > Math.max(inventoryNameThreshold, bestMatch[0])) {
      bestMatch = [currSimilarity, inv];
    }
  }
  if (bestMatch[1] == null) return null;
  return bestMatch[1];
};

export const addFoodItem = async (foodItem, inventoryId) => {
  return await addFoodItems([foodItem], inventoryId);
};

// Assumes the foodItems have already been parsed (ie by addaction-service functions)
export const addFoodItems = async (foodItems, inventoryId) => {
  const inventory = await getInventoryById(inventoryId);
  for (const foodItem of foodItems) {
    const { name, quantity, unit, tags, expirationDate } = foodItem;
    let itemExists = false;
    // Adding to quantity of existing food if it's the same kind
    for (let i = 0; i < inventory.foodItems.length; i++) {
      const currItem = inventory.foodItems[i];
      if (
        currItem.name == name &&
        currItem.unit == unit &&
        currItem.expirationDate?.getTime() == expirationDate?.getTime()
      ) {
        inventory.foodItems[i].quantity += quantity;
        itemExists = true;
        break;
      }
    }
    if (!itemExists)
      inventory.foodItems.push({ name, quantity, unit, tags, expirationDate });
  }
  return await inventory.save();
};

export const getInventoryFromFood = async (foodItem, userId) => {
  const { name, quantity, unit, expirationDate } = parseFoodItem(
    foodItem.quantity,
    foodItem.foodString
  );
  const containingInventories = await Inventory.find({
    $and: [
      { ownerId: new Types.ObjectId(userId) },
      { foodItems: { $elemMatch: { name, unit, expirationDate } } },
    ],
  });
  if (containingInventories.length == 0) return null;
  if (containingInventories.length > 1) return containingInventories;
  return containingInventories[0];
};

// TODO: factor expirationDate into this
export const removeFoodItem = async (foodItem, inventoryId, parsed = false) => {
  const { name, quantity, unit } = parsed
    ? foodItem
    : parseFoodItem(foodItem.quantity, foodItem.foodString);
  const inventory = await getInventoryById(inventoryId);
  for (let i = 0; i < inventory.foodItems.length; i++) {
    const currItem = inventory.foodItems[i];
    if (currItem.name == name && currItem.unit == unit) {
      inventory.foodItems[i].quantity -= quantity;
      if (inventory.foodItems[i].quantity == 0) {
        inventory.foodItems.splice(i, 1);
      }
      return await inventory.save();
    }
  }
};

export const deleteFoodItemById = async (foodItemId, inventoryId) => {
  const inventory = getInventoryById(inventoryId);
  inventory.foodItems = inventory.foodItems.filter(
    (foodItem) => foodItem._id != foodItemId
  );
  return await inventory.save();
};

// Returns a list of n random foodItems a user has in their inventories
// We treat all the inventories' food items like one big array.
//   We don't want to O(n) concatenate though, so we generate random indices
//   less than the total number of food items and use partitions to see which
//   inventory the indices map to.
// TODO: this can probably be improved in several ways. for example, there can be duplicate food items
export const getUserFoodSamples = async (userId, numSamples = 10) => {
  const inventories = await getUserInventories(userId);
  let totalFoodItemNum = 0;
  // Initialized like this so the for loop knows where the first fooditem array starts
  const partitionDict = {
    [-1]: 0,
  };
  for (let i = 0; i < inventories.length; i++) {
    totalFoodItemNum += inventories[i].foodItems.length;
    partitionDict[i] = totalFoodItemNum;
  }
  numSamples = Math.min(numSamples, totalFoodItemNum);
  const samples = [];
  const randIndices = new Set();
  // First, create the random indices to ensure there's no repeated items
  for (let i = 0; i < numSamples; i++) {
    let randIdx;
    do {
      randIdx = Math.round(Math.random() * totalFoodItemNum);
    } while (randIndices.has(randIdx));
    randIndices.add(randIdx);
  }
  // For each generated random index, compare it to each partition until the correct invIdx is found
  for (const randIdx of Array.from(randIndices)) {
    for (const [invIdx, partitionIdx] of Object.entries(partitionDict)) {
      if (randIdx < partitionIdx) {
        samples.push(
          inventories[invIdx].foodItems[randIdx - partitionDict[invIdx - 1]]
        );
        break;
      }
    }
  }
  return samples;
};

export const getAllUserFoodItems = async (userId) => {
  const inventories = await getUserInventories(userId);
  let allFoodItems = [];
  for (const inv of inventories) {
    allFoodItems = allFoodItems.concat(
      // we attach the inventory title instead of the id because the title is unique to the user and easier to filter by in pantry page
      inv.foodItems.map((item) => ({
        ...item._doc,
        inventoryTitle: inv.title,
        inventoryId: inv._id,
      }))
    );
  }
  return allFoodItems;
};

export const createNewInventory = async (title, userId) => {
  const inventory = new Inventory();
  inventory.title = title;
  inventory.ownerId = new Types.ObjectId(userId);
  return await inventory.save();
};

export const renameInventory = async (inventoryId, newTitle) => {
  const inventory = await getInventoryById(inventoryId);
  inventory.title = newTitle;
  return await inventory.save();
};

export const deleteInventory = async (inventoryId, destinationInventoryId) => {
  const inventoryToDelete = await getInventoryById(inventoryId);
  const destinationInventory = await addFoodItems(
    inventoryToDelete.foodItems,
    destinationInventoryId
  );
  return await Inventory.deleteOne({ _id: inventoryId });
};

export const updateInventoryItem = async (
  inventoryId,
  foodItemId,
  newFoodItem
) => {
  const inventory = await getInventoryById(inventoryId);
  inventory.foodItems = inventory.foodItems.map((foodItem) =>
    foodItem._id.toString() === foodItemId
      ? { ...foodItem, ...newFoodItem }
      : foodItem
  );
  return await inventory.save();
};

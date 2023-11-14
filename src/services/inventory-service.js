import { compareTwoStrings } from "string-similarity";
import { Types } from "mongoose";
import Inventory from "../models/Inventory.js";

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

// Assumes the foodItem has already been parsed (ie by addaction-service functions)
export const addFoodItem = async (foodItem, inventoryId) => {
  const { name, quantity, unit, expirationDate } = foodItem;
  const inventory = await getInventoryById(inventoryId);
  // Adding to quantity of existing food if it's the same kind
  for (let i = 0; i < inventory.foodItems.length; i++) {
    const currItem = inventory.foodItems[i];
    if (
      currItem.name == name &&
      currItem.unit == unit &&
      currItem.expirationDate?.getTime() == expirationDate?.getTime()
    ) {
      inventory.foodItems[i].quantity += quantity;
      return await inventory.save();
    }
  }
  inventory.foodItems.push(foodItem);
  return await inventory.save();
};

export const getInventoryFromFood = async (foodItem, userId) => {
  const { foodString: name, quantity: rawQuantity, expirationDate } = foodItem;
  const { quantity, unit } = parseQuantity(rawQuantity);
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
export const deleteFoodItem = async (foodItem, inventoryId) => {
  const { foodString: name, quantity: rawQuantity } = foodItem;
  const { quantity, unit } = parseQuantity(rawQuantity);
  const inventory = await getInventoryById(inventoryId);
  for (let i = 0; i < inventory.foodItems.length; i++) {
    const currItem = inventory.foodItems[i];
    if (currItem.name == name && currItem.unit == unit) {
      inventory.foodItems[i].quantity -= quantity;
      if (inventory.foodItems[i].quantity == 0)
        inventory.foodItems = inventory.foodItems.splice(i);
      return await inventory.save();
    }
  }
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
    allFoodItems = allFoodItems.concat(inv.foodItems);
  }
  return allFoodItems;
};

export const createNewInventory = async (title, userId) => {
  const inventory = new Inventory({
    title,
    ownerId: new Types.ObjectId(userId),
  });
  return await inventory.save();
};

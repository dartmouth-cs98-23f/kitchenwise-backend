import { compareTwoStrings } from "string-similarity";
import { Types } from "mongoose";
import Inventory from "../models/Inventory.js";

export const getInventoryById = async (inventoryId) => {
  return await Inventory.findOne({ _id: new Types.ObjectId(inventoryId) });
};

const inventoryNameThreshold = 0.7;

export const locationNameToInventory = async (locationName, userId) => {
  const inventories = await Inventory.find({
    ownerId: new Types.ObjectId(userId),
  });
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

export const getUserDefaultInventory = async (userId) => {
  const inventory = await Inventory.findOne({
    ownerId: new Types.ObjectId(userId),
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

// Assumes the foodItem has already been parsed (ie by addaction-service functions)
export const addFoodItem = async (foodItem, inventoryId) => {
  const { name, quantity, unit, expirationDate } = foodItem;
  const inventory = await Inventory.findOne({
    _id: new Types.ObjectId(inventoryId),
  });
  // Adding to quantity of existing food if it's the same kind
  for (let i = 0; i < inventory.foodItems.length; i++) {
    const currItem = inventory.foodItems[i];
    if (
      currItem.name == name &&
      currItem.unit == unit &&
      currItem.expirationDate == expirationDate
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

export const deleteFoodItem = async (foodItem, inventoryId) => {
  const { foodString: name, quantity: rawQuantity } = foodItem;
  const { quantity, unit } = parseQuantity(rawQuantity);
  const inventory = await Inventory.findOne({
    _id: new Types.ObjectId(inventoryId),
  });
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

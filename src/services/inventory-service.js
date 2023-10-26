import { compareTwoStrings } from "string-similarity";
import { Types } from "mongoose";
import Inventory from "../models/Inventory.js";

const parseQuantity = (rawQuantity) => {
  const quantity = rawQuantity;
  const unit = "";
  return { quantity, unit };
};

const inventoryNameThreshold = 0.7;

export const locationNameToInventory = async (locationName, userId) => {
  const inventories = await Inventory.find({
    ownerId: new Types.ObjectId(userId),
  });
  let bestMatch = [0, null];
  for (const inv of inventories) {
    const currSimilarity = compareTwoStrings(locationName, inv.title);
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

export const addFoodItem = async (foodItem, inventoryId) => {
  const { foodString: name, quantity: rawQuantity, expirationDate } = foodItem;
  const { quantity, unit } = parseQuantity(rawQuantity);
  const parsedFoodItem = { name, quantity, unit, expirationDate };
  return await Inventory.findOneAndUpdate(
    { _id: new Types.ObjectId(inventoryId) },
    { $push: { foodItems: parsedFoodItem } },
    { new: true }
  );
};

export const deleteFoodItem = async (foodItem, inventoryId) => {
  const { name, quantity: rawQuantity } = foodItem;
  const { quantity, unit } = parseQuantity(rawQuantity);
  const parsedFoodItem = { name, quantity, unit };
};

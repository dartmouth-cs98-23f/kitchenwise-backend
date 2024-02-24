import { Types } from "mongoose";
import InventoryRemoveAction from "../models/InventoryRemoveAction.js";
import { removeFoodItem } from "./inventory-service.js";

export const getRemoveActionById = async (removeActionId) => {
  return await InventoryRemoveAction.findById(removeActionId);
};

export const getValidRemoveActions = async (userId) => {
  try {
    const actions = await InventoryRemoveAction.find({
      ownerId: new Types.ObjectId(userId),
      status: { $in: ["CONFIRMED", "REVISED", "UNREVISED"] }
    });
    return actions;
  } catch (error) {
    throw error;
  }
};

export const createRemoveAction = async (foodItem, inventoryId, userId) => {
  const removeAction = new InventoryRemoveAction();
  removeAction.ownerId = new Types.ObjectId(userId);
  removeAction.inventoryId = new Types.ObjectId(inventoryId);
  removeAction.foodItem = foodItem;
  removeAction.date = new Date();
  return await removeAction.save();
};

export const confirmRemoveAction = async (removeActionId) => {
  const action = getRemoveActionById(removeActionId);
  if (action.status == "PENDING") {
    await removeFoodItem(action.foodItem, action.inventoryId);
    action.state = "CONFIRMED";
    return await action.save();
  } else {
    throw new Error("Action is no longer pending");
  }
};

// Number of seconds before actions expire
const actionExpireTime = 0;

// This function will add unrevised actions to the inventory after they expire. intended to be run on an interval
export const unrevisedRemoveActionListener = async () => {
  const cutOffDate = new Date() - actionExpireTime * 1000;
  const expiredActions = await InventoryRemoveAction.find({
    $and: [{ status: "PENDING" }, { date: { $lt: cutOffDate } }],
  });
  for (const action of expiredActions) {
    await removeFoodItem(action.foodItem, action.inventoryId, true);
    action.status = "UNREVISED";
    await action.save();
  }
};

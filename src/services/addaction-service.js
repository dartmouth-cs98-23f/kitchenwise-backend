import { Types } from "mongoose";
import InventoryAddAction from "../models/InventoryAddAction.js";
import { addFoodItem } from "./inventory-service.js";
import { parseFoodItem } from "./fooditem-service.js";

export const createAddAction = async (food, inventoryId, userId) => {
  const { quantity, foodString, expirationDate } = food;
  const newFoodItem = parseFoodItem(quantity, foodString, expirationDate);
  const newAddAction = new InventoryAddAction({
    ownerId: new Types.ObjectId(userId),
    inventoryId: new Types.ObjectId(inventoryId),
    foodItem: newFoodItem,
    date: new Date(),
  });
  return await newAddAction.save();
};

export const confirmAddAction = async (addActionId) => {
  const action = await InventoryAddAction.findById(addActionId);
  await addFoodItem(action.foodItem, action.inventoryId);
  action.state = "CONFIRMED";
  return await action.save();
};

export const reviseAddAction = async (addActionId, newFood) => {
  const { quantity, foodString, expirationDate } = newFood;
  const revisedFoodItem = parseFoodItem(quantity, foodString, expirationDate);
  const action = await InventoryAddAction.findById(addActionId);
  action.foodItem = revisedFoodItem;
  action.status = "REVISED";
  await addFoodItem(action.foodItem, action.inventoryId);
  return await action.save();
};

export const rejectAddAction = async (addActionId) => {
  const action = await InventoryAddAction.findById(addActionId);
  action.status = "REJECTED";
  return await action.save();
};

// Number of seconds before actions expire
const actionExpireTime = 10;

// This function will add unrevised actions to the inventory after they expire. intended to be run on an interval
export const unrevisedAddActionListener = async () => {
  const cutOffDate = new Date() - actionExpireTime * 1000;
  const expiredActions = await InventoryAddAction.find({
    $and: [{ status: "PENDING" }, { date: { $lt: cutOffDate } }],
  });
  for (const action of expiredActions) {
    await addFoodItem(action.foodItem, action.inventoryId);
    action.status = "UNREVISED";
    await action.save();
  }
};

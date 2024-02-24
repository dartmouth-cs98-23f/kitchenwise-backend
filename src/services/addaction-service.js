import { Types } from "mongoose";
import InventoryAddAction from "../models/InventoryAddAction.js";
import { addFoodItem } from "./inventory-service.js";
import { parseFoodItem, parseTags } from "./fooditem-service.js";

export const getAddActionById = async (addActionId) => {
  return await InventoryAddAction.findById(addActionId);
};

export const getPendingAddAction = async (userId) => {
  const actions = await InventoryAddAction.find({
    ownerId: new Types.ObjectId(userId),
    status: "PENDING",
  });
  if (!actions) return null;
  return actions[0];
};

export const getValidAddActions = async (userId) => {
  try {
    const actions = await InventoryAddAction.find({
      ownerId: new Types.ObjectId(userId),
      status: { $in: ["CONFIRMED", "REVISED", "UNREVISED"] }
    });
    return actions;
  } catch (error) {
    throw error;
  }
};

export const createAddAction = async (food, inventoryId, userId) => {
  const { quantity, foodString, expirationDate, unit } = food;
  const newFoodItem =
    unit !== undefined
      ? food
      : parseFoodItem(quantity, foodString, expirationDate);
  // add tags
  newFoodItem.tags = await parseTags(newFoodItem.name, newFoodItem.quantity, newFoodItem.unit);

  const newAddAction = new InventoryAddAction({
    ownerId: new Types.ObjectId(userId),
    inventoryId: new Types.ObjectId(inventoryId),
    foodItem: newFoodItem,
    date: new Date(),
  });
  await unreviseUserPendingAction(userId);
  return await newAddAction.save();
};

export const confirmAddAction = async (addActionId) => {
  const action = await getAddActionById(addActionId);
  if (action.status == "PENDING") {
    await addFoodItem(action.foodItem, action.inventoryId);
    action.state = "CONFIRMED";
    return await action.save();
  } else if (action.status != "CONFIRMED" && action.status != "UNREVISED") {
    throw new Error("Action has already been revised or rejected");
  }
  return action;
};

export const reviseAddAction = async (addActionId, newFood, newInventoryId) => {
  const action = await getAddActionById(addActionId);
  if (action.status == "PENDING") {
    action.foodItem = newFood;
    action.inventoryId = new Types.ObjectId(newInventoryId);
    action.status = "REVISED";
    await addFoodItem(action.foodItem, action.inventoryId);
    return await action.save();
  } else {
    throw new Error("Cannot revise non-pending action");
  }
};

export const rejectAddAction = async (addActionId) => {
  const action = await getAddActionById(addActionId);
  if (action.status == "PENDING") {
    action.status = "REJECTED";
    return await action.save();
  } else {
    throw new Error("Cannot reject non-pending action");
  }
};

// TODO: stupid function name
export const unreviseUserPendingAction = async (userId) => {
  const actions = await InventoryAddAction.updateMany(
    { ownerId: new Types.ObjectId(userId), status: "PENDING" },
    { status: "UNREVISED" }
  );
  return actions;
};

// Number of seconds before actions expire
const actionExpireTime = 0;

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

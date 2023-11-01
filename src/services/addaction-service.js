import { Types } from "mongoose";
import InventoryAddAction from "../models/InventoryAddAction.js";
import { getInventoryById } from "./inventory-service.js";
import { parseQuantity } from "./fooditem-service.js";

export const createAddAction = async (food, inventoryId, userId) => {
  const { quantity: rawQuantity, foodString: name } = food;
  const { quantity, unit } = parseQuantity(rawQuantity);
  const newFoodItem = { name, quantity, unit };
  const newAddAction = new InventoryAddAction({
    ownerId: Types.ObjectId(userId),
    inventoryId: Types.ObjectId(inventoryId),
    foodItem: newFoodItem,
    date: new Date(),
  });
  return await newAddAction.save();
};

export const confirmAddAction = async (addActionId) => {
  return await InventoryAddAction.findByIdAndUpdate(
    addActionId,
    { status: "CONFIRMED" },
    { new: true }
  );
};

export const reviseAddAction = (addActionId, newFood) => {};

export const rejectAddAction = (addActionId) => {};

// Number of seconds before actions expire
const actionExpireTime = 30;

// This function will add unrevised actions to the inventory after they expire. intended to be run on an interval
export const unrevisedAddActionListener = async () => {
  const cutOffDate = new Date() - actionExpireTime * 1000;
  const result = await InventoryAddAction.updateMany(
    {
      $and: [{ status: "PENDING" }, { date: { $lt: cutOffDate } }],
    },
    { status: "UNREVISED" }
  );
  //   console.log("Expired addActions", result.modifiedCount);
};

import mongoose, { SchemaTypes } from "mongoose";
import { foodItemSchema } from "./FoodItem.js";

export const removeReasons = ["TRASH", "USED"];

export const inventoryRemoveActionSchema = new mongoose.Schema({
  ownerId: { type: SchemaTypes.ObjectId, ref: "User" },
  inventoryId: { type: SchemaTypes.ObjectId, ref: "Inventory" },
  foodItem: foodItemSchema,
  date: Date,
  removeReason: { type: String, enum: removeReasons },
});

const InventoryRemoveAction = mongoose.model(
  "InventoryRemoveAction",
  inventoryRemoveActionSchema
);

export default InventoryRemoveAction;

import mongoose, { SchemaTypes } from "mongoose";
import { foodItemSchema } from "./FoodItem.js";
import { actionStatuses, removeReasons } from "./enums.js";

export const inventoryRemoveActionSchema = new mongoose.Schema({
  ownerId: { type: SchemaTypes.ObjectId, ref: "User" },
  inventoryId: { type: SchemaTypes.ObjectId, ref: "Inventory" },
  foodItem: foodItemSchema,
  date: Date,
  removeReason: { type: String, enum: removeReasons, default: "TRASH" },
  status: { type: String, enum: actionStatuses, default: "PENDING" },
});

const InventoryRemoveAction = mongoose.model(
  "InventoryRemoveAction",
  inventoryRemoveActionSchema
);

export default InventoryRemoveAction;

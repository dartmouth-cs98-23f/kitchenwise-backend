import mongoose, { SchemaTypes } from "mongoose";
import { foodItemSchema } from "./FoodItem.js";
import { actionStatuses } from "./enums.js";

export const inventoryAddActionSchema = new mongoose.Schema({
  // TODO: is it repetitive to have both ownerId and inventoryId? I designed it like this assuming multiple users could add to shared inventories
  ownerId: { type: SchemaTypes.ObjectId, ref: "User" },
  inventoryId: { type: SchemaTypes.ObjectId, ref: "Inventory" },
  foodItem: foodItemSchema,
  date: Date,
  status: { type: String, enum: actionStatuses, default: "PENDING" },
});

const InventoryAddAction = mongoose.model(
  "InventoryAddAction",
  inventoryAddActionSchema
);

export default InventoryAddAction;

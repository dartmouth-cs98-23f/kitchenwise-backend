import mongoose, { SchemaTypes } from "mongoose";
import { foodItemSchema } from "./FoodItem.js";

export const inventoryAddActionSchema = new mongoose.Schema({
  ownerId: { type: SchemaTypes.ObjectId, ref: "User" },
  inventoryId: { type: SchemaTypes.ObjectId, ref: "Inventory" },
  foodItem: foodItemSchema,
  date: Date,
});

const InventoryAddAction = mongoose.model(
  "InventoryAddAction",
  inventoryAddActionSchema
);

export default InventoryAddAction;

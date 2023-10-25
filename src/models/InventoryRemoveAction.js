import mongoose from "mongoose";
import { foodItemSchema } from "./FoodItem";

export const removeReasons = ["TRASH", "USED"];

export const inventoryRemoveActionSchema = new mongoose.Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: "User" },
  inventoryId: { type: Schema.Types.ObjectId, ref: "Inventory" },
  foodItem: foodItemSchema,
  date: Date,
  removeReason: { type: String, enum: removeReasons },
});

const InventoryRemoveAction = mongoose.model(
  "InventoryRemoveAction",
  inventoryRemoveActionSchema
);

export default InventoryRemoveAction;

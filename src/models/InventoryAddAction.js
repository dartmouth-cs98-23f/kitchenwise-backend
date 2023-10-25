import mongoose from "mongoose";
import { foodItemSchema } from "./FoodItem";

export const inventoryAddActionSchema = new mongoose.Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: "User" },
  inventoryId: { type: Schema.Types.ObjectId, ref: "Inventory" },
  foodItem: foodItemSchema,
  date: Date,
});

const InventoryAddAction = mongoose.model(
  "InventoryAddAction",
  inventoryAddActionSchema
);

export default InventoryAddAction;

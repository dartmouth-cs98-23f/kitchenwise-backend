import mongoose, { SchemaTypes } from "mongoose";
import { foodItemSchema } from "./FoodItem.js";

const inventorySchema = new mongoose.Schema({
  title: String,
  ownerId: { type: SchemaTypes.ObjectId, ref: "User" },
  sharedUsers: [{ type: SchemaTypes.ObjectId, ref: "User" }],
  foodItems: [foodItemSchema],
});

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;

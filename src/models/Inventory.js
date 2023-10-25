import mongoose from "mongoose";
import { foodItemSchema } from "./FoodItem";

const inventorySchema = new mongoose.Schema({
  title: String,
  ownerId: { type: Schema.Types.ObjectId, ref: "User" },
  sharedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  foodItems: [foodItemSchema],
});

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;

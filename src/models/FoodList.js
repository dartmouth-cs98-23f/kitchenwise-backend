import mongoose from "mongoose";
import { foodItemSchema } from "./FoodItem.js";

// This schema is intended to be used for shopping lists. Has overlap with other models though
const foodListSchema = new mongoose.Schema({
  title: String,
  ownerId: { type: Schema.Types.ObjectId, ref: "User" },
  // If this is undefined then it's accessible by all users
  //    if it is empty then only the owner can use it
  sharedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  foodItems: [foodItemSchema],
});

const FoodList = mongoose.model("FoodList", foodListSchema);

export default FoodList;

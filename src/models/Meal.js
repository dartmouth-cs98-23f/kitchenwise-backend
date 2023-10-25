import mongoose from "mongoose";
import { foodItemSchema } from "./FoodItem.js";

const mealSchema = new mongoose.Schema({
  title: String,
  ownerId: { type: Schema.Types.ObjectId, ref: "User" },
  foodItems: [foodItemSchema],
  preparationDate: Date,
});

const Meal = mongoose.model("Meal", mealSchema);

export default Meal;

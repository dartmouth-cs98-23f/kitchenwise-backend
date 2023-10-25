import mongoose, { SchemaTypes } from "mongoose";
import { foodItemSchema } from "./FoodItem.js";

const mealSchema = new mongoose.Schema({
  title: String,
  ownerId: { type: SchemaTypes.ObjectId, ref: "User" },
  foodItems: [foodItemSchema],
  preparationDate: Date,
});

const Meal = mongoose.model("Meal", mealSchema);

export default Meal;

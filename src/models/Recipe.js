import mongoose from "mongoose";
import { foodItemSchema } from "./FoodItem";

const recipeStageSchema = new mongoose.Schema({
  name: String,
  foodRequired: [foodItemSchema],
  // In minutes
  timeRequired: Number,
  description: String,
});

const recipeSchema = new mongoose.Schema({
  title: String,
  stages: [recipeStageSchema],
  ownerId: { type: Schema.Types.ObjectId, ref: "User" },
  sharedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

const Recipe = mongoose.model("Recipe", recipeSchema);

export default Recipe;

import mongoose, { SchemaTypes } from "mongoose";
import { foodItemSchema } from "./FoodItem.js";

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
  ownerId: { type: SchemaTypes.ObjectId, ref: "User" },
  sharedUsers: [{ type: SchemaTypes.ObjectId, ref: "User" }],
});

const Recipe = mongoose.model("Recipe", recipeSchema);

export default Recipe;

import mongoose, { SchemaTypes } from "mongoose";
import { foodItemSchema } from "./FoodItem.js";

const recipeStageSchema = new mongoose.Schema({
  name: String,
  ingredients: [String],
  // In minutes
  timeRequired: { number: Number, quantity: String },
  description: String,
});

export const recipeSchema = new mongoose.Schema({
  title: String,
  stages: { type: SchemaTypes.Map, of: [recipeStageSchema] },
  ingredients: [foodItemSchema],
  equipment: [String],
  // In minutes
  cookTime: Number,
  image: String,
  // Exists on recipes imported from spoonacular
  spoonacularId: Number,
  ownerId: { type: SchemaTypes.ObjectId, ref: "User" },
  sharedUsers: [{ type: SchemaTypes.ObjectId, ref: "User" }],
  ownedIngredients: [String],
  missingIngredients: [String],
});

// Ensuring that users' recipe titles don't overlap for the sake of Alexa
recipeSchema.index({ ownerId: 1, title: 1 }, { unique: true });

const Recipe = mongoose.model("Recipe", recipeSchema);

export default Recipe;

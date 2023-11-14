import User from "../models/User.js";
import { getAllUserFoodItems } from "./inventory-service.js";
import { labelIngredients } from "./recipe-service.js";

export const getUserById = async (userId) => {
  return await User.findById(userId);
};

export const setSuggestedRecipes = async (userId, recipes) => {
  const user = await User.findById(userId);
  user.suggestedRecipes = {
    dateSuggested: new Date(),
    recipes,
  };
  return await user.save();
};

export const clearSuggestedRecipes = async (userId) => {
  return await User.findByIdAndUpdate(userId, { suggestedRecipes: null });
};

export const getSuggestedRecipes = async (userId) => {
  const foodItems = await getAllUserFoodItems(userId);
  const suggestedRecipes = (await getUserById(userId)).suggestedRecipes;
  suggestedRecipes.recipes = suggestedRecipes.recipes.map((rec) =>
    labelIngredients(rec, foodItems)
  );
  return suggestedRecipes;
};

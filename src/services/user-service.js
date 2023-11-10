import User from "../models/User.js";

export const getUserById = async (userId) => {
  return await User.findById(userId);
};

export const setSuggestedRecipes = async (userId, recipes) => {
  const user = await User.findById(userId);
  user.suggestedRecipes = {
    suggestedDate: Date.now(),
    recipes,
  };
  return await user.save();
};

export const clearSuggestedRecipes = async (userId) => {
  return await User.findByIdAndUpdate(userId, { suggestedRecipes: null });
};

export const getSuggestedRecipes = async (userId) => {
  return (await getUserById(userId)).suggestedRecipes;
};

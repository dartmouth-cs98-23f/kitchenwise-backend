import axios, { all } from "axios";
import dotenv from "dotenv";
import { Types } from "mongoose";
import fs, { readFileSync } from "fs";
dotenv.config();
import { getUserFoodSamples } from "./inventory-service.js";
import Recipe from "../models/Recipe.js";
import { setSuggestedRecipes } from "./user-service.js";

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_URL = "https://api.spoonacular.com/recipes";

const SPOONACULAR_AUTH = {
  "x-api-key": SPOONACULAR_API_KEY,
};

// Fetch recipes from here while testing instead of using up API balance.
const CACHED_RECIPES_PATH = "cached-recipes.json";

export const getRecipeById = async (recipeId) => {
  const recipe = await Recipe.findById(recipeId);
  return recipe;
};

export const generateSuggestedRecipes = async (
  userId,
  saveToUser = false,
  numResults = 10
) => {
  const foodSamples = await getUserFoodSamples(userId);
  // Creates array of unique names
  const foodSampleNames = Array.from(
    new Set(foodSamples.map((foodItem) => foodItem.name))
  ).join(",");
  let recipes;
  recipes = (
    await axios.get(SPOONACULAR_URL + "/findByIngredients", {
      params: {
        ingredients: foodSampleNames,
        limitLicense: true,
        ranking: 1,
        ignorePantry: true,
        number: numResults,
      },
      headers: SPOONACULAR_AUTH,
    })
  ).data;
  for (let i = 0; i < recipes.length; i++) {
    recipes[i] = await getSpoonacularSteps(recipes[i]);
  }
  // fs.writeFileSync(CACHED_RECIPES_PATH, JSON.stringify(recipes));
  // recipes = JSON.parse(readFileSync(CACHED_RECIPES_PATH, "utf8"));
  recipes = recipes.map((spoonacularRecipe) =>
    spoonacularToRecipe(spoonacularRecipe)
  );
  if (saveToUser) await setSuggestedRecipes(userId, recipes);
  return recipes;
};

// Takes a natural language string query and fetches from spoonacular from it
export const searchFoodtacularRecipes = async (
  searchQuery,
  numResults = 10
) => {
  let recipes;
  recipes = (
    await axios.get(SPOONACULAR_URL + "/complexSearch", {
      params: {
        query: searchQuery,
        instructionsRequired: true,
        fillIngredients: true,
        addRecipeInformation: false,
        addRecipeNutrition: false,
        ignorePantry: true,
        number: numResults,
      },
      headers: SPOONACULAR_AUTH,
    })
  ).data.results;
  for (let i = 0; i < recipes.length; i++) {
    recipes[i] = await getSpoonacularSteps(recipes[i]);
  }
  // fs.writeFileSync(CACHED_RECIPES_PATH, JSON.stringify(recipes));
  // recipes = JSON.parse(readFileSync(CACHED_RECIPES_PATH, "utf8"));
  recipes = recipes.map((spoonacularRecipe) =>
    spoonacularToRecipe(spoonacularRecipe)
  );
  return recipes;
};

export const saveSpoonacularRecipe = async (userId, foodtacularId) => {
  let recipe;
  recipe = (
    await axios.get(
      SPOONACULAR_URL + `/${foodtacularId.toString()}/information`,
      { headers: SPOONACULAR_AUTH }
    )
  ).data;
  recipe = await getSpoonacularSteps(recipe);
  recipe = spoonacularToRecipe(recipe);
  recipe.ownerId = new Types.ObjectId(userId);
  return await recipe.save();
};

export const getSavedRecipes = async (userId) => {
  userId = new Types.ObjectId(userId);
  const recipes = await Recipe.find({
    $or: [{ ownerId: userId }, { sharedUsers: { $in: [userId] } }],
  });
  return recipes;
};

const getSpoonacularSteps = async (spoonacularRecipe) => {
  spoonacularRecipe.stages = (
    await axios.get(
      SPOONACULAR_URL + `/${spoonacularRecipe.id}/analyzedInstructions`,
      { headers: SPOONACULAR_AUTH }
    )
  ).data;
  return spoonacularRecipe;
};

const spoonacularToRecipe = (spoonacularRecipe) => {
  const recipe = new Recipe();
  recipe.title = spoonacularRecipe.title;
  recipe.image = spoonacularRecipe.image;
  recipe.spoonacularId = spoonacularRecipe.id;
  recipe.equipment = [];
  recipe.stages = Object.values(spoonacularRecipe.stages).reduce(
    (prev, currStage) => {
      currStage.steps = currStage.steps.map((spoonStage) => ({
        description: spoonStage.step,
        timeRequired: spoonStage.length,
        ingredients: spoonStage.ingredients.map(
          (spoonIngredient) => spoonIngredient.name
        ),
      }));
      prev[currStage.name.replace(".", ",")] = currStage.steps;
      return prev;
    },
    {}
  );
  let allIngredients = [];
  if (spoonacularRecipe?.extendedIngredients)
    allIngredients = allIngredients.concat(
      spoonacularRecipe?.extendedIngredients
    );
  if (spoonacularRecipe?.missedIngredients)
    allIngredients = allIngredients.concat(
      spoonacularRecipe?.missedIngredients
    );
  if (spoonacularRecipe?.usedIngredients)
    allIngredients = allIngredients.concat(spoonacularRecipe?.usedIngredients);

  recipe.ingredients = allIngredients.map((spoonIngredient) => ({
    name: spoonIngredient?.extendedName || spoonIngredient.name,
    unit: spoonIngredient?.unitShort || spoonIngredient.unit,
    quantity: spoonIngredient.quantity,
  }));
  return recipe;
};

import axios from "axios";
import dotenv from "dotenv";
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

export const generateSuggestedRecipes = async (userId, saveToUser = false) => {
  const foodSamples = await getUserFoodSamples(userId);
  // Creates array of unique names
  const foodSampleNames = Array.from(
    new Set(foodSamples.map((foodItem) => foodItem.name))
  ).join(",");
  let recipes;
  //   recipes = (
  //     await axios.get(SPOONACULAR_URL + "/findByIngredients", {
  //       params: {
  //         ingredients: foodSampleNames,
  //         limitLicense: true,
  //         ranking: 1,
  //         ignorePantry: true,
  //       },
  //       headers: SPOONACULAR_AUTH,
  //     })
  //   ).data;
  //   for (let i = 0; i < recipes.length; i++) {
  //     recipes[i].stages = (
  //       await axios.get(
  //         SPOONACULAR_URL + `/${recipes[i].id}/analyzedInstructions`,
  //         { headers: SPOONACULAR_AUTH }
  //       )
  //     ).data;
  //     // break;
  //   }
  // fs.writeFileSync(CACHED_RECIPES_PATH, JSON.stringify(recipes));
  recipes = JSON.parse(readFileSync(CACHED_RECIPES_PATH, "utf8"));
  recipes = recipes.map((spoonacularRecipe) =>
    spoonacularToRecipe(spoonacularRecipe)
  );
  if (saveToUser) await setSuggestedRecipes(userId, recipes);
  return recipes;
};

const spoonacularToRecipe = (spoonacularRecipe) => {
  const recipe = new Recipe();
  recipe.title = spoonacularRecipe.title;
  recipe.image = spoonacularRecipe.image;
  recipe.stages = Object.values(spoonacularRecipe.stages).reduce(
    (prev, currStage) => {
      currStage.steps = currStage.steps.map((spoonStage) => ({
        description: spoonStage.step,
        timeRequired: spoonStage.length,
        ingredients: spoonStage.ingredients.map(
          (spoonIngredient) => spoonIngredient.name
        ),
      }));
      prev[currStage.name] = currStage.steps;
      return prev;
    },
    {}
  );
  const allIngredients = [
    ...spoonacularRecipe.missedIngredients,
    ...spoonacularRecipe.usedIngredients,
  ];
  recipe.ingredients = allIngredients.map((spoonIngredient) => ({
    name: spoonIngredient?.extendedName || spoonIngredient.name,
    unit: spoonIngredient?.unitShort || spoonIngredient.unit,
    quantity: spoonIngredient.quantity,
  }));
  return recipe;
};

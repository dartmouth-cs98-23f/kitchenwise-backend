import express from "express";
import {
  generateSuggestedRecipes,
  getSavedRecipes,
  saveSpoonacularRecipe,
} from "../services/recipe-service.js";
import { getSuggestedRecipes } from "../services/user-service.js";

const recipeRouter = express.Router();

recipeRouter.get("/saved", async (req, res, next) => {
  try {
    const { userId } = req.query;
    const recipes = await getSavedRecipes(userId);
    res.json(recipes).end();
  } catch (err) {
    next(err);
  }
});

recipeRouter.get("/suggested", async (req, res, next) => {
  try {
    const { userId, refresh } = req.query;
    let recipes;
    if (refresh) recipes = await generateSuggestedRecipes(userId, true);
    else {
      recipes = (await getSuggestedRecipes(userId))?.recipes;
      if (!recipes || recipes.length == 0) {
        recipes = await generateSuggestedRecipes(userId, true);
      }
    }
    res.json(recipes).end();
  } catch (err) {
    next(err);
  }
});

recipeRouter.post("/save", async (req, res, next) => {
  try {
    const { userId, recipeId } = req.body;
    const recipe = await saveSpoonacularRecipe(userId, recipeId);
    res.json(recipe).end();
  } catch (err) {
    next(err);
  }
});

export default recipeRouter;

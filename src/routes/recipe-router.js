import express from "express";
import { ServerError } from "../util.js";
import {
  generateSuggestedRecipes,
  getRecipeById,
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

recipeRouter.get("/", async (req, res, next) => {
  try {
    const { recipeId } = req.query;
    const recipe = await getRecipeById(recipeId);
    if (!recipe) res.status(404).end();
    else res.json(recipe).end();
  } catch (err) {
    next(err);
  }
});

recipeRouter.post("/save", async (req, res, next) => {
  try {
    const { userId, recipeId } = req.body;
    try {
      const recipe = await saveSpoonacularRecipe(userId, recipeId);
      res.json(recipe).end();
    } catch (err) {
      if (err?.code && err.code == 11000) {
        throw new ServerError(`You have already saved this recipe.`, 400);
      }
    }
  } catch (err) {
    next(err);
  }
});

//TODO: build out logic for removing ingredients based on what recipe was cooked/logged
recipeRouter.post("/log", async (req, res, next) => {
  try {
    const { userId, recipeId } = req.body;
    res.status(200).end();
  } catch (err) {
    next(err);
  }
});

export default recipeRouter;

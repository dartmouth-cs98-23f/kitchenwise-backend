import express from "express";

const shoppingListRouter = express.Router();

shoppingListRouter.post("/create", async (req, res, next) => {
  try {
    
  } catch (err) {
    next(err);
  }
});
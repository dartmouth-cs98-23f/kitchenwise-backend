import express from "express";
import {
  createNewShoppingList,
  getUserShoppingLists,
  getAllUserShoppingItems,
  addShoppingListItems
} from "../services/shoppinglist-service.js";
import ShoppingList from "../models/ShoppingList.js";
import { isMongoDuplicate } from "../util.js"; 

const shoppingListRouter = express.Router();

shoppingListRouter.post("/create", async (req, res, next) => {
  try {
    const { title, userId } = req.body;
    try {
      const shoppingList = await createNewShoppingList(title, userId);
      res.json(shoppingList).end();
    } catch (err) {
      if (isMongoDuplicate) {
        throw new Error("User cannot have two inventories with same name");
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }

});


shoppingListRouter.get("/all", async (req, res, next) => {
  try {
    const { userId } = req.query;
    const lists = await getUserShoppingLists(userId);
    res.json(lists).end();
  } catch (err) {
    next(err);
  }
});

shoppingListRouter.get("/allitems", async (req, res, next) => {
  try {
    const { userId } = req.query;
    const shoppingItems = await getAllUserShoppingItems(userId);
    res.json(shoppingItems).end();
  } catch (err) {
    next(err);
  }
});


shoppingListRouter.put("/additem", async (req, res, next) => {
  try {
    const { userId, title, foodItem, foodAmount } = req.body;
    const items = await addShoppingListItems(userId, title, foodItem, foodAmount)
    res.json(items).end()
  } catch (err) {
    next(err);
  }
});

export default shoppingListRouter;
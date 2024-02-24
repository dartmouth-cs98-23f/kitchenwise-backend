import express from "express";
import {
  createNewShoppingList,
  getUserShoppingLists,
  addShoppingListItems,
  getUserShoppingList,
} from "../services/shoppinglist-service.js";
import ShoppingList from "../models/ShoppingList.js";
import { isMongoDuplicate } from "../util.js";
import { Types } from "mongoose";

const shoppingListRouter = express.Router();

shoppingListRouter.post("/create", async (req, res, next) => {
  try {
    const { title, userId } = req.body;
    try {
      const shoppingList = await createNewShoppingList(title, userId);
      res.json(shoppingList).end();
    } catch (err) {
      if (isMongoDuplicate) {
        throw new Error("User cannot have two shopping lists with same name");
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
    const { userId, title } = req.query;
    const shoppinglist = await getUserShoppingList(userId, title);

    if(shoppinglist.length > 0) {
      res.json(shoppinglist[0].shoppingListItems).end();
    } else {
      res.send(shoppinglist) // this is a an empy list
    }
     
  } catch (err) {
    next(err);
  }
});

shoppingListRouter.get("/import", async (req, res, next) => {
  try {
    const { userId, title } = req.query;
    const shoppinglist = await getUserShoppingList(userId, title);

    if(shoppinglist.length > 0) {
      res.json(shoppinglist[0].shoppingListItems).end();
    } else {
      res.send(shoppinglist) // this is a an empy list
    }
     
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

shoppingListRouter.delete("/delete",  async (req, res, next) => {
  const { userId, title, itemId } = req.body;
  
  try {
    // Find the shopping list based on userId and title
    const shoppingList = await ShoppingList.findOne({ ownerId: new Types.ObjectId(userId), title });

    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }

    // Find the index of the item to delete
    const index = shoppingList.shoppingListItems.findIndex(item => item._id.toString() === itemId);

    if (index === -1) {
      return res.status(404).json({ message: 'Item not found in shopping list' });
    }

    // Remove the item from the shoppingListItems array
    shoppingList.shoppingListItems.splice(index, 1);

    // Save the updated shopping list
    await shoppingList.save();

    return res.status(200).json({ message: 'Item deleted from shopping list' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
})

export default shoppingListRouter;
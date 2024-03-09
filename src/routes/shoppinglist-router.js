import express from "express";
import {
  createNewShoppingList,
  getUserShoppingLists,
  addShoppingListItem,
  getUserShoppingList,
  deleteItemFromList,
  addShoppingListItems,
} from "../services/shoppinglist-service.js";
import ShoppingList from "../models/ShoppingList.js";
import { isMongoDuplicate } from "../util.js";
import { Types } from "mongoose";
import Inventory from "../models/Inventory.js";
import FoodItem from "../models/FoodItem.js";
import InventoryAddAction from "../models/InventoryAddAction.js";
import InventoryRemoveAction from "../models/InventoryRemoveAction.js";
import ShoppingListItem from "../models/ShoppingListItem.js";

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

    if (shoppinglist.length > 0) {
      res.json(shoppinglist[0].shoppingListItems).end();
    } else {
      res.send(shoppinglist); // this is a an empy list
    }
  } catch (err) {
    next(err);
  }
});

shoppingListRouter.get("/import", async (req, res, next) => {
  try {
    const { userId, title } = req.query;
    const shoppinglist = await getUserShoppingList(userId, title);

    if (shoppinglist.length > 0) {
      res.json(shoppinglist[0].shoppingListItems).end();
    } else {
      res.send(shoppinglist); // this is a an empy list
    }
  } catch (err) {
    next(err);
  }
});

shoppingListRouter.put("/additem", async (req, res, next) => {
  try {
    const { userId, title, foodItem, foodAmount, unit } = req.body;
    const items = await addShoppingListItem(
      userId,
      title,
      foodItem,
      foodAmount,
      unit
    );

    res.json(items).end();
  } catch (err) {
    next(err);
  }
});

shoppingListRouter.delete("/deletelist", async (req, res, next) => {
  const { listName } = req.body;
  try {
    // Find the shopping list by ID and delete it
    // Find the shopping list by name and delete it
    const deletedList = await ShoppingList.findOneAndDelete({
      title: listName,
    });
    if (!deletedList) {
      // If the shopping list was not found, return a 404 status
      return res.status(404).json({ message: "Shopping list not found" });
    }

    // Return a success message
    return res.json({ message: "Shopping list deleted successfully" });
  } catch (error) {
    // Return an error message if something went wrong
    console.error("Error deleting shopping list:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

shoppingListRouter.delete("/delete", async (req, res, next) => {
  const { userId, title, itemId } = req.body;

  try {
    // Find the shopping list based on userId and title
    const shoppingList = await ShoppingList.findOne({
      ownerId: new Types.ObjectId(userId),
      title,
    });

    deleteItemsFromList(shoppingList);

    // Save the updated shopping list
    await shoppingList.save();

    return res.status(200).json({ message: "Item deleted from shopping list" });
  } catch (err) {
    next(err);
  }
});

// Route to handle exporting shopping list items to an inventory
shoppingListRouter.post("/export", async (req, res, next) => {
  const { userId, listName, items, inv } = req.body;
  let inventoryName = inv.title;
  try {
    // Find the inventory by name and owner ID
    const inventory = await Inventory.findOne({
      title: inventoryName,
      ownerId: userId,
    });

    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    // Iterate over each item and add it to the inventory
    for (const item of req.body.items) {
      const { title, amount, price, importance } = item;

      // Check if an item with the same name and title exists
      const existingItemIndex = inventory.foodItems.findIndex(
        (existingItem) => existingItem.name === title
      );

      if (existingItemIndex !== -1) {
        // If the item exists, update its quantity
        inventory.foodItems[existingItemIndex].quantity += amount;
      } else {
        // If the item does not exist, add it to the inventory
        const foodItem = new FoodItem({
          name: title,
          quantity: amount,
        });
        inventory.foodItems.push(foodItem);
      }

      // Clear the shopping list item from the shopping list
      await deleteItemFromList(listName, title);
    }

    // Save the inventory with the new foodItems
    await inventory.save();

    res.status(200).json({ message: "Items exported successfully" });
  } catch (error) {
    console.error(error);
    next(err);
  }
});

// Route to import items from user history into a shopping list
shoppingListRouter.post("/import", async (req, res) => {
  const { userId, title } = req.body;

  try {
    // Find all add actions  and remove actions for the user
    const addActions = await InventoryAddAction.find({ ownerId: userId });
    const removeActions = await InventoryRemoveAction.find({ ownerId: userId });

    if (addActions.length < 1 || removeActions.length < 1) {
      return res
        .status(400)
        .json({ message: "No User History, add items manualy" });
    }

    // Initialize a map to store item scores based on their names
    const itemScores = new Map();

    // Compute scores for items based on add and remove actions
    addActions.forEach((addAction) => {
      const itemName = addAction.foodItem.name;
      const score = itemScores.get(itemName) || 0;
      itemScores.set(itemName, score + 1);
    });

    removeActions.forEach((removeAction) => {
      const itemName = removeAction.foodItem.name;
      const score = itemScores.get(itemName) || 0;
      itemScores.set(itemName, score + 2);
    });

    // Filter items based on score threshold and add them to the shopping list
    const itemsToAdd = [];
    itemScores.forEach((score, itemName) => {
      if (score >= 3) {
        // TODO: might need to change threshold
        // Find the most recently used quantity from addActions
        const mostRecentAddAction = addActions
          .filter((addAction) => addAction.foodItem.name === itemName)
          .sort((a, b) => b.date - a.date)[0]; // Sort by date in descending order and get the first item
        const quantity = mostRecentAddAction
          ? mostRecentAddAction.foodItem.quantity
          : 1;
        const newItem = new ShoppingListItem({
          title: itemName,
          amount: quantity,
          price: 0,
          importance: 0,
        });
        itemsToAdd.push(newItem);
      }
    });

    // Create a new shopping list and add the items to it
    if (itemsToAdd.length > 0) {
      let shoppingList = await createNewShoppingList(title, userId);
      shoppingList = await addShoppingListItems(
        userId,
        shoppingList.title,
        itemsToAdd
      );
      return res.send(shoppingList).status(200);
    } else {
      return res
        .status(400)
        .json({ message: "Need to build a history add items manually" });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

export default shoppingListRouter;

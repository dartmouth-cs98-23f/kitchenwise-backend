import express from "express";
import {
  createNewInventory,
  getAllUserFoodItems,
  getUserInventories,
} from "../services/inventory-service.js";
import { isMongoDuplicate } from "../util.js";

const inventoryRouter = express.Router();

inventoryRouter.get("/all", async (req, res, next) => {
  try {
    const { userId } = req.query;
    const inventories = await getUserInventories(userId);
    res.json(inventories).end();
  } catch (err) {
    next(err);
  }
});

inventoryRouter.get("/allitems", async (req, res, next) => {
  try {
    const { userId } = req.query;
    const foodItems = await getAllUserFoodItems(userId);
    res.json(foodItems).end();
  } catch (err) {
    next(err);
  }
});

inventoryRouter.post("/create", async (req, res, next) => {
  try {
    const { title, userId } = req.body;
    try {
      const inventory = await createNewInventory(title, userId);
      res.json(inventory).end();
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

inventoryRouter.get("/items", (req, res) => {});

export default inventoryRouter;

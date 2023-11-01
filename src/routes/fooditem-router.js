import express from "express";
import {
  locationNameToInventory,
  addFoodItem,
  getUserDefaultInventory,
  getInventoryFromFood,
  deleteFoodItem,
} from "../services/inventory-service.js";
import { createAddAction } from "../services/addaction-service.js";

// Even though FoodItem isn't a proper model, we give it its own router because these functions interact with many models
const foodItemRouter = express.Router();

foodItemRouter.post("/additem", async (req, res, next) => {
  try {
    // current schema of `food` is {quantity: string, foodString:string }
    const { location, userId, food } = req.body;
    let targetInventory = null;
    // TODO: should the default inventory be a fallback if the specified location can't be found?
    if (location) {
      targetInventory = await locationNameToInventory(location, userId);
    } else {
      targetInventory = await getUserDefaultInventory(userId);
    }
    if (!targetInventory) {
      return res
        .status(404)
        .json({ message: `Inventory '${location}' not found.` });
    }
    const addAction = createAddAction(food, targetInventory._id, userId);
    // const updatedInventory = await addFoodItem(food, targetInventory._id);
    if (updatedInventory) {
      return res
        .status(200)
        .json({ location: updatedInventory.title, food })
        .end();
    } else {
      return res
        .status(500)
        .json({ message: `Unable to add ${food.title} to inventory` });
    }
  } catch (err) {
    next(err);
  }
});

foodItemRouter.delete("/deleteitem", async (req, res, next) => {
  try {
    const { location, userId, food } = req.body;
    const foodLocation = location
      ? await locationNameToInventory(location, userId)
      : await getInventoryFromFood(food, userId);
    if (!foodLocation) {
      return res
        .status(404)
        .json({ message: `Unable to find inventory for ${food.title}` });
    }
    if (Array.isArray(foodLocation))
      return res.status(300).json({ inventoryChoices: foodLocation });
    const updatedInventory = await deleteFoodItem(food, foodLocation._id);
    return res
      .status(200)
      .json({ location: updatedInventory.title, food })
      .end();
  } catch (err) {
    next(err);
  }
});

export default foodItemRouter;

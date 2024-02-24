import express from "express";
import {
  getUserDefaultInventory,
  getInventoryFromFood,
  removeFoodItem,
  getInventoryById,
  updateInventoryItem,
  locationNameToInventory,
} from "../services/inventory-service.js";
import { createAddAction } from "../services/addaction-service.js";

// Even though FoodItem isn't a proper model, we give it its own router because these functions interact with many models
const foodItemRouter = express.Router();

foodItemRouter.post("/additem", async (req, res, next) => {
  try {
    // current schema of `food` is {quantity: string, foodString:string }
    const { userId, inventoryId, foodItem } = req.body;
    let targetInventory = null;
    // TODO: should the default inventory be a fallback if the specified location can't be found?
    if (inventoryId) {
      targetInventory = await getInventoryById(inventoryId);
    } else {
      targetInventory = await getUserDefaultInventory(userId);
    }
    if (!targetInventory) {
      return res
        .status(404)
        .json({ message: `Inventory '${location}' not found.` });
    }
    const addAction = await createAddAction(
      foodItem,
      targetInventory._id,
      userId
    );
    if (addAction) {
      return res
        .status(200)
        .json({ location: targetInventory.title, foodItem, action: addAction })
        .end();
    } else {
      return res
        .status(500)
        .json({ message: `Unable to add ${foodItem.name} to inventory` })
        .end();
    }
  } catch (err) {
    next(err);
  }
});

foodItemRouter.post("/additems", async (req, res, next) => {
  try {
    const { foodItems, userId } = req.body;
    const addActionPromises = [];
    const defaultInventory = await getUserDefaultInventory(userId);
    for (const item of foodItems) {
      const { location, name, ...foodItem } = item;
      foodItem.foodString = name;
      const inventory = await locationNameToInventory(location, userId);
      addActionPromises.push(
        createAddAction(
          foodItem,
          inventory?._id || defaultInventory?._id,
          userId
        )
      );
    }
    const result = await Promise.all(addActionPromises);
    res.json(result).end();
  } catch (err) {
    next(err);
  }
});

foodItemRouter.delete("/deleteitem", async (req, res, next) => {
  try {
    const { inventoryId, userId, food } = req.body;
    const foodLocation = inventoryId
      ? await getInventoryById(inventoryId)
      : await getInventoryFromFood(food, userId);
    if (!foodLocation) {
      return res
        .status(404)
        .json({ message: `Unable to find inventory for ${food.title}` });
    }
    if (Array.isArray(foodLocation))
      return res.status(300).json({ inventoryChoices: foodLocation });
    const updatedInventory = await removeFoodItem(food, foodLocation._id);
    return res
      .status(200)
      .json({ location: updatedInventory.title, food })
      .end();
  } catch (err) {
    next(err);
  }
});

foodItemRouter.patch("/edititem", async (req, res, next) => {
  try {
    const { inventoryId, foodItemId, newFoodItem } = req.body;
    const inventory = await updateInventoryItem(
      inventoryId,
      foodItemId,
      newFoodItem
    );
    res.json(inventory).end();
  } catch (err) {
    next(err);
  }
});

export default foodItemRouter;

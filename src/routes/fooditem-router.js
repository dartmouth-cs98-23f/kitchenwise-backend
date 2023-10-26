import express from "express";
import {
  locationNameToInventory,
  addFoodItem,
  getUserDefaultInventory,
} from "../services/inventory-service.js";

// Even though FoodItem isn't a proper model, we give it its own router because these functions interact with many models
const foodItemRouter = express.Router();

foodItemRouter.post("/additem", async (req, res) => {
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
  const updatedInventory = await addFoodItem(food, targetInventory._id);
  if (updatedInventory) {
    res.json({ location: updatedInventory.title, food });
    return res.status(200).end();
  } else {
    return res
      .status(500)
      .json({ message: `Unable to add ${food.title} to inventory` });
  }
});

foodItemRouter.delete("/deleteitem", (req, res) => {});

export default foodItemRouter;

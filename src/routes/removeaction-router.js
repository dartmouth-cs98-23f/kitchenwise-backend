import express from "express";
import { createRemoveAction } from "../services/removeaction-service.js";

const removeActionRouter = express.Router();

removeActionRouter.get("/history", (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});

removeActionRouter.post("/create", async (req, res, next) => {
  try {
    const { foodItem, inventoryId, userId } = req.body;
    const result = await createRemoveAction(foodItem, inventoryId, userId);
    res.json(result).end();
  } catch (err) {
    next(err);
  }
});

export default removeActionRouter;

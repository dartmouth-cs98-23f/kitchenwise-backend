import express from "express";
import { getUserInventories } from "../services/inventory-service.js";

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

inventoryRouter.get("/get", (req, res) => {});

inventoryRouter.get("/items", (req, res) => {});

export default inventoryRouter;

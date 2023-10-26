import express from "express";
import foodItemRouter from "./fooditem-router.js";
import foodListRouter from "./foodlist-router.js";
import inventoryRouter from "./inventory-router.js";
import mealRouter from "./meal-router.js";
import recipeRouter from "./recipe-router.js";
import userRouter from "./user-router.js";

const indexRouter = express.Router();

indexRouter.get("/", (req, res) => {
  res.end("Hello world");
});

indexRouter.use("/fooditem", foodItemRouter);
indexRouter.use("/foodlist", foodListRouter);
indexRouter.use("/inventory", inventoryRouter);
indexRouter.use("/meal", mealRouter);
indexRouter.use("/recipe", recipeRouter);
indexRouter.use("/user", userRouter);

export default indexRouter;
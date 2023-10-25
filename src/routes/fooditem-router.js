import express from "express";

// Even though FoodItem isn't a proper model, we give it its own router because these functions interact with many models
const foodItemRouter = express.Router();

foodItemRouter.post("/additem", (req, res) => {});

foodItemRouter.delete("/deleteitem", (req, res) => {});

export default foodItemRouter;

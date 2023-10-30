import express from "express";

const recipeRouter = express.Router();

recipeRouter.post("/create", (req, res) => {});

recipeRouter.patch("/edit", (req, res) => {});

recipeRouter.get("/get", (req, res) => {});

export default recipeRouter;

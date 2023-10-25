import express from "express";

const foodListRouter = express.Router();

foodListRouter.get("/get", (req, res) => {});

foodListRouter.post("/create", (req, res) => {});

foodListRouter.patch("/edit", (req, res) => {});

export default foodListRouter;

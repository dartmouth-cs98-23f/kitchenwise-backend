import express from "express";
import { getPendingAddAction } from "../services/addaction-service.js";

const addActionRouter = express.Router();

addActionRouter.get("/pending", async (req, res, next) => {
  try {
    const { userId } = req.query;
    const action = await getPendingAddAction(userId);
    res.json(action).end();
  } catch (err) {
    next(err);
  }
});

addActionRouter.get("/history", (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});

addActionRouter.post("/confirm", (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});

addActionRouter.post("/reject", (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});

addActionRouter.patch("/revise", (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});

export default addActionRouter;

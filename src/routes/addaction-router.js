import express from "express";
import {
  confirmAddAction,
  getPendingAddAction,
  rejectAddAction,
} from "../services/addaction-service.js";

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

addActionRouter.post("/confirm", async (req, res, next) => {
  try {
    const { actionId } = req.body;
    const action = await confirmAddAction(actionId);
    res.json(action).end();
  } catch (err) {
    next(err);
  }
});

addActionRouter.post("/reject", async (req, res, next) => {
  try {
    const { actionId } = req.body;
    const action = await rejectAddAction(actionId);
    res.json(action).end();
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

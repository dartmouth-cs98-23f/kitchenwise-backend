import express from "express";

const addActionRouter = express.Router();

addActionRouter.get("/pending", (req, res, next) => {
  try {
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

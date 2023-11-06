import express from "express";

const deleteActionRouter = express.Router();

deleteActionRouter.get("/history", (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});

export default deleteActionRouter;

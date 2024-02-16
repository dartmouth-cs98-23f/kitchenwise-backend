import express from "express";
import { getStatistics } from "../services/stats-service";

const statsRouter = express.Router();

statsRouter.get("/", async (req, res, next) => {
    const { userId } = req.query;
    try {
        const stats = await getStatistics(userId);
        res.json(stats).end();
    } catch (err) {
      next(err);
    }
  });

export default statsRouter;

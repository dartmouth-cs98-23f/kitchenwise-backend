import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import indexRouter from "./routes/index.js";
import { unrevisedAddActionListener } from "./services/addaction-service.js";

const app = express();
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    setInterval(unrevisedAddActionListener, 2000);
  });

app.use("/", indexRouter);

app.use(function (err, req, res, next) {
  console.error(err);
  res
    .status(err.code || 500)
    .json({ message: err.message })
    .end();
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port", PORT);
});

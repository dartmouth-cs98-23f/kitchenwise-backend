import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import indexRouter from "./routes/index.js";

const app = express();
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
  });

app.use("/", indexRouter);

app.use(function (err, req, res, next) {
  res
    .status(err.code || 500)
    .json({ message: err.message })
    .end();
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port", PORT);
});

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import indexRouter from "./routes/index.js";

const app = express();

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
});

const db = mongoose.connection;

db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Mongoose"));

app.use("/", indexRouter);

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port", PORT);
});

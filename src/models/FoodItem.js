import mongoose from "mongoose";
import { ServerError } from "../util.js";

export const foodItemSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  unit: String,
  tags: [String],
  expirationDate: Date,
});

foodItemSchema.pre("save", function (next) {
  if (this.quantity < 0) {
    throw new ServerError(`${this.name} cannot have a negative quantity.`, 400);
  }
  next();
});

const FoodItem = mongoose.model("FoodItem", foodItemSchema);

export default FoodItem;

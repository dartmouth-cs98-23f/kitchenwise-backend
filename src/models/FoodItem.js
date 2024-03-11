import mongoose from "mongoose";
import { ServerError } from "../util.js";

export const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  unit: String,
  tags: [String],
  inventory: String,
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

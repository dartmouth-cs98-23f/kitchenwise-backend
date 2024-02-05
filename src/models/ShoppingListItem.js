import mongoose from "mongoose";
import { foodItemSchema } from "./FoodItem";

export const ShoppingListItemSchema = new mongoose.Schema({
  item: foodItemSchema,
  price:  mongoose.Types.Decimal128,
  importance: Number,
});
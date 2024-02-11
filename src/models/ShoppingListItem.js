import mongoose from "mongoose";
import { foodItemSchema } from "./FoodItem.js";

export const shoppingListItemSchema = new mongoose.Schema({
  title: String,
  amount: Number,
  price: Number,
  importance: Number,
});

const ShoppingListItem = mongoose.model("ShoppingListItem", shoppingListItemSchema);

export default ShoppingListItem;

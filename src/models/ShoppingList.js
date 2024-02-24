import mongoose, { SchemaTypes } from "mongoose";
import { shoppingListItemSchema } from "./ShoppingListItem.js"

const shoppingListSchema = new mongoose.Schema({
  title: String,
  ownerId: { type: SchemaTypes.ObjectId, ref: "User" },
  sharedUsers: [{ type: SchemaTypes.ObjectId, ref: "User" }],
  shoppingListItems: [shoppingListItemSchema],
  default: Boolean,
})

shoppingListSchema.index({ ownerId: 1, title: 1 }, { unique: true });

const ShoppingList = mongoose.model("ShoppingList", shoppingListSchema);

export default ShoppingList;
import mongoose, {SchemaTypes} from "mongoose";

const shoppingListSchema = new mongoose.Schema({
  title: String,
  ownerId: { type: SchemaTypes.ObjectId, ref: "User" },
  sharedUsers: [{ type: SchemaTypes.ObjectId, ref: "User" }],
  shoppingListItems: [shoppingListItemsSchema],
  default: Boolean,
})

shoppingListSchema.index({ ownerId: 1, title: 1 }, { unique: true });

const ShoppingList = mongoose.model("ShoppingList", shoppingListSchema);

export default Inventory;
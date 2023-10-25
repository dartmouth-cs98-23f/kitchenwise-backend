import mongoose from "mongoose";

export const foodItemSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  // TODO: Should this be an enum?
  unit: String,
  tags: [String],
});

const FoodItem = mongoose.model("FoodItem", foodItemSchema);

export default FoodItem;

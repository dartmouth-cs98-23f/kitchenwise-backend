import Inventory from "../models/Inventory.js";

const DEFAULT_INVENTORY_ID = "";

const parseQuantity = (rawQuantity) => {
  const quantity = rawQuantity;
  const unit = "";
  return { quantity, unit };
};

export const addFoodItem = async (
  foodItem,
  inventoryId = DEFAULT_INVENTORY_ID
) => {
  const { name, quantity: rawQuantity } = foodItem;
  const { quantity, unit } = parseQuantity(rawQuantity);
  const parsedFoodItem = { name, quantity, unit };
  await Inventory.updateOne(
    { _id: inventoryId },
    { $push: { foodItems: parsedFoodItem } }
  );
};

export const deleteFoodItem = async (
  foodItem,
  inventoryId = DEFAULT_INVENTORY_ID
) => {
  const { name, quantity: rawQuantity } = foodItem;
  const { quantity, unit } = parseQuantity(rawQuantity);
  const parsedFoodItem = { name, quantity, unit };
};

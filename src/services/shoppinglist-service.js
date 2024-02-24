import ShoppingList from "../models/ShoppingList.js";
import { Types } from "mongoose";
import ShoppingListItem from "../models/ShoppingListItem.js";
import InventoryAddAction from "../models/InventoryAddAction.js";
import InventoryRemoveAction from "../models/InventoryRemoveAction.js";

export const createNewShoppingList = async (listTitle, userId) => {
  const list = new ShoppingList();
  list.title = listTitle;
  list.ownerId = new Types.ObjectId(userId);

  const savedList = await list.save()
  return savedList;
};


export const getUserShoppingLists = async (userId) => {
  const lists = await ShoppingList.find({
    ownerId: new Types.ObjectId(userId),
  });
  return lists;
};


export let getUserShoppingList = async (userId, listTitle) => {
  try {
    const list = await ShoppingList.find({
      ownerId: new Types.ObjectId(userId),
      title: listTitle
    });
    return list;
  } catch (error) {
    // Handle errors
    console.error("Error fetching user's shopping list:", error);
    throw error;
  }
};

export const getAllUserInventoryItems = async (userId) => {
  const inventories = await getUserInventories(userId);
  let allFoodItems = [];
  for (const inv of inventories) {
    allFoodItems = allFoodItems.concat(inv.foodItems);
  }
  return allFoodItems;
};

export const addShoppingListItem= async (userId, title, foodItem, foodAmount) => {
  const item = new ShoppingListItem();
  item.title = foodItem;
  item.amount = foodAmount;
  item.importance = 0;
  item.price = 0;

  let listContainer = await getUserShoppingList(userId, title);
  let rlist = listContainer[0];
  // if (rlist == null) {
  //   rlist = await createNewShoppingList(title, userId);
  // }
  // TODO: Find a faster way to do this, db query probably is faster with hashing
  let flag = 1;
  for (let i = 0; i < rlist.shoppingListItems.length; i++) {
    let title = rlist.shoppingListItems[i].title;
    if (title === item.title) {
      rlist.shoppingListItems[i].amount += item.amount
      flag = 0;
    }
  }

  if (flag) {
    rlist.shoppingListItems.push(item);
  }

  await rlist.save();
  return rlist;
};

export const addShoppingListItems = async (userId, shoppingListName, itemsToAdd) => {
  try {
    // Find the shopping list by name
    const shoppingList = await ShoppingList.findOne({ ownerId: userId, title: shoppingListName });

    if (!shoppingList) {
      return { success: false, message: 'Shopping list not found' };
    }

    // Add each item to the shopping list
    itemsToAdd.forEach(async (item) => {
      const title = item.title;
      const amount = item.amount;
      const existingItemIndex = shoppingList.shoppingListItems.findIndex(existingItem => existingItem.title === title);

      if (existingItemIndex !== -1) {
        // If the item exists, update its quantity
        shoppingList.shoppingListItems[existingItemIndex].amount += amount;
      } else {
        // If the item does not exist, add it to the shopping list
        shoppingList.shoppingListItems.push({ title, amount });
      }
    });


    return await shoppingList.save();
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Internal server error' };
  }
};
                       

export const deleteItemFromList = async (shoppingListName, itemName) => {
   // Find the shopping list by name
   const shoppingList = await ShoppingList.findOne({ title: shoppingListName });
  
  if (!shoppingList) {
    return { status: 400, message: 'Shopping list not found' };
  }

  // Find the index of the item to delete
  const index = shoppingList.shoppingListItems.findIndex(item => item.title.toString() === itemName);

  if (index === -1) {
    return { status: 400, message: 'Item not found in shopping list' };
  }

  // Remove the item from the shoppingListItems array
  shoppingList.shoppingListItems.splice(index, 1);

  // If the shopping list is empty, delete the shopping list
  if (shoppingList.shoppingListItems.length === 0) {
    await ShoppingList.deleteOne({ _id: shoppingList._id });
    return { status: 200, message: 'Item deleted and shopping list is now empty' };
  }

  // Save the updated shopping list
  await shoppingList.save();
};






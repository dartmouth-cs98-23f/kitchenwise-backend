import ShoppingList from "../models/ShoppingList.js";
import { Types } from "mongoose";
import ShoppingListItem from "../models/ShoppingListItem.js";

export const createNewShoppingList = async (listTitle, userId) => {
  console.log("creating new list")
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

export const getAllUserShoppingItems = async (userId) => {
  const inventories = await getUserInventories(userId);
  let allFoodItems = [];
  for (const inv of inventories) {
    allFoodItems = allFoodItems.concat(inv.foodItems);
  }
  return allFoodItems;
};

export const addShoppingListItems = async (userId, title, foodItem, foodAmount) => {
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
  console.log("rlist", rlist)
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
import { compareTwoStrings } from "string-similarity";
import { Types } from "mongoose";
import Inventory from "../models/Inventory.js";
import { parseFoodItem } from "./fooditem-service.js";

export const getStatistics = async (userId) => {
    try {
      const promises = [
        getFoodInventoryGrowth(userId),
        getMoneyInventoryGrowth(userId),
        getMacronutrientComposition(userId),
        getPeakAddActionMonth(userId),
        getPeakRemoveActionMonth(userId),
        getUniqueItemsCount(userId),
        getUserRankingsPercent(userId)
      ];
  
      const results = await Promise.all(promises);
  
      return results;
    } catch (error) {
      throw error;
    }
}

export const getFoodInventoryGrowth = async (userId) => {

};

export const getMoneyInventoryGrowth = async (userId) => {

};
export const getMacronutrientComposition = async (userId) => {

};
export const getPeakAddActionMonth = async (userId) => {

};
export const getPeakRemoveActionMonth = async (userId) => {

};
export const getUniqueItemsCount = async (userId) => {

};
export const getUserRankingsPercent = async (userId) => {

};
import axios from "axios";
import dotenv from "dotenv";
import { wordsToNumbers } from "words-to-numbers";
import { exec } from "node:child_process";
import path from "node:path";

dotenv.config();

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY; //process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_URL = "https://api.spoonacular.com/recipes";

const SPOONACULAR_AUTH = {
  "x-api-key": SPOONACULAR_API_KEY,
};

export const parseQuantity = (rawQuantity) => {
  rawQuantity = wordsToNumbers(rawQuantity);
  const quantity = Number(rawQuantity.replace(/[^0-9]/g, ""));
  const unit = rawQuantity.replace(quantity.toString(), "").trim();
  return { quantity, unit };
};

export const parseFoodItem = (
  rawQuantity,
  foodString,
  expirationDate = null
) => {
  const { quantity, unit } = parseQuantity(rawQuantity);
  const name = foodString;
  return { quantity, unit, name, expirationDate };
};

export const parseTags = async (foodName, quantity, unit) => {
  try {
    let nutrition;
    nutrition = (
      await axios.post(
        SPOONACULAR_URL + "/parseIngredients",
        new URLSearchParams({
          ingredientList: `${quantity} ${unit} ${foodName}`,
          servings: 1,
          includeNutrition: false,
          language: "en",
        }),
        { headers: SPOONACULAR_AUTH }
      )
    ).data;

    const aisleList = nutrition
      .map((item) => item.aisle)
      .filter((aisle) => aisle !== undefined);

    return aisleList;
  } catch (error) {
    console.error("Error parsing tags:", error);
  }
};

// NOTE: takes absolute URI
export const parseReceipt = async (imageUri, userId) => {
  console.log(
    `python3.10 ${path.resolve(
      " ../../receiptOCR/smartReader.py"
    )} "${imageUri}"`
  );
  return new Promise((resolve, reject) =>
    exec(
      `python3.10 ${path.resolve(
        " ../../receiptOCR/smartReader.py"
      )} "${imageUri}"`,
      (error, stdout, stderr) => {
        if (!error && !stderr) {
          resolve(stdout);
        } else {
          if (error) reject(new Error(error));
          else reject(new Error(stderr));
        }
      }
    )
  );
};

import axios from "axios";
import dotenv from "dotenv";
import { wordsToNumbers } from "words-to-numbers";
import { exec } from "node:child_process";
import path from "node:path";
import { unlink, readFileSync } from "node:fs";
import { createAddAction } from "./addaction-service.js";
import { getUserDefaultInventory } from "./inventory-service.js";

dotenv.config();

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY; //process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_URL = "https://api.spoonacular.com/recipes";

const SPOONACULAR_AUTH = {
  "x-api-key": SPOONACULAR_API_KEY,
};

export const parseQuantity = (rawQuantity) => {
  if (typeof rawQuantity == "number") {
    return rawQuantity;
  }
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

export const parseReceipt = async (imageUri, userId) => {
  console.log(userId);
  const jsonUri = await generateJson(imageUri);
  deleteFile(imageUri);
  const jsonString = readFileSync(jsonUri, "utf-8");
  const parsedObj = JSON.parse(jsonString);
  deleteFile(jsonUri);
  // Just add to default inventory for now...
  const defaultInventory = await getUserDefaultInventory(userId);

  const addActionCreations = [];
  for (const [itemName, quantity] of Object.entries(parsedObj)) {
    addActionCreations.push(
      createAddAction(
        {
          foodString: itemName.toLocaleLowerCase(),
          quantity: Math.ceil(quantity),
        },
        defaultInventory._id,
        userId
      )
    );
  }
  await Promise.all(addActionCreations);
  return true;
};

const parseJson = async (jsonUri) => {};

const deleteFile = async (filePath) => {
  return new Promise((resolve, reject) =>
    unlink(filePath, (err) => {
      if (err) reject(err);
      else resolve();
    })
  );
};

// NOTE: takes absolute URI
const generateJson = async (imageUri) => {
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

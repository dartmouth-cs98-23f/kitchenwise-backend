import axios from "axios";

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_URL = "https://api.spoonacular.com/recipes";

const SPOONACULAR_AUTH = {
  "x-api-key": SPOONACULAR_API_KEY,
};

export const parseQuantity = (rawQuantity) => {
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

export const parseTags = async(foodName, quantity, unit) => {
  try{
    let nutrition;
    nutrition = (
      await axios.post(SPOONACULAR_URL + "/parseIngredients", {
        params: {
          ingredientList: `${quantity} ${unit} ${foodName}`,
          servings: 1,
          includeNutrition: false,
          language: "en",
        },
        headers: SPOONACULAR_AUTH,
      })
    ).data;

    const aisleList = nutrition.map(item => item.aisle);

    return aisleList;
  } catch (error) {
    console.error('Error parsing tags:', error);
  }
};
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

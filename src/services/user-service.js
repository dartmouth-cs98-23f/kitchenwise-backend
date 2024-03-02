import User from "../models/User.js";

export const getUserById = async (userId) => {
  return await User.findById(userId);
};

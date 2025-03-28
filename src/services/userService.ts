import User from "../models/User";
import Scheme from "../models/Scheme";

export const getAllUsers = async () => {
  return await User.findAll({ include: [Scheme] });
};

export const assignUserToScheme = async (userId: string, schemeId: string) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  user.schemeId = schemeId;
  await user.save();
  return user;
};

export const deleteUser = async (userId: string) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  await user.destroy();
};

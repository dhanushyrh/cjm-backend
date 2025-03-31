import User from "../models/User";
import Scheme from "../models/Scheme";
import UserScheme from "../models/UserScheme";

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const getAllUsers = async (page: number = 1, limit: number = 10): Promise<PaginationResult<User>> => {
  const offset = (page - 1) * limit;
  
  const { count, rows } = await User.findAndCountAll({
    include: [
      {
        model: UserScheme,
        as: "schemes",
        required: false,
        include: [
          {
            model: Scheme,
            as: "scheme",
            required: false
          }
        ]
      }
    ],
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });
  
  const pages = Math.ceil(count / limit);
  
  return {
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      pages
    }
  };
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

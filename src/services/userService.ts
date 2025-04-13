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
      },
      {
        model: User,
        as: "referrer",
        required: false,
        attributes: ['id', 'userId', 'name']
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

export const deleteUser = async (userId: string) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  await user.destroy();
};

export const updateUserActiveStatus = async (userId: string, isActive: boolean) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  user.is_active = isActive;
  await user.save();
  return user;
};

/**
 * Find a user by their userId (HS-XXXXXX format)
 * @param {string} userId - The user's unique ID in HS-XXXXXX format
 * @returns {Promise<User>} User object with associated schemes
 */
export const findUserByUserId = async (userId: string): Promise<User | null> => {
  const user = await User.findOne({
    where: { userId },
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
      },
      {
        model: User,
        as: "referrer",
        required: false,
        attributes: ['id', 'userId', 'name']
      }
    ]
  });
  
  return user;
};

/**
 * Find a user by their UUID
 * @param {string} id - The user's UUID
 * @returns {Promise<User>} User object with associated schemes
 */
export const getUserById = async (id: string): Promise<User | null> => {
  const user = await User.findByPk(id, {
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
      },
      {
        model: User,
        as: "referrer",
        required: false,
        attributes: ['id', 'userId', 'name']
      }
    ]
  });
  
  return user;
};

/**
 * Update user details
 * @param {string} userId - The user's UUID
 * @param {Object} userDetails - The user details to update
 * @returns {Promise<User>} Updated user object
 */
export const updateUserDetails = async (userId: string, userDetails: {
  mobile?: string;
  dob?: Date;
  current_address?: string;
  permanent_address?: string;
  nominee?: string;
  relation?: string;
}): Promise<User> => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  // Update only the provided fields
  await user.update({
    ...(userDetails.mobile && { mobile: userDetails.mobile }),
    ...(userDetails.dob && { dob: userDetails.dob }),
    ...(userDetails.current_address && { current_address: userDetails.current_address }),
    ...(userDetails.permanent_address && { permanent_address: userDetails.permanent_address }),
    ...(userDetails.nominee && { nominee: userDetails.nominee }),
    ...(userDetails.relation && { relation: userDetails.relation })
  });

  return user;
};

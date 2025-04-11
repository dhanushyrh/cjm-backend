import User from "../models/User";

export interface UserSerializer {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const serializeUser = (user: User): UserSerializer => {
  const { password, ...userWithoutPassword } = user.toJSON();
  return userWithoutPassword;
};

export const serializeUsers = (users: User[]): UserSerializer[] => {
  return users.map(user => serializeUser(user));
}; 
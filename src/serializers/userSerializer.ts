import User from "../models/User";

export interface UserSerializer {
  id: string;
  userId: string;
  name: string;
  email: string;
  current_address?: string;
  permanent_address?: string;
  mobile?: string;
  nominee?: string;
  relation?: string;
  receive_posts?: boolean;
  profile_image?: string;
  id_proof?: string;
  referred_by?: string;
  referrer?: {
    id: string;
    userId: string;
    name: string;
  };
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
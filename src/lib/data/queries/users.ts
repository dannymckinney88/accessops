import { users, CURRENT_USER_ID } from "../seeds/users";
import type { User } from "../types/domain";

export const getUsers = async (): Promise<User[]> => users;

export const getCurrentUser = async (): Promise<User> => {
  const user = users.find((u) => u.id === CURRENT_USER_ID);
  if (!user) throw new Error(`Current user not found: ${CURRENT_USER_ID}`);
  return user;
};

export const getAssignableUsers = async (): Promise<User[]> =>
  users.filter((u) => u.isActive);

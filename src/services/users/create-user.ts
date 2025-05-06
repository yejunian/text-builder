import { insertUser, UserInsertResult } from "@/repositories/users/insert-user";
import { createSalt, hashPassword } from "@/utils/server/password";

export async function createUser(
  user: UserCreation,
): Promise<UserInsertResult> {
  try {
    const salt = createSalt();

    return await insertUser({
      loginName: user.loginName,
      displayName: user.displayName || null,
      passwordHash: hashPassword(user.password, salt),
      passwordSalt: salt,
    });
  } catch (error) {
    console.error(error);
    return "unknown";
  }
}

export type UserCreation = {
  loginName: string;
  displayName?: string | null | undefined;
  password: string;
};

export function isUserCreation(obj: any): obj is UserCreation {
  if (typeof obj.loginName !== "string" || !obj.loginName) {
    return false;
  }

  if (
    typeof obj.displayName !== "string" &&
    obj.displayName !== null &&
    obj.displayName !== undefined
  ) {
    return false;
  }

  if (typeof obj.password !== "string" || !obj.password) {
    return false;
  }

  return true;
}

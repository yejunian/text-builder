import {
  insertUser,
  UserInsertFailure,
  UserInsertSuccess,
} from "@/repositories/users/insert-user";
import { createSalt, hashPassword } from "@/utils/server/password";

const loginNameConstraint = /^[a-z0-9._-]{3,30}$/;

export async function createUser(
  user: UserCreation,
): Promise<UserCreationResult> {
  const failureReason = new Set<UserCreationFailure>();

  if (!loginNameConstraint.test(user.loginName)) {
    failureReason.add("login_name");
  }

  if (user.displayName && user.displayName.length > 100) {
    failureReason.add("display_name");
  }

  if (failureReason.size) {
    return failureReason;
  }

  try {
    const salt = createSalt();

    const result = await insertUser({
      loginName: user.loginName,
      displayName: user.displayName || null,
      passwordHash: hashPassword(user.password, salt),
      passwordSalt: salt,
    });

    return result === "ok" ? result : new Set<UserCreationFailure>([result]);
  } catch (error) {
    console.error(error);
    return new Set<UserCreationFailure>(["unknown"]);
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

export type UserCreationResult = UserInsertSuccess | Set<UserCreationFailure>;

export type UserCreationFailure =
  | UserInsertFailure
  | "login_name"
  | "display_name";

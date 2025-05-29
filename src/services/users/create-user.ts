import { insertUser } from "@/repositories/users/insert-user";
import { DbInsertFailure, DbInsertSuccess } from "@/types/db-result";
import { createSalt, hashPassword } from "@/utils/server/password";

export async function createUser(
  user: UserCreation,
): Promise<UserCreationResult> {
  const failureReason = new Set<UserCreationFailure>();

  if (
    user.loginName.length < 3 ||
    user.loginName.length > 30 ||
    /[^a-z0-9._-]|^\.|\.$|\.\.|^[._-]+$/.test(user.loginName)
  ) {
    failureReason.add("login_name");
  }

  if (
    user.displayName &&
    (user.displayName.length > 100 || hasControlCharacters(user.displayName))
  ) {
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

function hasControlCharacters(str: string): boolean {
  for (let i = 0; i < str.length; i += 1) {
    const codePoint = str.codePointAt(i);

    if (typeof codePoint !== "number") {
      continue;
    } else if (codePoint < 0x20 || codePoint === 0x7f) {
      return true;
    } else if (codePoint >= 0x10000) {
      i += 1;
    }
  }

  return false;
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

export type UserCreationResult = DbInsertSuccess | Set<UserCreationFailure>;

export type UserCreationFailure =
  | DbInsertFailure
  | "login_name"
  | "display_name";

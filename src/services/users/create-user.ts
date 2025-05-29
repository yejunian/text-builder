import { insertUser } from "@/repositories/users/insert-user";
import { DbInsertResult } from "@/types/server/db-result";
import { UserCreationReqBody } from "@/types/users";
import { createSalt, hashPassword } from "@/utils/server/password";

export async function createUser(
  user: UserCreationReqBody,
): Promise<DbInsertResult> {
  try {
    const salt = createSalt();

    const result = await insertUser({
      loginName: user.loginName,
      displayName: user.displayName || null,
      passwordHash: hashPassword(user.password, salt),
      passwordSalt: salt,
    });

    return result;
  } catch (error) {
    console.error(error);
    return "unknown";
  }
}

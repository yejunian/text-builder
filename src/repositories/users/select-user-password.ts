import { eq } from "drizzle-orm";

import { db } from "@/db";
import { usersTable } from "@/db/schema";

export async function selectUserWithPassword(
  loginName: string,
): Promise<UserWithPassword | null> {
  try {
    const selectedPasswords = await db
      .select({
        userId: usersTable.userId,
        loginName: usersTable.loginName,
        displayName: usersTable.displayName,
        passwordHash: usersTable.passwordHash,
        passwordSalt: usersTable.passwordSalt,
      })
      .from(usersTable)
      .where(eq(usersTable.loginName, loginName));

    return selectedPasswords[0] ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export type UserWithPassword = Pick<
  typeof usersTable.$inferSelect,
  "userId" | "loginName" | "displayName" | "passwordSalt" | "passwordHash"
>;

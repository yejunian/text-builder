import { DatabaseError } from "pg";

import { db } from "@/db";
import { usersTable } from "@/db/schema";

export async function insertUser(
  userInsert: UserInsertValue,
): Promise<UserInsertResult> {
  try {
    const result = await db.insert(usersTable).values({ ...userInsert });

    return result.rowCount === 1 ? "ok" : "unknown";
  } catch (error) {
    if (error instanceof DatabaseError) {
      if (error.code == "23505") {
        return "duplicated";
      }
    }

    console.error(error);
    return "unknown";
  }
}

export type UserInsertValue = Omit<
  typeof usersTable.$inferInsert,
  "userId" | "createdAt" | "deletedAt"
>;

export type UserInsertResult = UserInsertSuccess | UserInsertFailure;
export type UserInsertSuccess = "ok";
export type UserInsertFailure = "duplicated" | "unknown";

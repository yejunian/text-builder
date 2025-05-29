import { DatabaseError } from "pg";
import { v7 as uuid7 } from "uuid";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { DbInsertResult } from "@/types/server/db-result";

export async function insertUser(
  userInsert: UserInsertValue,
): Promise<DbInsertResult> {
  try {
    const result = await db.insert(usersTable).values({
      ...userInsert,
      userId: uuid7(),
    });

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

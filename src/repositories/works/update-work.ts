import { and, eq, isNull } from "drizzle-orm";
import { DatabaseError } from "pg";

import { db } from "@/db";
import { usersTable, worksTable } from "@/db/schema";
import { DbInsertFailure } from "@/types/server/db-result";

export async function updateWork(
  workUpdate: WorkUpdateValue,
): Promise<WorkUpdateResult> {
  try {
    const result = await db
      .update(worksTable)
      .set({
        title: workUpdate.title,
        slug: workUpdate.slug,
        updatedAt: new Date(),
      })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.userId, workUpdate.ownerId),
          eq(worksTable.workId, workUpdate.workId),
          eq(worksTable.ownerId, workUpdate.ownerId),
          isNull(usersTable.deletedAt),
          isNull(worksTable.deletedAt),
        ),
      );

    return result.rowCount === 1 ? "ok" : "not-found";
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

export type WorkUpdateValue = Pick<
  typeof worksTable.$inferInsert,
  "ownerId" | "workId" | "slug" | "title"
>;

export type WorkUpdateResult =
  | WorkUpdateSuccess
  | DbInsertFailure
  | "not-found";

export type WorkUpdateSuccess = "ok";

import { and, eq, isNull } from "drizzle-orm";
import { DatabaseError } from "pg";

import { db } from "@/db";
import { usersTable, worksTable } from "@/db/schema";
import { DbInsertFailure } from "@/types/server/db-result";

import { WorkSelectSuccess } from "./select-work";

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
      )
      .returning({
        workId: worksTable.workId,
        ownerId: worksTable.ownerId,
        slug: worksTable.slug,
        title: worksTable.title,
        createdAt: worksTable.createdAt,
        updatedAt: worksTable.updatedAt,
      });

    if (result.length === 1) {
      return result[0];
    } else if (result.length === 0) {
      return "not-found";
    } else {
      // 2개 이상 수정됨. workId가 unique하므로 도달 불가.
      return result[0];
    }
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

type WorkUpdateResult = WorkSelectSuccess | WorkUpdateFailure;
export type WorkUpdateFailure = DbInsertFailure | "not-found";

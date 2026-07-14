import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { usersTable, worksTable } from "@/db/schema";
import { WorkRead } from "@/types/work";
import { isDeadUpsertionDate } from "@/utils/date";

export async function deleteWork(
  workRead: WorkRead,
): Promise<WorkDeleteResult> {
  try {
    const result = await db
      .update(worksTable)
      .set({
        deletedAt: new Date(),
      })
      .from(usersTable)
      .where(
        and(
          eq(worksTable.workId, workRead.workId),
          eq(worksTable.ownerId, workRead.ownerId),
          eq(worksTable.ownerId, usersTable.userId),
          isNull(worksTable.deletedAt),
          isNull(usersTable.deletedAt),
        ),
      )
      .returning({
        workId: worksTable.workId,
        ownerId: worksTable.ownerId,
        slug: worksTable.slug,
        title: worksTable.title,
        createdAt: worksTable.createdAt,
        updatedAt: worksTable.updatedAt,
        deletedAt: worksTable.deletedAt,
      });

    if (result.length !== 1) {
      return null;
    }

    const deletedWork = result[0];

    if (!isDeadUpsertionDate(deletedWork)) {
      return null;
    }

    return deletedWork;
  } catch (error) {
    console.error(error);
    return null;
  }
}

type WorkDeleteResult =
  | null
  | (Pick<
      typeof worksTable.$inferSelect,
      "workId" | "ownerId" | "slug" | "title" | "createdAt" | "updatedAt"
    > & {
      deletedAt: Date;
    });

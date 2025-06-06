import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { usersTable, worksTable } from "@/db/schema";
import { WorkRead } from "@/types/work";

export async function selectWork(
  workRead: WorkRead,
): Promise<WorkSelectResult> {
  try {
    const selected = await db
      .select({
        workId: worksTable.workId,
        ownerId: worksTable.ownerId,
        slug: worksTable.slug,
        title: worksTable.title,
        createdAt: worksTable.createdAt,
        updatedAt: worksTable.updatedAt,
      })
      .from(worksTable)
      .innerJoin(
        usersTable,
        and(
          eq(worksTable.workId, workRead.workId),
          eq(worksTable.ownerId, workRead.ownerId),
          eq(usersTable.userId, workRead.ownerId),
          isNull(worksTable.deletedAt),
          isNull(usersTable.deletedAt),
        ),
      );

    return selected[0] || "not-found";
  } catch (error) {
    console.error(error);
    return "unknown";
  }
}

type WorkSelectResult = WorkSelectSuccess | WorkSelectFailure;

export type WorkSelectSuccess = Pick<
  typeof worksTable.$inferSelect,
  "workId" | "ownerId" | "slug" | "title" | "createdAt" | "updatedAt"
>;

export type WorkSelectFailure = "not-found" | "unknown";

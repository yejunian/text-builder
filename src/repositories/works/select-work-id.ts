import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { usersTable, worksTable } from "@/db/schema";

export async function selectWorkId(
  loginName: string,
  slug: string,
): Promise<WorkIdSelectResult> {
  try {
    const selected = await db
      .select({
        workId: worksTable.workId,
        ownerId: worksTable.ownerId,
      })
      .from(worksTable)
      .innerJoin(
        usersTable,
        and(
          eq(usersTable.loginName, loginName),
          isNull(usersTable.deletedAt),
          eq(usersTable.userId, worksTable.ownerId),
          isNull(worksTable.deletedAt),
          eq(worksTable.slug, slug),
        ),
      );

    return selected[0] || "not-found";
  } catch (error) {
    console.error(error);
    return "unknown";
  }
}

type WorkIdSelectResult = WorkIdSelectSuccess | WorkIdSelectFailure;

type WorkIdSelectSuccess = Pick<
  typeof worksTable.$inferSelect,
  "workId" | "ownerId"
>;

type WorkIdSelectFailure = "not-found" | "unknown";

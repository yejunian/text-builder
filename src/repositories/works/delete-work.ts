import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { usersTable, worksTable } from "@/db/schema";
import { WorkRead } from "@/types/work";

export async function deleteWork(workRead: WorkRead): Promise<boolean> {
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
      );

    return result.rowCount === 1;
  } catch (error) {
    console.error(error);
    return false;
  }
}

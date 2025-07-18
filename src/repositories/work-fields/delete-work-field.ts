import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { usersTable, workFieldsTable, worksTable } from "@/db/schema";

export async function deleteWorkField(
  workField: WorkFieldDelete,
): Promise<boolean> {
  try {
    const result = await db.transaction(async (tx) => {
      const now = new Date();

      const workResult = await tx
        .update(worksTable)
        .set({
          updatedAt: now,
        })
        .where(
          and(
            eq(worksTable.workId, workField.parentId),
            eq(worksTable.ownerId, workField.ownerId),
          ),
        );

      if (workResult.rowCount !== 1) {
        return tx.rollback();
      }

      const workFieldResult = await tx
        .update(workFieldsTable)
        .set({
          deletedAt: now,
        })
        .from(usersTable)
        .innerJoin(
          worksTable,
          and(
            eq(usersTable.userId, workField.ownerId),
            eq(worksTable.workId, workField.parentId),
            eq(worksTable.ownerId, workField.ownerId),
            isNull(usersTable.deletedAt),
            isNull(worksTable.deletedAt),
          ),
        )
        .where(
          and(
            eq(workFieldsTable.workFieldId, workField.workFieldId),
            eq(workFieldsTable.parentId, workField.parentId),
            isNull(workFieldsTable.deletedAt),
          ),
        );

      if (workFieldResult.rowCount !== 1) {
        tx.rollback();
      }

      return true;
    });

    return result;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export type WorkFieldDelete = {
  ownerId: string;
  parentId: string;
  workFieldId: string;
};

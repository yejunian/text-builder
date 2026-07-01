import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { usersTable, workFieldsTable, worksTable } from "@/db/schema";

export async function deleteWorkField(
  workField: WorkFieldDelete,
): Promise<WorkFieldDeleteResult> {
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
        // TODO: 롤백 시 catch 절로 넘겨짐. 다행히 실패 사유는 동일하게 리턴됨.
        return tx.rollback();
      }

      const deletedField = await tx
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
        )
        .returning({
          workFieldId: workFieldsTable.workFieldId,
          parentId: workFieldsTable.parentId,
          displayOrder: workFieldsTable.displayOrder,
          fieldName: workFieldsTable.fieldName,
          isPublic: workFieldsTable.isPublic,
          fieldType: workFieldsTable.fieldType,
          fieldValue: workFieldsTable.fieldValue,
          createdAt: workFieldsTable.createdAt,
          updatedAt: workFieldsTable.updatedAt,
          deletedAt: workFieldsTable.deletedAt,
        });

      if (deletedField.length !== 1) {
        // TODO: 롤백 시 catch 절로 넘겨짐. 다행히 실패 사유는 동일하게 리턴됨.
        tx.rollback();
      }

      return deletedField[0];
    });

    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export type WorkFieldDelete = {
  ownerId: string;
  parentId: string;
  workFieldId: string;
};

type WorkFieldDeleteResult = null | Pick<
  typeof workFieldsTable.$inferSelect,
  | "workFieldId"
  | "parentId"
  | "displayOrder"
  | "fieldName"
  | "isPublic"
  | "fieldType"
  | "fieldValue"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

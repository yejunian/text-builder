import { and, eq, isNull } from "drizzle-orm";
import { DatabaseError } from "pg";

import { db } from "@/db";
import { usersTable, workFieldsTable, worksTable } from "@/db/schema";
import { DbInsertFailure } from "@/types/server/db-result";
import { WorkFieldModification } from "@/types/work-field";

export async function updateWorkField(
  workField: WorkFieldUpdate,
): Promise<WorkFieldUpdateResult> {
  try {
    return await db.transaction(async (tx) => {
      const updatedField = await tx
        .update(workFieldsTable)
        .set({
          // displayOrder: workField.order,
          fieldName: workField.name,
          fieldType: workField.type,
          fieldValue: workField.value,
          isPublic: workField.isPublic,
          updatedAt: new Date(),
        })
        .from(worksTable)
        .innerJoin(
          usersTable,
          and(
            eq(worksTable.workId, workField.parentId),
            eq(worksTable.ownerId, workField.ownerId),
            eq(usersTable.userId, workField.ownerId),
            isNull(worksTable.deletedAt),
            isNull(usersTable.deletedAt),
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
          displayOrder: workFieldsTable.displayOrder,
          fieldName: workFieldsTable.fieldName,
          isPublic: workFieldsTable.isPublic,
          fieldType: workFieldsTable.fieldType,
          fieldValue: workFieldsTable.fieldValue,
          createdAt: workFieldsTable.createdAt,
          updatedAt: workFieldsTable.updatedAt,
        });

      if (updatedField.length !== 1) {
        tx.rollback();

        if (updatedField.length === 0) {
          return "not-found";
        } else if (updatedField.length > 1) {
          return "too-many-updated";
        } else {
          return "unknown";
        }
      }

      const workUpdateResult = await tx
        .update(worksTable)
        .set({ updatedAt: updatedField[0].updatedAt })
        .where(
          and(
            eq(worksTable.ownerId, workField.ownerId),
            eq(worksTable.workId, workField.parentId),
          ),
        );

      if (workUpdateResult.rowCount === 0) {
        return "not-found";
      }

      return updatedField[0];
    });
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

type WorkFieldUpdate = Omit<WorkFieldModification, "type"> & {
  type: number;
};

type WorkFieldUpdateResult =
  | WorkFieldUpdateFailure
  | Pick<
      typeof workFieldsTable.$inferSelect,
      | "workFieldId"
      | "displayOrder"
      | "fieldName"
      | "isPublic"
      | "fieldType"
      | "fieldValue"
      | "createdAt"
      | "updatedAt"
    >;

export type WorkFieldUpdateFailure =
  | "not-found"
  | "too-many-updated"
  | DbInsertFailure;

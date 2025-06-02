import { and, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { usersTable, workFieldsTable, worksTable } from "@/db/schema";
import { WorkFieldModification } from "@/types/work-fields";

export async function updateWorkField(
  workField: WorkFieldUpdate,
): Promise<WorkFieldUpdateResult> {
  try {
    const result = await db
      .update(workFieldsTable)
      .set({
        // displayOrder: workField.order,
        fieldName: workField.name,
        fieldType: workField.type,
        fieldValue: workField.value,
        isPublic: workField.isPublic,
        updatedAt: sql`now()`,
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
      );

    if (result.rowCount === 1) {
      return "ok";
    } else if (result.rowCount === null) {
      return "unknown";
    } else if (result.rowCount === 0) {
      return "not-found";
    } else if (result.rowCount > 1) {
      return "too-many-updated";
    } else {
      return "unknown";
    }
  } catch (error) {
    console.error(error);
    return "unknown";
  }
}

type WorkFieldUpdate = Omit<WorkFieldModification, "type"> & {
  type: number;
};

export type WorkFieldUpdateResult =
  | WorkFieldUpdateSuccess
  | WorkFieldUpdateFailure;

type WorkFieldUpdateSuccess = "ok";

type WorkFieldUpdateFailure = "not-found" | "too-many-updated" | "unknown";

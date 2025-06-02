import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { workFieldsTable } from "@/db/schema";

/**
 * 주의: `ownerId`, `workId`의 소유 관계를 먼저 검증하고 호출할 것.
 */
export async function selectFields(
  workId: string,
): Promise<WorkFieldSelectResult> {
  try {
    const selected = await db
      .select({
        workFieldId: workFieldsTable.workFieldId,
        parentId: workFieldsTable.parentId,
        displayOrder: workFieldsTable.displayOrder,
        fieldName: workFieldsTable.fieldName,
        isPublic: workFieldsTable.isPublic,
        fieldType: workFieldsTable.fieldType,
        fieldValue: workFieldsTable.fieldValue,
        createdAt: workFieldsTable.createdAt,
        updatedAt: workFieldsTable.updatedAt,
      })
      .from(workFieldsTable)
      .where(
        and(
          eq(workFieldsTable.parentId, workId),
          isNull(workFieldsTable.deletedAt),
        ),
      )
      .orderBy(workFieldsTable.displayOrder);

    return selected;
  } catch (error) {
    console.error(error);
    return "unknown";
  }
}

type WorkFieldSelectResult = WorkFieldSelectSuccess | WorkFieldSelectFailure;
type WorkFieldSelectSuccess = WorkFieldSelectRecord[];
export type WorkFieldSelectFailure = "unknown";

type WorkFieldSelectRecord = Omit<
  typeof workFieldsTable.$inferSelect,
  "deletedAt"
>;

import { eq, sql } from "drizzle-orm";
import { DatabaseError } from "pg";
import { v7 as uuid7 } from "uuid";

import { db } from "@/db";
import { workFieldsTable, worksTable } from "@/db/schema";
import { DbInsertFailure } from "@/types/server/db-result";
import { WorkFieldCreationResBody } from "@/types/work-field";

export async function insertWorkField(
  workFieldInsert: WorkFieldInsertValue,
): Promise<WorkFieldInsertResult> {
  try {
    const workFieldId = uuid7();

    const result = await db.transaction(async (tx) => {
      const displayOrderNext = await tx
        .select({
          // Drizzle에서 coalesce 함수를 지원하지 않음.
          value:
            sql<number>`1 + COALESCE(MAX(${workFieldsTable.displayOrder}), 0)`.as(
              "value",
            ),
        })
        .from(workFieldsTable)
        .where(eq(workFieldsTable.parentId, workFieldInsert.parentId));

      await tx
        .update(worksTable)
        .set({ updatedAt: new Date().toISOString() })
        .where(eq(worksTable.workId, workFieldInsert.parentId));

      const txResult = await tx.insert(workFieldsTable).values({
        ...workFieldInsert,
        workFieldId,
        displayOrder: displayOrderNext[0].value || 1,
      });

      return txResult;
    });

    return result.rowCount === 1 ? { workFieldId } : "unknown";
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

export type WorkFieldInsertValue = Pick<
  typeof workFieldsTable.$inferInsert,
  | "parentId"
  // | "displayOrder"
  | "fieldName"
  | "fieldType"
  | "fieldValue"
  | "isPublic"
>;

export type WorkFieldInsertResult = WorkFieldCreationResBody | DbInsertFailure;

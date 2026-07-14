import { eq, sql } from "drizzle-orm";
import { DatabaseError } from "pg";
import { v7 as uuid7 } from "uuid";

import { db } from "@/db";
import { workFieldsTable, worksTable } from "@/db/schema";
import { DbInsertFailure } from "@/types/server/db-result";

export async function insertWorkField(
  workFieldInsert: WorkFieldInsertValue,
): Promise<WorkFieldInsertResult> {
  try {
    return await db.transaction(async (tx) => {
      const workFieldId = uuid7();

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

      const insertedField = await tx
        .insert(workFieldsTable)
        .values({
          ...workFieldInsert,
          workFieldId,
          displayOrder: displayOrderNext[0].value || 1,
        })
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
        });

      // INSERT 실행 중 에러가 발생하면 여기에 도달하지 않음.
      // (트랜잭션 롤백 후 catch 블록 수행)
      if (insertedField.length !== 1) {
        tx.rollback();
        return "unknown";
      }

      const parentResult = await tx
        .update(worksTable)
        .set({ updatedAt: insertedField[0].updatedAt })
        .where(eq(worksTable.workId, workFieldInsert.parentId));

      if (parentResult.rowCount !== 1) {
        // 필드의 부모가 없음.
        tx.rollback();
        return "unknown";
      }

      return insertedField[0];
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

export type WorkFieldInsertValue = Pick<
  typeof workFieldsTable.$inferInsert,
  | "parentId"
  // | "displayOrder"
  | "fieldName"
  | "fieldType"
  | "fieldValue"
  | "isPublic"
>;

export type WorkFieldInsertResult =
  | DbInsertFailure
  | Pick<
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
    >;

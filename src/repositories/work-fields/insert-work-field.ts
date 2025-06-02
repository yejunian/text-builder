import { eq, sql } from "drizzle-orm";
import { DatabaseError } from "pg";
import { v7 as uuid7 } from "uuid";

import { db } from "@/db";
import { workFieldsTable } from "@/db/schema";
import { DbInsertFailure } from "@/types/server/db-result";

export async function insertWorkField(
  workFieldInsert: WorkFieldInsertValue,
): Promise<WorkFieldInsertResult> {
  try {
    const workFieldId = uuid7();

    // TODO: Drizzle SQL<T> vs SQL.Aliaed<T> 타입 문제가 해결되었는지 확인하고,
    //       두 쿼리를 하나로 합치기.
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

export type WorkFieldInsertResult = WorkFieldInsertSuccess | DbInsertFailure;
export type WorkFieldInsertSuccess = {
  workFieldId: string;
};

import { and, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { workFieldsTable, worksTable } from "@/db/schema";

export async function updateAllWorkFieldsOrder(
  work: ReorderTarget,
): Promise<boolean> {
  try {
    const result = await db.transaction(async (tx) => {
      const timestampResult = await tx
        .update(worksTable)
        .set({ updatedAt: new Date() })
        .where(
          and(
            eq(worksTable.ownerId, work.ownerId),
            eq(worksTable.workId, work.workId),
            isNull(worksTable.deletedAt),
          ),
        );

      if (timestampResult.rowCount !== 1) {
        return tx.rollback();
      }

      return await db.execute(sql`
        UPDATE ${workFieldsTable}
        SET "${sql.raw(workFieldsTable.displayOrder.name)}" = "t"."new_order"
        FROM (
          SELECT
            "work_field_id",
            ROW_NUMBER() OVER () AS "new_order"
          FROM ${sql.raw(`UNNEST(ARRAY['${work.order.join("','")}']::uuid[])`)} AS "work_field_id"
        ) "t"
        WHERE
          ${workFieldsTable.workFieldId} = "t"."work_field_id"
          AND ${workFieldsTable.parentId} = ${work.workId}
          AND ${workFieldsTable.deletedAt} IS NULL
        ;
      `);
    });

    return (result.rowCount ?? -1) > 0;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export type ReorderTarget = {
  ownerId: string;
  workId: string;
  order: string[];
};

import { and, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { usersTable, workFieldsTable, worksTable } from "@/db/schema";

export async function updateAllWorkFieldsOrder(
  work: ReorderTarget,
): Promise<WorkFieldReorderResult> {
  try {
    return await db.transaction(async (tx) => {
      const ownershipResult = await tx
        .select({
          workId: worksTable.workId,
        })
        .from(worksTable)
        .innerJoin(
          usersTable,
          and(
            eq(worksTable.workId, work.workId),
            eq(worksTable.ownerId, work.ownerId),
            eq(worksTable.ownerId, usersTable.userId),
            isNull(worksTable.deletedAt),
            isNull(usersTable.deletedAt),
          ),
        );

      if (ownershipResult.length !== 1) {
        throw new ReorderError("not-found");
      }

      const fields = await tx
        .select({
          workFieldId: workFieldsTable.workFieldId,
        })
        .from(workFieldsTable)
        .where(
          and(
            eq(workFieldsTable.parentId, work.workId),
            isNull(workFieldsTable.deletedAt),
          ),
        );

      if (work.order.length !== fields.length) {
        throw new ReorderError("wrong-fields");
      }

      const orderSet = new Set(work.order);
      if (!fields.every(({ workFieldId }) => orderSet.has(workFieldId))) {
        throw new ReorderError("wrong-fields");
      }

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
        throw new ReorderError("unknown");
      }

      const reorderResult = await tx.execute(sql`
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

      if (!reorderResult.rowCount || !(reorderResult.rowCount > 0)) {
        throw new ReorderError("no-update");
      }

      return true as const;
    });
  } catch (error) {
    if (error instanceof ReorderError) {
      return error.message;
    }

    console.error(error);
    return "unknown";
  }
}

class ReorderError extends Error {
  message: WorkFieldReorderFailure;

  constructor(message: WorkFieldReorderFailure) {
    super();

    this.message = message;
  }
}

export type ReorderTarget = {
  ownerId: string;
  workId: string;
  order: string[];
};

type WorkFieldReorderResult = true | WorkFieldReorderFailure;
type WorkFieldReorderFailure =
  | "not-found"
  | "wrong-fields"
  | "no-update"
  | "unknown";

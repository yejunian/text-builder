import { DatabaseError } from "pg";
import { v7 as uuid7 } from "uuid";

import { db } from "@/db";
import { worksTable } from "@/db/schema";
import { DbInsertFailure } from "@/types/server/db-result";

export async function insertWork(
  workInsert: WorkInsertValue,
): Promise<WorkInsertResult> {
  try {
    const workId = uuid7();
    const result = await db.insert(worksTable).values({
      ...workInsert,
      workId,
    });

    return result.rowCount === 1 ? { workId } : "unknown";
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

export type WorkInsertValue = Pick<
  typeof worksTable.$inferInsert,
  "ownerId" | "slug" | "title"
>;

export type WorkInsertResult = WorkInsertSuccess | DbInsertFailure;
export type WorkInsertSuccess = {
  workId: string;
};

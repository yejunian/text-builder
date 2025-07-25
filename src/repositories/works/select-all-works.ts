import { and, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { usersTable, worksTable } from "@/db/schema";
import { AllWorksRead } from "@/types/work";

import { WorkSelectSuccess } from "./select-work";

export async function selectAllWorks(
  worksRead: AllWorksRead,
): Promise<AllWorksSelectResult> {
  try {
    const selected = await db
      .select({
        workId: worksTable.workId,
        ownerId: worksTable.ownerId,
        slug: worksTable.slug,
        title: worksTable.title,
        createdAt: worksTable.createdAt,
        updatedAt: worksTable.updatedAt,
      })
      .from(worksTable)
      .innerJoin(
        usersTable,
        and(
          eq(worksTable.ownerId, worksRead.ownerId),
          eq(usersTable.userId, worksRead.ownerId),
          isNull(worksTable.deletedAt),
          isNull(usersTable.deletedAt),
        ),
      )
      .orderBy(desc(worksTable.updatedAt));

    return selected;
  } catch (error) {
    console.error(error);
    return "unknown";
  }
}

type AllWorksSelectResult = AllWorksSelectSuccess | AllWorksSelectFailure;
type AllWorksSelectSuccess = WorkSelectSuccess[];
export type AllWorksSelectFailure = "unknown";

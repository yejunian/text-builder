import { db } from "@/db";
import { revokedTokensTable } from "@/db/schema";

export async function insertRevokedToken(
  revokedTokenInsert: RevokedTokenInsertValue,
): Promise<boolean> {
  try {
    const result = await db
      .insert(revokedTokensTable)
      .values(revokedTokenInsert);

    return result.rowCount === 1;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export type RevokedTokenInsertValue = Omit<
  typeof revokedTokensTable.$inferInsert,
  "rejectionId"
>;

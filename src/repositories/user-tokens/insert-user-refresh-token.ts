import { db } from "@/db";
import { userRefreshTokensTable } from "@/db/schema";

export async function insertUserRefreshToken(
  tokenInsert: UserTokenInsertValue,
): Promise<boolean> {
  try {
    const result = await db.insert(userRefreshTokensTable).values(tokenInsert);

    return result.rowCount === 1;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export type UserTokenInsertValue = Omit<
  typeof userRefreshTokensTable.$inferInsert,
  "tokenId"
>;

import { db } from "@/db";
import { userRefreshTokensTable } from "@/db/schema";

export async function insertUserRefreshToken(
  tokenInsert: TokenInsertValue,
): Promise<boolean> {
  try {
    const result = await db.insert(userRefreshTokensTable).values(tokenInsert);

    return result.rowCount === 1;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export type TokenInsertValue = Omit<
  typeof userRefreshTokensTable.$inferInsert,
  "tokenId"
>;

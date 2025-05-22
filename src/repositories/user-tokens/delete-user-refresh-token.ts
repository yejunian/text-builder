import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { userRefreshTokensTable } from "@/db/schema";

export async function deleteUserRefreshToken(
  userId: number,
  jti: string,
): Promise<boolean> {
  try {
    const result = await db
      .delete(userRefreshTokensTable)
      .where(
        and(
          eq(userRefreshTokensTable.ownerId, userId),
          eq(userRefreshTokensTable.jti, jti),
        ),
      );

    return result.rowCount === 1;
  } catch (error) {
    console.error(error);
    return false;
  }
}

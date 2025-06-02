import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { userRefreshTokensTable, usersTable } from "@/db/schema";

export async function selectUserRefreshToken(
  ownerId: string,
  jwtId: string,
): Promise<UserRefreshToken | null> {
  try {
    const selected = await db
      .select({
        ownerId: userRefreshTokensTable.ownerId,
        tokenId: userRefreshTokensTable.tokenId,
      })
      .from(userRefreshTokensTable)
      .innerJoin(
        usersTable,
        and(
          eq(usersTable.userId, ownerId),
          eq(userRefreshTokensTable.ownerId, ownerId),
          isNull(usersTable.deletedAt),
        ),
      )
      .where(eq(userRefreshTokensTable.tokenId, jwtId));

    return selected[0] || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export type UserRefreshToken = Pick<
  typeof userRefreshTokensTable.$inferSelect,
  "ownerId" | "tokenId"
>;

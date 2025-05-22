import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { userRefreshTokensTable, usersTable } from "@/db/schema";

export async function selectUserRefreshToken(
  loginName: string,
  jwtid: string,
): Promise<UserRefreshToken | null> {
  try {
    const selected = await db
      .select({
        ownerId: userRefreshTokensTable.ownerId,
        jti: userRefreshTokensTable.jti,
      })
      .from(userRefreshTokensTable)
      .innerJoin(
        usersTable,
        and(
          eq(usersTable.loginName, loginName),
          eq(usersTable.userId, userRefreshTokensTable.ownerId),
        ),
      )
      .where(eq(userRefreshTokensTable.jti, jwtid));

    return selected[0] || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export type UserRefreshToken = Pick<
  typeof userRefreshTokensTable.$inferSelect,
  "ownerId" | "jti"
>;

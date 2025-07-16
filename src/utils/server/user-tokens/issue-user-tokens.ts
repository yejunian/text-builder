import { UserTokenPair } from "@/types/server/user-token";
import { createJsonWebToken } from "@/utils/server/jwt";

import { ENV_SECRET_ACCESS_TOKEN, ENV_SECRET_REFRESH_TOKEN } from "../env";
import { decodeUserTokens } from "./decode-user-tokens";

export async function issueUserTokens(
  userId: string,
): Promise<UserTokenPair | null> {
  const accessToken = await createUserAccessToken(userId);
  const refreshToken = await createUserRefreshToken(userId);

  return decodeUserTokens(accessToken, refreshToken);
}

async function createUserAccessToken(subject: string): Promise<string | null> {
  return createJsonWebToken(ENV_SECRET_ACCESS_TOKEN, subject, "1h");
}

function createUserRefreshToken(subject: string): Promise<string | null> {
  return createJsonWebToken(ENV_SECRET_REFRESH_TOKEN, subject, "28d");
}

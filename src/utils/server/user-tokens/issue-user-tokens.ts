import { decodeJwt } from "jose";

import { isUserTokenPayload, UserTokenPair } from "@/types/server/user-token";
import { createJsonWebToken } from "@/utils/server/jwt";

import { ENV_SECRET_ACCESS_TOKEN, ENV_SECRET_REFRESH_TOKEN } from "../env";

export async function issueUserTokens(
  userId: string,
): Promise<UserTokenPair | null> {
  const accessToken = await createUserAccessToken(userId);
  const refreshToken = await createUserRefreshToken(userId);

  if (!accessToken || !refreshToken) {
    return null;
  }

  const atPayload = decodeJwt(accessToken);
  const rtPayload = decodeJwt(refreshToken);

  if (!isUserTokenPayload(atPayload) || !isUserTokenPayload(rtPayload)) {
    return null;
  }

  return {
    access: {
      token: accessToken,
      payload: atPayload,
    },
    refresh: {
      token: refreshToken,
      payload: rtPayload,
    },
  };
}

async function createUserAccessToken(subject: string): Promise<string | null> {
  return createJsonWebToken(ENV_SECRET_ACCESS_TOKEN, subject, "1h");
}

function createUserRefreshToken(subject: string): Promise<string | null> {
  return createJsonWebToken(ENV_SECRET_REFRESH_TOKEN, subject, "28d");
}

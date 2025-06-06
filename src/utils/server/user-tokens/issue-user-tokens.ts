import { decodeJwt } from "jose";

import {
  createUserAccessToken,
  createUserRefreshToken,
  isUserTokenPayload,
  UserTokenPair,
} from "@/utils/server/user-token";

export async function issueUserTokens(
  userId: string,
): Promise<Omit<UserTokenPair, "reissued"> | null> {
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

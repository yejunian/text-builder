import { decodeJwt } from "jose";

import { insertUserRefreshToken } from "@/repositories/user-tokens/insert-user-refresh-token";
import {
  createUserAccessToken,
  createUserRefreshToken,
  isUserTokenPayload,
  jwtExpToISOString,
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

  const tokenInsertSuccess = await insertUserRefreshToken({
    tokenId: rtPayload.jti,
    ownerId: userId,
    exp: jwtExpToISOString(rtPayload.exp),
  });

  if (!tokenInsertSuccess) {
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

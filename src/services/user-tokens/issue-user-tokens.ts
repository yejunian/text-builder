import jwt from "jsonwebtoken";

import { insertUserRefreshToken } from "@/repositories/user-tokens/insert-user-refresh-token";
import {
  createUserAccessToken,
  createUserRefreshToken,
  isUserTokenPayload,
  jwtExpToISOString,
  UserTokenPair,
} from "@/utils/server/user-token";

export async function issueUserTokens(
  userId: number,
): Promise<Omit<UserTokenPair, "reissued"> | null> {
  const accessToken = createUserAccessToken({ subject: userId });
  const refreshToken = createUserRefreshToken({ subject: userId });

  if (!accessToken || !refreshToken) {
    return null;
  }

  const atPayload = jwt.decode(accessToken, { json: true });
  const rtPayload = jwt.decode(refreshToken, { json: true });

  if (!isUserTokenPayload(atPayload) || !isUserTokenPayload(rtPayload)) {
    return null;
  }

  const tokenInsertSuccess = await insertUserRefreshToken({
    ownerId: userId,
    exp: jwtExpToISOString(rtPayload.exp),
    jti: rtPayload.jti,
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

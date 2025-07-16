import { decodeJwt } from "jose";

import { isUserTokenPayload, UserTokenPair } from "@/types/server/user-token";

export function decodeUserTokens(
  accessToken: string | null,
  refreshToken: string | null,
): UserTokenPair | null {
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

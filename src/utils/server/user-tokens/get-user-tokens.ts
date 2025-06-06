import { ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest } from "next/server";

import { decodeJwt } from "jose";

import { isUserTokenPayload, UserTokenPair } from "@/types/server/user-token";

export async function getUserTokens(
  request: NextRequest,
): Promise<UserTokenPair | null> {
  const middlewareCookies = new ResponseCookies(request.headers);

  const accessToken =
    middlewareCookies.get("accessToken")?.value ||
    request.cookies.get("accessToken")?.value ||
    null;
  const refreshToken =
    middlewareCookies.get("refreshToken")?.value ||
    request.cookies.get("refreshToken")?.value ||
    null;

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

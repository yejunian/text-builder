import { ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { UserTokenPair } from "@/types/server/user-token";

import { decodeUserTokens } from "./decode-user-tokens";

/** 호출 시점 이전에 미들웨어를 통해 검증 완료했음을 가정한다. */
export const userTokenUtils = Object.freeze({
  routeHandler: (request: NextRequest): UserTokenPair | null => {
    const middlewareCookies = new ResponseCookies(request.headers);

    const accessToken =
      middlewareCookies.get("accessToken")?.value ||
      request.cookies.get("accessToken")?.value ||
      null;
    const refreshToken =
      middlewareCookies.get("refreshToken")?.value ||
      request.cookies.get("refreshToken")?.value ||
      null;

    return decodeUserTokens(accessToken, refreshToken);
  },

  serverComponent: async (): Promise<UserTokenPair | null> => {
    const cookieStore = await cookies();

    const accessToken = cookieStore.get("accessToken")?.value || null;
    const refreshToken = cookieStore.get("refreshToken")?.value || null;

    return decodeUserTokens(accessToken, refreshToken);
  },
});

import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest, NextResponse } from "next/server";

import { jwtExpToDateValue } from "./utils/server/jwt";
import { verifyUserTokens } from "./utils/server/user-tokens/verify-user-tokens";

export async function middleware(request: NextRequest) {
  const requestCookies = request.cookies;
  const response = NextResponse.next();

  const accessToken = requestCookies.get("accessToken")?.value || null;
  const refreshToken = requestCookies.get("refreshToken")?.value || null;

  const result = refreshToken
    ? await verifyUserTokens(accessToken, refreshToken)
    : "no_token";

  if (typeof result === "string") {
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");

    return response;
  }

  if (result.reissued) {
    const defaultCookie: Partial<ResponseCookie> = {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    };

    response.cookies.set("accessToken", result.access.token, {
      ...defaultCookie,
      expires: new Date(jwtExpToDateValue(result.access.payload.exp)),
    });
    response.cookies.set("refreshToken", result.refresh.token, {
      ...defaultCookie,
      expires: new Date(jwtExpToDateValue(result.refresh.payload.exp)),
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|sitemap.xml|robots.txt).*)"],
};

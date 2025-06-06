import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest, NextResponse } from "next/server";

import status from "http-status";

import { loginUser } from "@/services/users/login-user";
import { isUserLoginReqBody, UserLoginResBody } from "@/types/users";
import { jwtExpToDateValue } from "@/utils/server/user-token";
import { getUserTokens } from "@/utils/server/user-tokens/get-user-tokens";

export async function POST(request: NextRequest) {
  const userTokens = await getUserTokens(request);

  if (userTokens) {
    return new Response(null, { status: status.CONFLICT });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch (error) {
    // JSON이 아닌 요청 본문
    return new Response(null, { status: status.BAD_REQUEST });
  }

  if (!isUserLoginReqBody(body)) {
    return new Response(null, { status: status.BAD_REQUEST });
  }

  try {
    const loginResult = await loginUser(body);

    if (typeof loginResult === "string") {
      switch (loginResult) {
        case "password":
          // loginName, password 오류
          return new Response(null, { status: status.BAD_REQUEST });

        case "token":
          // 토큰 생성 실패
          return new Response(null, { status: status.INTERNAL_SERVER_ERROR });

        case "unknown":
          return new Response(null, { status: status.INTERNAL_SERVER_ERROR });

        default: {
          const endpoint = `${request.method} ${request.url}`;
          console.error(`Undefined error reason: ${loginResult} (${endpoint})`);
          return new Response(null, { status: status.INTERNAL_SERVER_ERROR });
        }
      }
    }

    const responseBody: UserLoginResBody = {
      loginName: loginResult.loginName,
      displayName: loginResult.displayName,
    };

    const response = NextResponse.json(responseBody, { status: status.OK });

    const { tokens } = loginResult;
    const defaultCookie: Partial<ResponseCookie> = {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    };

    response.cookies.set("accessToken", tokens.access.token, {
      ...defaultCookie,
      expires: new Date(jwtExpToDateValue(tokens.access.payload.exp)),
    });
    response.cookies.set("refreshToken", tokens.refresh.token, {
      ...defaultCookie,
      expires: new Date(jwtExpToDateValue(tokens.refresh.payload.exp)),
    });

    return response;
  } catch (error) {
    return new Response(null, { status: status.INTERNAL_SERVER_ERROR });
  }
}

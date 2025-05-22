import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";

import status from "http-status";

import { isUserLogin, loginUser } from "@/services/users/login-user";
import { jwtExpToDateValue } from "@/utils/server/user-token";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch (error) {
    // JSON이 아닌 요청 본문
    return new Response(null, { status: status.BAD_REQUEST });
  }

  if (!isUserLogin(body)) {
    return new Response(null, { status: status.BAD_REQUEST });
  }

  try {
    const loginResult = await loginUser(body);

    if (typeof loginResult === "string") {
      // TODO: 실패 사유를 이렇게 관리하면 일부 상황 핸들링을 누락할 수 있음.
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

    const cookieStore = await cookies();
    const { tokens } = loginResult;
    const defaultCookie: Partial<ResponseCookie> = {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    };

    cookieStore.set("accessToken", tokens.access.token, {
      ...defaultCookie,
      expires: new Date(jwtExpToDateValue(tokens.access.payload.exp)),
    });
    cookieStore.set("refreshToken", tokens.refresh.token, {
      ...defaultCookie,
      expires: new Date(jwtExpToDateValue(tokens.refresh.payload.exp)),
    });

    const responseBody: LoginResponseBody = {
      loginName: loginResult.loginName,
      displayName: loginResult.displayName,
    };

    return Response.json(responseBody, { status: status.OK });
  } catch (error) {
    return new Response(null, { status: status.INTERNAL_SERVER_ERROR });
  }
}

export type LoginResponseBody = {
  loginName: string;
  displayName: string | null;
};

import status from "http-status";

import { createUser, isUserCreation } from "@/services/users/create-user";

// TODO: 4xx, 5xx 응답에 오류 내용을 담은 메시지 포함
export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch (error) {
    // JSON이 아닌 요청 본문
    return new Response(null, { status: status.BAD_REQUEST });
  }

  if (!isUserCreation(body) || !body.loginName || !body.password) {
    // 필수 항목 누락
    return new Response(null, { status: status.BAD_REQUEST });
  }

  try {
    const result = await createUser({
      loginName: body.loginName,
      displayName: body.displayName || null,
      password: body.password,
    });

    if (result === "ok") {
      return new Response(null, { status: status.CREATED });
    } else if (result === "duplicated") {
      return new Response(null, { status: status.BAD_REQUEST });
    } else {
      return new Response(null, { status: status.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.error(error);
    return new Response(null, { status: status.INTERNAL_SERVER_ERROR });
  }
}

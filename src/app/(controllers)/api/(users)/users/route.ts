import status from "http-status";

import { createUser, isUserCreation } from "@/services/users/create-user";

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
      ...body,
      displayName: body.displayName || null,
    });

    if (result === "ok") {
      return new Response(null, { status: status.CREATED });
    }

    if (result.has("unknown")) {
      return new Response(null, { status: status.INTERNAL_SERVER_ERROR });
    }

    return new Response(null, { status: status.BAD_REQUEST });
  } catch (error) {
    console.error(error);
    return new Response(null, { status: status.INTERNAL_SERVER_ERROR });
  }
}

import { NextRequest } from "next/server";

import status from "http-status";

import { createUser } from "@/services/users/create-user";
import { isUserCreationReqBody } from "@/types/user";
import { userTokenUtils } from "@/utils/server/user-tokens/user-token-utils";

export async function POST(request: NextRequest) {
  const userTokens = userTokenUtils.routeHandler(request);

  if (userTokens) {
    return new Response(null, { status: status.CONFLICT });
  }

  let _body: unknown;
  try {
    _body = await request.json();
  } catch (_error) {
    // JSON이 아닌 요청 본문
    return new Response(null, { status: status.BAD_REQUEST });
  }
  const body = _body;

  if (!isUserCreationReqBody(body) || !body.loginName || !body.password) {
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

    if (result === "unknown") {
      return new Response(null, { status: status.INTERNAL_SERVER_ERROR });
    }

    return new Response(null, { status: status.BAD_REQUEST });
  } catch (error) {
    console.error(error);
    return new Response(null, { status: status.INTERNAL_SERVER_ERROR });
  }
}

import { NextRequest } from "next/server";

import status from "http-status";

import { createUser } from "@/services/users/create-user";
import { isUserCreationReqBody } from "@/types/user";
import { parseRequestBody } from "@/utils/server/parse-request-body";
import { userTokenUtils } from "@/utils/server/user-tokens/user-token-utils";

export async function POST(request: NextRequest) {
  const userTokens = userTokenUtils.routeHandler(request);

  if (userTokens) {
    return new Response(null, { status: status.CONFLICT });
  }

  const body = parseRequestBody(await request.text(), isUserCreationReqBody);
  if (body instanceof Response) {
    return body;
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

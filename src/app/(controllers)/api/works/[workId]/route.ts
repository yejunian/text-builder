import { NextRequest } from "next/server";

import status from "http-status";

import { readWork } from "@/services/works/read-work";
import { userTokenUtils } from "@/utils/server/user-tokens/user-token-utils";

// 계정이 소유한 작업과 작업이 포함하는 필드 조회
export async function GET(request: NextRequest, { params }: GetContext) {
  const userTokens = userTokenUtils.routeHandler(request);

  if (!userTokens) {
    return new Response(null, { status: status.UNAUTHORIZED });
  }

  const { workId } = await params;

  const result = await readWork({
    ownerId: userTokens.access.payload.sub,
    workId,
  });

  if (result === "not-found") {
    return new Response(null, { status: status.NOT_FOUND });
  } else if (typeof result === "string") {
    // result === "unknown"
    return new Response(null, { status: status.INTERNAL_SERVER_ERROR });
  }

  return Response.json(result, { status: status.OK });
}

type GetContext = {
  params: Promise<{
    workId: string;
  }>;
};

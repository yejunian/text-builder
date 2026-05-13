import { NextRequest } from "next/server";

import status from "http-status";

import { reorderAllWorkFields } from "@/services/work-fields/reorder-all-work-fields";
import { isAllWorkFieldsReorderReqBody } from "@/types/work-field";
import { parseRequestBody } from "@/utils/server/parse-request-body";
import { userTokenUtils } from "@/utils/server/user-tokens/user-token-utils";

// 작업 필드 순서 변경
export async function POST(request: NextRequest, { params }: PostContext) {
  const userTokens = userTokenUtils.routeHandler(request);

  if (!userTokens) {
    return new Response(null, { status: status.UNAUTHORIZED });
  }

  const body = parseRequestBody(
    await request.text(),
    isAllWorkFieldsReorderReqBody,
  );
  if (body instanceof Response) {
    return body;
  }

  const { workId } = await params;

  const result = await reorderAllWorkFields({
    ownerId: userTokens.access.payload.sub,
    workId,
    order: body.order,
  });

  if (!result) {
    return new Response(null, { status: status.INTERNAL_SERVER_ERROR });
  }

  return Response.json(result, { status: status.OK });
}

type PostContext = {
  params: Promise<{
    workId: string;
  }>;
};

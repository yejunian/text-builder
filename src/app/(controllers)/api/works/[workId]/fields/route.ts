import { NextRequest } from "next/server";

import status from "http-status";

import { createWorkField } from "@/services/work-fields/create-work-fields";
import { isWorkFieldCreationReqBody } from "@/types/work-field";
import { parseRequestBody } from "@/utils/server/parse-request-body";
import { userTokenUtils } from "@/utils/server/user-tokens/user-token-utils";

// 새 작업 필드 생성
export async function POST(request: NextRequest, { params }: PostContext) {
  const userTokens = userTokenUtils.routeHandler(request);

  if (!userTokens) {
    return new Response(null, { status: status.UNAUTHORIZED });
  }

  const body = parseRequestBody(
    await request.text(),
    isWorkFieldCreationReqBody,
  );
  if (body instanceof Response) {
    return body;
  }

  const { workId } = await params;

  const result = await createWorkField({
    parentId: workId,
    // order: body.order,
    name: body.name,
    type: body.type,
    value: body.value,
    isPublic: body.isPublic,
  });

  if (result === "duplicated") {
    return new Response(null, { status: status.BAD_REQUEST });
  } else if (result === "unknown") {
    return new Response(null, { status: status.INTERNAL_SERVER_ERROR });
  }

  return Response.json(result, { status: status.CREATED });
}

type PostContext = {
  params: Promise<{
    workId: string;
  }>;
};

import { NextRequest } from "next/server";

import status from "http-status";

import { createWorkField } from "@/services/work-fields/create-work-fields";
import { isWorkFieldCreationReqBody } from "@/types/work-field";
import { userTokenUtils } from "@/utils/server/user-tokens/user-token-utils";

// 새 작업 필드 생성
export async function POST(request: NextRequest, { params }: PostContext) {
  const userTokens = userTokenUtils.routeHandler(request);

  if (!userTokens) {
    return new Response(null, { status: status.UNAUTHORIZED });
  }

  let _body: unknown;
  try {
    _body = await request.json();
  } catch (_error) {
    // JSON이 아닌 요청 본문
    return new Response(null, { status: status.BAD_REQUEST });
  }
  const body = _body;

  const { workId } = await params;

  if (!isWorkFieldCreationReqBody(body)) {
    return new Response(null, { status: status.BAD_REQUEST });
  }

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
  }

  if (result === "unknown") {
    return new Response(null, { status: status.INTERNAL_SERVER_ERROR });
  }

  return Response.json(result, { status: status.CREATED });
}

type PostContext = {
  params: Promise<{
    workId: string;
  }>;
};

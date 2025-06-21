import { NextRequest } from "next/server";

import status from "http-status";

import { modifyWorkField } from "@/services/work-fields/modify-work-field";
import { isWorkFieldCreationReqBody } from "@/types/work-field";
import { getUserTokens } from "@/utils/server/user-tokens/get-user-tokens";

export async function PUT(request: NextRequest, { params }: PutContext) {
  const userTokens = await getUserTokens(request);

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

  const { workId, workFieldId } = await params;

  if (!isWorkFieldCreationReqBody(body)) {
    return new Response(null, { status: status.BAD_REQUEST });
  }

  const result = await modifyWorkField({
    ownerId: userTokens.access.payload.sub,
    parentId: workId,
    workFieldId,
    // order: body.order,
    name: body.name,
    type: body.type,
    value: body.value,
    isPublic: body.isPublic,
  });

  if (result === "ok") {
    return new Response(null, { status: status.OK });
  } else if (result === "not-found") {
    return new Response(null, { status: status.NOT_FOUND });
  } else if (result === "too-many-updated") {
    // TODO: 성공은 했고 데이터 변경도 일어났지만 이상한 상황
    return new Response(null, { status: status.OK });
  } else {
    // result === "unknown"
    return new Response(null, { status: status.INTERNAL_SERVER_ERROR });
  }
}

type PutContext = {
  params: Promise<{
    workId: string;
    workFieldId: string;
  }>;
};

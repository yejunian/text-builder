import { NextRequest } from "next/server";

import status from "http-status";

import { modifyWorkField } from "@/services/work-fields/modify-work-field";
import { removeWorkField } from "@/services/work-fields/remove-work-field";
import { isWorkFieldCreationReqBody } from "@/types/work-field";
import { parseRequestBody } from "@/utils/server/parse-request-body";
import { userTokenUtils } from "@/utils/server/user-tokens/user-token-utils";

export async function PUT(request: NextRequest, { params }: PutContext) {
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

  const { workId, workFieldId } = await params;

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

  if (typeof result === "string") {
    if (result === "not-found" || result === "duplicated") {
      // 변경하려는 대상이 없거나, 변경 결과로 중복이 발생해서 취소됨.
      return new Response(null, { status: status.NOT_FOUND });
    } else if (result === "too-many-updated") {
      // DB 무결성이 깨짐. 2개 이상 변경하려고 해서 취소됨.
      return new Response(null, { status: status.INTERNAL_SERVER_ERROR });
    } else {
      // result === "unknown"
      return new Response(null, { status: status.INTERNAL_SERVER_ERROR });
    }
  }

  return Response.json(result, { status: status.OK });
}

export async function DELETE(request: NextRequest, { params }: PutContext) {
  const userTokens = userTokenUtils.routeHandler(request);

  if (!userTokens) {
    return new Response(null, { status: status.UNAUTHORIZED });
  }

  const { workId, workFieldId } = await params;

  const result = await removeWorkField({
    ownerId: userTokens.access.payload.sub,
    parentId: workId,
    workFieldId,
  });

  // TODO: 실패 상황 세분화
  return result
    ? new Response(null, { status: status.OK })
    : new Response(null, { status: status.NOT_FOUND });
}

type PutContext = {
  params: Promise<{
    workId: string;
    workFieldId: string;
  }>;
};

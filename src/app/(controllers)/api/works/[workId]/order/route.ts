import { NextRequest } from "next/server";

import status from "http-status";

import { reorderAllWorkFields } from "@/services/work-fields/reorder-all-work-fields";
import { isAllWorkFieldsReorderReqBody } from "@/types/work-field";
import { userTokenUtils } from "@/utils/server/user-tokens/user-token-utils";

// 작업 필드 순서 변경
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

  if (!isAllWorkFieldsReorderReqBody(body)) {
    return new Response(null, { status: status.BAD_REQUEST });
  }

  const success = await reorderAllWorkFields({
    ownerId: userTokens.access.payload.sub,
    workId,
    order: body.order,
  });

  if (success) {
    return new Response(null, { status: status.OK });
  } else {
    return new Response(null, { status: status.INTERNAL_SERVER_ERROR });
  }
}

type PostContext = {
  params: Promise<{
    workId: string;
  }>;
};

import { NextRequest } from "next/server";

import status from "http-status";

import { modifyWork } from "@/services/works/modify-work";
import { readWork } from "@/services/works/read-work";
import { removeWork } from "@/services/works/remove-work";
import { isWorkUpsertionReqBody } from "@/types/work";
import { userTokenUtils } from "@/utils/server/user-tokens/user-token-utils";

// 계정이 소유한 작업과 작업이 포함하는 필드 조회
export async function GET(request: NextRequest, { params }: RequestContext) {
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

export async function PUT(request: NextRequest, { params }: RequestContext) {
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

  if (!isWorkUpsertionReqBody(body)) {
    return new Response(null, { status: status.BAD_REQUEST });
  }

  const result = await modifyWork({
    ownerId: userTokens.access.payload.sub,
    workId,
    title: body.title,
    slug: body.slug,
  });

  if (result === "ok") {
    return new Response(null, { status: status.OK });
  } else if (result === "duplicated") {
    return new Response(null, { status: status.BAD_REQUEST });
  } else if (result === "not-found") {
    return new Response(null, { status: status.NOT_FOUND });
  } else {
    return new Response(null, { status: status.INTERNAL_SERVER_ERROR });
  }
}

export async function DELETE(request: NextRequest, { params }: RequestContext) {
  const userTokens = userTokenUtils.routeHandler(request);

  if (!userTokens) {
    return new Response(null, { status: status.UNAUTHORIZED });
  }

  const { workId } = await params;

  const result = await removeWork({
    ownerId: userTokens.access.payload.sub,
    workId,
  });

  if (result === false) {
    return new Response(null, { status: status.NOT_FOUND });
  }

  return Response.json(result, { status: status.OK });
}

type RequestContext = {
  params: Promise<{
    workId: string;
  }>;
};

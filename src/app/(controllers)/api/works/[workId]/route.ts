import { NextRequest } from "next/server";

import status from "http-status";

import { modifyWork } from "@/services/works/modify-work";
import { readWork } from "@/services/works/read-work";
import { removeWork } from "@/services/works/remove-work";
import { isWorkUpsertionReqBody } from "@/types/work";
import { parseRequestBody } from "@/utils/server/parse-request-body";
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

// 특정 작업의 메타데이터 수정
export async function PUT(request: NextRequest, { params }: RequestContext) {
  const userTokens = userTokenUtils.routeHandler(request);

  if (!userTokens) {
    return new Response(null, { status: status.UNAUTHORIZED });
  }

  const body = parseRequestBody(await request.text(), isWorkUpsertionReqBody);
  if (body instanceof Response) {
    return body;
  }

  const { workId } = await params;

  const result = await modifyWork({
    ownerId: userTokens.access.payload.sub,
    workId,
    title: body.title,
    slug: body.slug,
  });

  if (typeof result === "string") {
    if (result === "duplicated") {
      return new Response(null, { status: status.BAD_REQUEST });
    } else if (result === "not-found") {
      return new Response(null, { status: status.NOT_FOUND });
    } else {
      return new Response(null, { status: status.INTERNAL_SERVER_ERROR });
    }
  }

  return Response.json(result, { status: status.OK });
}

// 특정 작업 삭제
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

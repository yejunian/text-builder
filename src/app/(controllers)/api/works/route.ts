import { NextRequest } from "next/server";

import status from "http-status";

import { createWork } from "@/services/works/create-work";
import { readAllWorks } from "@/services/works/read-all-works";
import { isWorkUpsertionReqBody } from "@/types/work";
import { userTokenUtils } from "@/utils/server/user-tokens/user-token-utils";

// 계정이 소유한 작업 목록 조회
export async function GET(request: NextRequest) {
  const userTokens = userTokenUtils.routeHandler(request);

  if (!userTokens) {
    return new Response(null, { status: status.UNAUTHORIZED });
  }

  const result = await readAllWorks({
    ownerId: userTokens.access.payload.sub,
  });

  if (typeof result === "string") {
    return new Response(null, { status: status.INTERNAL_SERVER_ERROR });
  }

  return Response.json(result, { status: status.OK });
}

// 계정 소유의 새 작업 생성
export async function POST(request: NextRequest) {
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

  if (!isWorkUpsertionReqBody(body)) {
    return new Response(null, { status: status.BAD_REQUEST });
  }

  const result = await createWork({
    ...body,
    ownerId: userTokens.access.payload.sub,
  });

  if (result === "duplicated") {
    return new Response(null, { status: status.BAD_REQUEST });
  }

  if (result === "unknown") {
    return new Response(null, { status: status.INTERNAL_SERVER_ERROR });
  }

  return Response.json(result, { status: status.CREATED });
}

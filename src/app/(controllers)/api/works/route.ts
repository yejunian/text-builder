import status from "http-status";

import { getUserTokens } from "@/services/users/get-user-tokens";
import { createWork } from "@/services/works/create-work";

// 계정이 소유한 작업 목록 조회
export async function GET(request: Request) {
  const userTokens = await getUserTokens();

  if (!userTokens) {
    return new Response(null, { status: status.UNAUTHORIZED });
  }

  // TODO: 계정이 소유한 작업 목록 조회
}

// 계정 소유의 새 작업 생성
export async function POST(request: Request) {
  const userTokens = await getUserTokens();

  if (!userTokens) {
    return new Response(null, { status: status.UNAUTHORIZED });
  }

  let _body: unknown;
  try {
    _body = await request.json();
  } catch (error) {
    // JSON이 아닌 요청 본문
    return new Response(null, { status: status.BAD_REQUEST });
  }
  const body = _body;

  if (!isWorkCreationReqBody(body)) {
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

type WorkCreationReqBody = {
  slug: string;
  title: string;
};

function isWorkCreationReqBody(obj: any): obj is WorkCreationReqBody {
  if (
    !obj?.slug ||
    typeof obj.slug !== "string" ||
    obj.slug.length > 150 ||
    /[^a-z0-9._-]|^\.|\.$|\.\.|^[._-]+$/.test(obj.slug)
  ) {
    return false;
  }

  if (!obj?.title || typeof obj.title !== "string") {
    return false;
  }

  return true;
}

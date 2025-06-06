import { NextRequest, NextResponse } from "next/server";

import status from "http-status";

import { getUserTokens } from "@/utils/server/user-tokens/get-user-tokens";

export async function GET(request: NextRequest) {
  const userTokens = await getUserTokens(request);

  if (!userTokens) {
    return new Response(null, { status: status.CONFLICT });
  }

  const response = NextResponse.redirect(
    new URL("/", request.url),
    status.TEMPORARY_REDIRECT,
  );

  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");

  return response;
}

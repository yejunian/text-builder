import { NextRequest, NextResponse } from "next/server";

import status from "http-status";

import { userTokenUtils } from "@/utils/server/user-tokens/user-token-utils";

export async function GET(request: NextRequest) {
  const userTokens = userTokenUtils.routeHandler(request);

  if (!userTokens) {
    return new Response(null, { status: status.CONFLICT });
  }

  const response = new NextResponse(null, { status: status.OK });

  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");

  return response;
}

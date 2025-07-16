import { NextRequest } from "next/server";

import status from "http-status";

import { userTokenUtils } from "@/utils/server/user-tokens/user-token-utils";

export async function GET(request: NextRequest) {
  const userTokens = userTokenUtils.routeHandler(request);
  const targetPath = userTokens ? "/works" : "/login";

  return Response.redirect(
    new URL(targetPath, request.url),
    status.TEMPORARY_REDIRECT,
  );
}

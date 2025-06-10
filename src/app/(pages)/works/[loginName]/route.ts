import { NextRequest } from "next/server";

import status from "http-status";

export async function GET(request: NextRequest, { params }: GetContext) {
  if (request.cookies.get("accessToken")?.value) {
    return Response.redirect(
      new URL("/works", request.url),
      status.TEMPORARY_REDIRECT,
    );
  } else {
    return Response.redirect(
      new URL("/login", request.url),
      status.TEMPORARY_REDIRECT,
    );
  }
}

type GetContext = {
  params: Promise<{
    loginName: string;
  }>;
};

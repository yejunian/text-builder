import { cookies } from "next/headers";

import status from "http-status";

import { deleteUserRefreshToken } from "@/repositories/user-tokens/delete-user-refresh-token";
import { getUserTokens } from "@/services/users/get-user-tokens";

export async function GET(request: Request) {
  const userTokens = await getUserTokens();

  if (!userTokens) {
    return new Response(null, { status: status.UNAUTHORIZED });
  }

  const tokenDeleteSuccess = await deleteUserRefreshToken(
    userTokens.refresh.payload.sub,
    userTokens.refresh.payload.jti,
  );

  if (!tokenDeleteSuccess) {
    console.error("Refresh token revocation error");
    return new Response(null, { status: status.INTERNAL_SERVER_ERROR });
  }

  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");

  return Response.redirect(
    new URL("/", request.url),
    status.TEMPORARY_REDIRECT,
  );
}

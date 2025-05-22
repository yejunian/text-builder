import { cookies } from "next/headers";

import status from "http-status";

import { deleteUserRefreshToken } from "@/repositories/user-tokens/delete-user-refresh-token";
import { getUserTokens } from "@/services/users/get-user-tokens";

export async function GET(request: Request) {
  const userTokens = await getUserTokens();

  if (!userTokens) {
    return new Response(null, { status: status.UNAUTHORIZED });
  }

  let _userId: number;
  try {
    _userId = parseInt(userTokens.access.payload.sub, 10);
  } catch (error) {
    console.error("User ID in token parsing error");
    return new Response(null, { status: status.INTERNAL_SERVER_ERROR });
  }
  const userId = _userId;

  const tokenDeleteSuccess = await deleteUserRefreshToken(
    userId,
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

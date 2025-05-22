import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";

import { jwtExpToDateValue, UserTokenPair } from "@/utils/server/user-token";

import { verifyUserTokens } from "../user-tokens/verify-user-tokens";

export async function getUserTokens(): Promise<UserTokenPair | null> {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get("accessToken")?.value || null;
  const refreshToken = cookieStore.get("refreshToken")?.value || null;

  const result =
    accessToken && refreshToken
      ? await verifyUserTokens(accessToken, refreshToken)
      : "no_token";

  if (typeof result === "string") {
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");

    return null;
  }

  if (result.reissued) {
    const defaultCookie: Partial<ResponseCookie> = {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    };

    cookieStore.set("accessToken", result.access.token, {
      ...defaultCookie,
      expires: new Date(jwtExpToDateValue(result.access.payload.exp)),
    });
    cookieStore.set("refreshToken", result.refresh.token, {
      ...defaultCookie,
      expires: new Date(jwtExpToDateValue(result.refresh.payload.exp)),
    });
  }

  return result;
}

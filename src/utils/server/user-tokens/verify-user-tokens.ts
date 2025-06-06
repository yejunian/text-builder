import { decodeJwt, jwtVerify, JWTVerifyOptions } from "jose";
import { JWTExpired } from "jose/errors";

import {
  isUserTokenPayload,
  UserTokenPair,
  UserTokenPayload,
} from "@/types/server/user-token";

import { ENV_SECRET_ACCESS_TOKEN, ENV_SECRET_REFRESH_TOKEN } from "../env";
import { issueUserTokens } from "./issue-user-tokens";

export async function verifyUserTokens(
  accessToken: string | null,
  refreshToken: string,
): Promise<TokenVerificationResult> {
  const rtPayload = decodeJwt(refreshToken);

  if (!isUserTokenPayload(rtPayload)) {
    return "payload";
  }

  if (!accessToken) {
    return await reissueUserTokens(rtPayload.sub, refreshToken);
  }

  const atPayload = decodeJwt(accessToken);

  if (!isUserTokenPayload(atPayload) || atPayload.sub !== rtPayload.sub) {
    return "payload";
  }

  const atResult = await verifyJsonWebToken(
    accessToken,
    ENV_SECRET_ACCESS_TOKEN,
  );

  if (atResult === "payload") {
    return "payload";
  }

  if (atResult === "expired") {
    return await reissueUserTokens(rtPayload.sub, refreshToken);
  }

  // 성공(갱신 없음): 정상 토큰
  return {
    reissued: false,
    access: {
      token: accessToken,
      payload: atResult,
    },
    refresh: {
      token: refreshToken,
      payload: rtPayload,
    },
  };
}

async function reissueUserTokens(
  userId: string,
  refreshToken: string,
): Promise<TokenVerificationResult> {
  const rtResult = await verifyJsonWebToken(
    refreshToken,
    ENV_SECRET_REFRESH_TOKEN,
  );

  if (typeof rtResult === "string") {
    return rtResult;
  }

  const userTokens = await issueUserTokens(userId);

  if (!userTokens) {
    return "reissue";
  }

  // 성공(토큰 갱신): 액세스 토큰 만료, 정상 리프레시 토큰
  return {
    ...userTokens,
    reissued: true,
  };
}

async function verifyJsonWebToken(
  token: string,
  secret: Uint8Array,
  verifyOptions: JWTVerifyOptions = {},
): Promise<UserTokenPayload | JwtFailure> {
  try {
    const { payload } = await jwtVerify<UserTokenPayload>(token, secret, {
      ...verifyOptions,
      issuer: "text-builder",
    });

    return payload;
  } catch (error) {
    if (error instanceof JWTExpired) {
      return "expired";
    } else {
      return "payload";
    }
  }
}

export type TokenVerificationResult =
  | (UserTokenPair & { reissued: boolean })
  | UserTokenFailure;

export type UserTokenFailure = RefreshTokenFailure | "reissue";
export type RefreshTokenFailure = JwtFailure | "revoked";
export type JwtFailure = "expired" | "payload";

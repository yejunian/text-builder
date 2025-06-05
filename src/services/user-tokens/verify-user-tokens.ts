import { decodeJwt, jwtVerify, JWTVerifyOptions } from "jose";
import { JWTExpired } from "jose/errors";

import { deleteUserRefreshToken } from "@/repositories/user-tokens/delete-user-refresh-token";
import { selectUserRefreshToken } from "@/repositories/user-tokens/select-user-refresh-tokens";
import {
  accessTokenSecret,
  isUserTokenPayload,
  refreshTokenSecret,
  UserTokenPair,
  UserTokenPayload,
} from "@/utils/server/user-token";

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
    return await reissueUserTokens(rtPayload.sub, refreshToken, rtPayload.jti);
  }

  const atPayload = decodeJwt(accessToken);

  if (!isUserTokenPayload(atPayload) || atPayload.sub !== rtPayload.sub) {
    return "payload";
  }

  const atResult = await verifySingleToken(accessToken, "access");

  if (atResult === "payload") {
    return "payload";
  }

  if (atResult === "expired") {
    return await reissueUserTokens(rtPayload.sub, refreshToken, rtPayload.jti);
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
  refreshTokenJti: string,
): Promise<TokenVerificationResult> {
  const rtResult = await verifySingleToken(refreshToken, "refresh");

  // 결과가 어떻든 기존 리프레시 토큰은 삭제됨
  await deleteUserRefreshToken(userId, refreshTokenJti);

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

async function verifySingleToken(
  token: string,
  tokenType: "access",
): Promise<UserTokenPayload | JwtFailure>;
async function verifySingleToken(
  token: string,
  tokenType: "refresh",
): Promise<UserTokenPayload | RefreshTokenFailure>;
async function verifySingleToken(
  token: string,
  tokenType: "access" | "refresh",
): Promise<UserTokenPayload | RefreshTokenFailure> {
  const isRefreshToken = tokenType === "refresh";
  const secret = isRefreshToken ? refreshTokenSecret : accessTokenSecret;

  const payload = await verifyJsonWebToken(token, secret);

  if (typeof payload === "string") {
    return payload;
  }

  if (isRefreshToken) {
    const { sub, jti } = payload;
    const selectedToken = await selectUserRefreshToken(sub, jti);

    return selectedToken ? payload : "revoked";
  }

  return payload;
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

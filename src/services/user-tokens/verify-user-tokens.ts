import jwt from "jsonwebtoken";

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
  accessToken: string,
  refreshToken: string,
): Promise<TokenVerificationResult> {
  const atPayload = jwt.decode(accessToken, { json: true });
  const rtPayload = jwt.decode(refreshToken, { json: true });

  if (
    !isUserTokenPayload(atPayload) ||
    !isUserTokenPayload(rtPayload) ||
    atPayload.sub !== rtPayload.sub
  ) {
    return "payload";
  }

  let _userId: number;
  try {
    _userId = parseInt(atPayload.sub, 10);
  } catch (error) {
    return "payload";
  }
  const userId = _userId;

  const atResult = await verifySingleToken(accessToken, "access");

  if (atResult === "payload") {
    return "payload";
  }

  if (atResult === "expired") {
    return await reissueUserTokens(userId, refreshToken, rtPayload.jti);
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
  userId: number,
  refreshToken: string,
  refreshTokenJti: string,
): Promise<TokenVerificationResult> {
  // 결과가 어떻든 기존 리프레시 토큰이 삭제됨
  await deleteUserRefreshToken(userId, refreshTokenJti);

  const rtResult = await verifySingleToken(refreshToken, "refresh");

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

  const payload = verifyJsonWebToken(token, secret);

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

function verifyJsonWebToken(
  token: string,
  secret: string,
  verifyOptions: jwt.VerifyOptions = {},
): UserTokenPayload | JwtFailure {
  try {
    const payload = jwt.verify(token, secret, {
      ...verifyOptions,
      issuer: "text-builder",
    });

    return isUserTokenPayload(payload) ? payload : "payload";
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
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

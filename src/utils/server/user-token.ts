import { randomUUID } from "node:crypto";

import jwt from "jsonwebtoken";

import { deleteUserRefreshToken } from "@/repositories/user-tokens/delete-user-refresh-token";
import { insertUserRefreshToken } from "@/repositories/user-tokens/insert-user-refresh-token";
import { selectUserRefreshToken } from "@/repositories/user-tokens/select-user-refresh-tokens";
import { JsonValue } from "@/types/json-object";

// TODO: 내용을 DB 접근 유무 등 성격에 따라 services와 utils에 분리

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET!;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET!;

export function createJsonWebToken(
  privateClaims: JWTPrivateClaim | null,
  secret: string,
  signOptions: jwt.SignOptions = {},
): string | null {
  if (!secret) {
    return null;
  }

  return jwt.sign(privateClaims ?? {}, secret, {
    ...signOptions,
    issuer: "text-builder",
    jwtid: randomUUID(),
  });
}

export function createUserAccessToken(payload: UserTokenClaim): string | null {
  return createJsonWebToken(null, accessTokenSecret, {
    expiresIn: "1h",
    subject: payload.subject.toFixed(0),
  });
}

export function createUserRefreshToken(payload: UserTokenClaim): string | null {
  return createJsonWebToken(null, refreshTokenSecret, {
    expiresIn: "28d",
    subject: payload.subject.toFixed(0),
  });
}

export function jwtExpToDateValue(exp: number): number {
  return exp * 1000;
}

export function jwtExpToISOString(exp: number): string {
  return new Date(jwtExpToDateValue(exp)).toISOString();
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

async function reissueUserTokens(
  userId: number,
  refreshToken: string,
  refreshTokenJti: string,
): Promise<TokenVerificationResult | UserTokenFailure> {
  // 결과가 어떻든 기존 리프레시 토큰이 삭제됨
  await deleteUserRefreshToken(userId, refreshTokenJti);

  const rtResult = await verifySingleToken(refreshToken, "refresh");

  if (typeof rtResult === "string") {
    return rtResult;
  }

  const newAt = createUserAccessToken({ subject: userId });
  const newRt = createUserRefreshToken({ subject: userId });

  if (!newAt || !newRt) {
    return "reissue";
  }

  const newAtPayload = jwt.decode(newAt, { json: true });
  const newRtPayload = jwt.decode(newRt, { json: true });

  if (!isUserTokenPayload(newAtPayload) || !isUserTokenPayload(newRtPayload)) {
    return "reissue";
  }

  const tokenInsertSuccess = await insertUserRefreshToken({
    ownerId: userId,
    exp: new Date(newRtPayload.exp).toISOString(),
    jti: newRtPayload.jti,
  });

  if (!tokenInsertSuccess) {
    return "reissue";
  }

  // 성공(토큰 갱신): 액세스 토큰 만료, 정상 리프레시 토큰
  return {
    reissued: true,
    access: {
      token: newAt,
      payload: newAtPayload,
    },
    refresh: {
      token: newRt,
      payload: newRtPayload,
    },
  };
}

export async function verifyUserTokens(
  accessToken: string,
  refreshToken: string,
): Promise<TokenVerificationResult | UserTokenFailure> {
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

export function isUserTokenPayload(
  tokenPayload: any,
): tokenPayload is UserTokenPayload {
  const { iss, sub, exp, jti } = tokenPayload ?? {};

  return (
    iss === "text-builder" &&
    typeof sub === "string" &&
    typeof exp === "number" &&
    typeof jti === "string"
  );
}

export type JWTPrivateClaim = {
  [key: string]: JsonValue;
};

export type UserTokenClaim = {
  subject: number;
};

export type UserTokenPayload = {
  iss: "text-builder";
  sub: string;
  exp: number;
  jti: string;
};

export type JwtFailure = "expired" | "payload";
export type RefreshTokenFailure = JwtFailure | "revoked";
export type UserTokenFailure = RefreshTokenFailure | "reissue";

export type TokenVerificationResult = UserTokenPair | UserTokenFailure;

export type UserTokenPair = {
  reissued: boolean;
  access: DecodedUserToken;
  refresh: DecodedUserToken;
};

export type DecodedUserToken = {
  token: string;
  payload: UserTokenPayload;
};

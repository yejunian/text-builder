import jwt from "jsonwebtoken";
import { v7 as uuid7 } from "uuid";

import { JsonValue } from "@/types/json-object";

export const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET!;
export const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET!;

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
    jwtid: uuid7(),
  });
}

export function createUserAccessToken(payload: UserTokenClaim): string | null {
  return createJsonWebToken(null, accessTokenSecret, {
    expiresIn: "1h",
    subject: payload.subject,
  });
}

export function createUserRefreshToken(payload: UserTokenClaim): string | null {
  return createJsonWebToken(null, refreshTokenSecret, {
    expiresIn: "28d",
    subject: payload.subject,
  });
}

export function jwtExpToDateValue(exp: number): number {
  return exp * 1000;
}

export function jwtExpToISOString(exp: number): string {
  return new Date(jwtExpToDateValue(exp)).toISOString();
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

export type UserTokenPair = {
  access: DecodedUserToken;
  refresh: DecodedUserToken;
};

export type DecodedUserToken = {
  token: string;
  payload: UserTokenPayload;
};

export type UserTokenPayload = {
  iss: "text-builder";
  sub: string;
  exp: number;
  jti: string;
};

export type JWTPrivateClaim = {
  [key: string]: JsonValue;
};

export type UserTokenClaim = {
  subject: string;
};

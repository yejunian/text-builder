import { randomUUID } from "node:crypto";

import jwt from "jsonwebtoken";

import { JsonValue } from "@/types/json-object";

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET!;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET!;

export function createJsonWebToken(
  privateClaims: JWTPrivateClaim | null,
  secret: string,
  signOptions: jwt.SignOptions,
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
    subject: payload.subject,
  });
}

export function createUserRefreshToken(payload: UserTokenClaim): string | null {
  return createJsonWebToken(null, refreshTokenSecret, {
    expiresIn: "28d",
    subject: payload.subject,
  });
}

export function getExpirationTime(token: string): number | null {
  const payload = Buffer.from(token.split(".")[1], "base64url").toString();

  try {
    const expirationTime = JSON.parse(payload).exp;

    if (typeof expirationTime === "number") {
      return expirationTime * 1000;
    }
  } catch (error) {
    // No operation
  }

  return null;
}

export type JWTPrivateClaim = {
  [key: string]: JsonValue;
};

export type UserTokenClaim = {
  subject: string;
};

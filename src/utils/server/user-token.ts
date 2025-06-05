import { SignJWT } from "jose";
import { v7 as uuid7 } from "uuid";

export const accessTokenSecret = new TextEncoder().encode(
  process.env.ACCESS_TOKEN_SECRET,
);
export const refreshTokenSecret = new TextEncoder().encode(
  process.env.REFRESH_TOKEN_SECRET,
);

export async function createJsonWebToken(
  secret: Uint8Array,
  subject: string,
  expirationTime: number | string | Date,
): Promise<string | null> {
  if (!secret.length) {
    return null;
  }

  return await new SignJWT()
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer("text-builder")
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .setSubject(subject)
    .setJti(uuid7())
    .sign(secret);
}

export async function createUserAccessToken(
  subject: string,
): Promise<string | null> {
  return createJsonWebToken(accessTokenSecret, subject, "1h");
}

export function createUserRefreshToken(
  subject: string,
): Promise<string | null> {
  return createJsonWebToken(refreshTokenSecret, subject, "28d");
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
  const { iss, iat, sub, exp, jti } = tokenPayload ?? {};

  return (
    iss === "text-builder" &&
    typeof iat === "number" &&
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
  iat: number;
  iss: "text-builder";
  sub: string;
  exp: number;
  jti: string;
};

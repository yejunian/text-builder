import { SignJWT } from "jose";
import { v7 as uuid7 } from "uuid";

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

export function jwtExpToDateValue(exp: number): number {
  return exp * 1000;
}

export function jwtExpToISOString(exp: number): string {
  return new Date(jwtExpToDateValue(exp)).toISOString();
}

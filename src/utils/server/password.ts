import { pbkdf2Sync, randomBytes } from "node:crypto";

export function createSalt() {
  return randomBytes(16).toString("base64url");
}

export function hashPassword(password: string, salt: string) {
  return pbkdf2Sync(password, salt, 100000, 256, "sha512").toString(
    "base64url",
  );
}

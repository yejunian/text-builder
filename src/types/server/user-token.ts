import isObject from "../is-object";

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

export function isUserTokenPayload(
  tokenPayload: unknown,
): tokenPayload is UserTokenPayload {
  if (!isObject(tokenPayload)) {
    return false;
  }

  const { iss, iat, sub, exp, jti } = tokenPayload ?? {};

  return (
    iss === "text-builder" &&
    typeof iat === "number" &&
    typeof sub === "string" &&
    typeof exp === "number" &&
    typeof jti === "string"
  );
}

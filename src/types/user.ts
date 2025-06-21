import { forbiddenNamePattern, hasControlCharacters } from "@/utils/strings";

import isObject from "./is-object";

export type UserCreationReqBody = {
  loginName: string;
  displayName?: string | null | undefined;
  password: string;
};

export function isUserCreationReqBody(
  obj: unknown,
): obj is UserCreationReqBody {
  if (!isObject(obj)) {
    return false;
  }

  if (!isLoginName(obj?.loginName)) {
    return false;
  }

  if (!isDisplayName(obj?.displayName)) {
    return false;
  }

  if (!obj?.password || typeof obj.password !== "string") {
    return false;
  }

  return true;
}

export function isLoginName(str: unknown): boolean {
  return (
    !!str &&
    typeof str === "string" &&
    str.length >= 3 &&
    str.length <= 30 &&
    !forbiddenNamePattern.test(str)
  );
}

export function isDisplayName(str: unknown): boolean {
  return (
    str === null ||
    str === undefined ||
    (typeof str === "string" &&
      str.length > 0 &&
      str.length <= 100 &&
      !hasControlCharacters(str))
  );
}

export type UserLoginReqBody = {
  loginName: string;
  password: string;
};

export function isUserLoginReqBody(obj: unknown): obj is UserLoginReqBody {
  if (!isObject(obj)) {
    return false;
  }

  if (!obj?.loginName || typeof obj.loginName !== "string") {
    return false;
  }

  if (!obj?.password || typeof obj.password !== "string") {
    return false;
  }

  return true;
}

export type UserLoginResBody = {
  loginName: string;
  displayName: string | null;
};

export function isUserLoginResBody(obj: unknown): obj is UserLoginResBody {
  if (!isObject(obj)) {
    return false;
  }

  if (!obj?.loginName || typeof obj.loginName !== "string") {
    return false;
  }

  if (obj?.displayName && typeof obj.displayName !== "string") {
    return false;
  }

  return true;
}

import jwt from "jsonwebtoken";

import { insertUserRefreshToken } from "@/repositories/user-tokens/insert-user-refresh-token";
import { selectUserWithPassword } from "@/repositories/users/select-user-password";
import { hashPassword } from "@/utils/server/password";
import {
  createUserAccessToken,
  createUserRefreshToken,
  isUserTokenPayload,
  jwtExpToISOString,
  UserTokenPair,
  UserTokenPayload,
} from "@/utils/server/user-token";

import { getUserTokens } from "./get-user-tokens";

export async function loginUser(user: UserLogin): Promise<UserLoginResult> {
  const userTokens = await getUserTokens();

  if (userTokens) {
    return "logged_in";
  }

  const selectedUser = await selectUserWithPassword(user.loginName);

  if (!selectedUser) {
    return "password";
  }

  const passedHash = hashPassword(user.password, selectedUser.passwordSalt);

  if (passedHash !== selectedUser.passwordHash) {
    return "password";
  }

  try {
    const userId = selectedUser.userId;

    const accessToken = createUserAccessToken({ subject: userId });
    const refreshToken = createUserRefreshToken({ subject: userId });

    if (!accessToken || !refreshToken) {
      return "token";
    }

    const atPayload = jwt.decode(accessToken, { json: true });
    const rtPayload = jwt.decode(refreshToken, { json: true });

    if (!isUserTokenPayload(atPayload) || !isUserTokenPayload(rtPayload)) {
      return "token";
    }

    const tokenInsertSuccess = await insertUserRefreshToken({
      ownerId: userId,
      exp: jwtExpToISOString(rtPayload.exp),
      jti: rtPayload.jti,
    });

    if (!tokenInsertSuccess) {
      return "token";
    }

    return {
      loginName: selectedUser.loginName,
      displayName: selectedUser.displayName,
      tokens: {
        access: {
          token: accessToken,
          payload: atPayload,
        },
        refresh: {
          token: refreshToken,
          payload: rtPayload,
        },
      },
    };
  } catch (error) {
    console.error(error);
    return "unknown";
  }
}

export type UserLogin = {
  loginName: string;
  password: string;
};

export type UserLoginResult = UserLoginSuccess | UserLoginFailure;

export type UserLoginSuccess = {
  loginName: string;
  displayName: string | null;
  tokens: Omit<UserTokenPair, "reissued">;
};

export type UserLoginFailure = "logged_in" | "password" | "token" | "unknown";

export function isUserLogin(obj: any): obj is UserLogin {
  if (!obj?.loginName || typeof obj.loginName !== "string") {
    return false;
  }

  if (!obj?.password || typeof obj.password !== "string") {
    return false;
  }

  return true;
}

import { insertUserRefreshToken } from "@/repositories/user-tokens/insert-user-refresh-token";
import { selectUserWithPassword } from "@/repositories/users/select-user-password";
import { hashPassword } from "@/utils/server/password";
import {
  createUserAccessToken,
  createUserRefreshToken,
  getExpirationTime,
  getJwtId,
} from "@/utils/server/user-token";

export async function loginUser(user: UserLogin): Promise<UserLoginResult> {
  const selectedUser = await selectUserWithPassword(user.loginName);

  if (!selectedUser) {
    return "password";
  }

  const passedHash = hashPassword(user.password, selectedUser.passwordSalt);

  if (passedHash !== selectedUser.passwordHash) {
    return "password";
  }

  try {
    const accessToken = createUserAccessToken({ subject: user.loginName });
    const refreshToken = createUserRefreshToken({ subject: user.loginName });

    if (!accessToken || !refreshToken) {
      return "token";
    }

    const accessTokenExp = getExpirationTime(accessToken);
    const refreshTokenExp = getExpirationTime(refreshToken);
    const refreshTokenJti = getJwtId(refreshToken);

    if (!accessTokenExp || !refreshTokenExp || !refreshTokenJti) {
      return "token";
    }

    const tokenInsertSuccess = await insertUserRefreshToken({
      ownerId: selectedUser.userId,
      exp: new Date(refreshTokenExp).toISOString(),
      jti: refreshTokenJti,
    });

    if (!tokenInsertSuccess) {
      return "token";
    }

    return {
      loginName: selectedUser.loginName,
      displayName: selectedUser.displayName,
      accessToken,
      accessTokenExp,
      refreshToken,
      refreshTokenExp,
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
  accessToken: string;
  accessTokenExp: number;
  refreshToken: string;
  refreshTokenExp: number;
};

export type UserLoginFailure = "password" | "token" | "unknown";

export function isUserLogin(obj: any): obj is UserLogin {
  if (typeof obj.loginName !== "string") {
    return false;
  }

  if (typeof obj.password !== "string") {
    return false;
  }

  return true;
}

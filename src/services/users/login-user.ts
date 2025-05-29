import { selectUserWithPassword } from "@/repositories/users/select-user-password";
import { UserLoginReqBody } from "@/types/users";
import { hashPassword } from "@/utils/server/password";
import { UserTokenPair } from "@/utils/server/user-token";

import { issueUserTokens } from "../user-tokens/issue-user-tokens";
import { getUserTokens } from "./get-user-tokens";

export async function loginUser(
  user: UserLoginReqBody,
): Promise<UserLoginResult> {
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
    const userTokens = await issueUserTokens(userId);

    if (!userTokens) {
      return "token";
    }

    return {
      loginName: selectedUser.loginName,
      displayName: selectedUser.displayName,
      tokens: userTokens,
    };
  } catch (error) {
    console.error(error);
    return "unknown";
  }
}

export type UserLoginResult = UserLoginSuccess | UserLoginFailure;

export type UserLoginSuccess = {
  loginName: string;
  displayName: string | null;
  tokens: Omit<UserTokenPair, "reissued">;
};

export type UserLoginFailure = "logged_in" | "password" | "token" | "unknown";

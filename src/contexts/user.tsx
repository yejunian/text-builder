"use client";

import React, { createContext, useEffect, useMemo, useState } from "react";

import { STORAGE_KEY_USER } from "@/constants/local-storage";
import { useSendClientRequest } from "@/hooks/use-send-client-request";
import { isUserLoginResBody, UserLoginResBody } from "@/types/user";
import { nop } from "@/utils/nop";

export const UserContext = createContext<UserContextValue>({
  isLoggedIn: false,
  loginName: null,
  displayName: null,

  isInitialized: false,

  login: nop,
  logout: nop,
});

export function UserProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { sendClientRequest } = useSendClientRequest();

  const [loginName, setLoginName] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const item = JSON.parse(localStorage.getItem(STORAGE_KEY_USER) ?? "{}");

    if (isUserLoginResBody(item)) {
      setLoginName(item.loginName);
      setDisplayName(item.displayName);
    }

    setIsInitialized(true);
  }, []);

  const contextValue = useMemo<UserContextValue>(
    () => ({
      isLoggedIn: loginName ? true : false,
      loginName,
      displayName,

      isInitialized: isInitialized,

      login: ({ loginName: nextLoginName, displayName: nextDisplayName }) => {
        setLoginName(nextLoginName);
        setDisplayName(nextDisplayName);

        localStorage.setItem(
          STORAGE_KEY_USER,
          JSON.stringify({
            loginName: nextLoginName,
            displayName: nextDisplayName,
          }),
        );
      },

      logout: () => {
        setLoginName(null);
        setDisplayName(null);
        localStorage.removeItem(STORAGE_KEY_USER);
      },
    }),
    // 무시하는 항목: router
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loginName, displayName, isInitialized, sendClientRequest],
  );

  return <UserContext value={contextValue}>{children}</UserContext>;
}

type UserContextValue = {
  isLoggedIn: boolean;
  loginName: string | null;
  displayName: string | null;

  isInitialized: boolean;

  login: ({ loginName, displayName }: UserLoginResBody) => void;
  logout: () => void;
};

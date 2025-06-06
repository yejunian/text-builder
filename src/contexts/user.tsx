"use client";

import React, { createContext, useEffect, useMemo, useState } from "react";

import { isUserLoginResBody, UserLoginResBody } from "@/types/user";
import { nop } from "@/utils/nop";

const STORAGE_KEY = "text-builder--user";

export const UserContext = createContext<UserContextValue>({
  isLoggedIn: false,
  loginName: null,
  displayName: null,
  login: nop,
  logout: nop,
});

export function UserProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loginName, setLoginName] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const item = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");

    if (isUserLoginResBody(item)) {
      setLoginName(item.loginName);
      setDisplayName(item.displayName);
    }
  }, []);

  const contextValue = useMemo<UserContextValue>(
    () => ({
      isLoggedIn: loginName ? true : false,
      loginName,
      displayName,

      login: ({ loginName: nextLoginName, displayName: nextDisplayName }) => {
        setLoginName(nextLoginName);
        setDisplayName(nextDisplayName);

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            loginName: nextLoginName,
            displayName: nextDisplayName,
          }),
        );
      },

      logout: () => {
        setLoginName(null);
        setDisplayName(null);

        localStorage.removeItem(STORAGE_KEY);
      },
    }),
    [loginName, displayName],
  );

  return <UserContext value={contextValue}>{children}</UserContext>;
}

type UserContextValue = {
  isLoggedIn: boolean;
  loginName: string | null;
  displayName: string | null;

  login: ({ loginName, displayName }: UserLoginResBody) => void;
  logout: () => void;
};

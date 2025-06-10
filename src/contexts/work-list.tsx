"use client";

import React, { createContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AllWorksResBody, WorkMetadata } from "@/types/work";
import { nop } from "@/utils/nop";

export const WorkListContext = createContext<WorkListContextValue>({
  works: [],
  fetchWorks: nop,
});

export function WorkListProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  const [works, setWorks] = useState<WorkMetadata[]>([]);
  const [worksId, setWorksId] = useState("");

  const contextValue = useMemo<WorkListContextValue>(
    () => ({
      works,

      fetchWorks: async () => {
        try {
          const response = await fetch("/api/works");

          if (response.status === 401) {
            alert("로그인이 필요합니다.");
            router.push("/login");
            return;
          } else if (!response.ok) {
            return;
          }

          const { allWorks }: AllWorksResBody = await response.json();

          setWorks(
            allWorks.map((work) => ({
              ...work,
              createdAt: new Date(work.createdAt).toLocaleString("ko", {
                dateStyle: "medium",
                timeStyle: "short",
                hourCycle: "h23",
              }),
              updatedAt: new Date(work.updatedAt).toLocaleString("ko", {
                dateStyle: "medium",
                timeStyle: "short",
                hourCycle: "h23",
              }),
            })),
          );
          setWorksId(
            allWorks.reduce(
              (acc, { workId, updatedAt }) => `${acc}${workId}${updatedAt}`,
              "",
            ),
          );
        } catch (error) {
          console.error(error);
        }
      },
    }),
    [worksId],
  );

  return <WorkListContext value={contextValue}>{children}</WorkListContext>;
}

type WorkListContextValue = {
  works: WorkMetadata[];

  fetchWorks: () => void | Promise<void>;
};

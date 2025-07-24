"use client";

import React, { createContext, useMemo, useState } from "react";

import {
  SendClientRequestStates,
  useSendClientRequest,
} from "@/hooks/use-send-client-request";
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
  const { sendClientRequest } = useSendClientRequest();

  const [works, setWorks] = useState<WorkMetadata[]>([]);

  const contextValue = useMemo<WorkListContextValue>(
    () => ({
      works,

      fetchWorks: (state?: SendClientRequestStates) =>
        void sendClientRequest({
          state,

          request: {
            url: "/api/works",
          },

          response: {
            handler: {
              notOk: () => console.error("매크로 목록 로드 실패"),

              ok: ({ allWorks }: AllWorksResBody) =>
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
                ),
            },
          },
        }),
    }),
    // 무시하는 항목: sendClientRequest
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [works],
  );

  return <WorkListContext value={contextValue}>{children}</WorkListContext>;
}

type WorkListContextValue = {
  works: WorkMetadata[];

  fetchWorks: (state?: SendClientRequestStates) => void | Promise<void>;
};

"use client";

import React, { createContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Work, WorkMetadata } from "@/types/work";
import {
  WorkField,
  WorkFieldCreationReqBody,
  WorkFieldCreationResBody,
} from "@/types/work-field";
import { nop } from "@/utils/nop";

const emptyWorkMetadata = {
  workId: "",
  ownerId: "",
  slug: "",
  title: "",
  createdAt: "",
  updatedAt: "",
};

export const WorkContext = createContext<WorkContextValue>({
  workMetadata: { ...emptyWorkMetadata },
  workFields: { data: [] },
  fetchWorkWithFields: nop,
  createWorkField: nop,
  updateWorkField: nop,
});

export function WorkProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  const [workMetadata, setWorkMetadata] =
    useState<WorkMetadata>(emptyWorkMetadata);
  const [workFields, setWorkFields] = useState<{ data: WorkField[] }>({
    data: [],
  });
  const [contextMemoId, setContextMemoId] = useState(0);

  const contextValue = useMemo<WorkContextValue>(
    () => ({
      workMetadata: workMetadata,
      workFields: workFields,

      fetchWorkWithFields: async (workId?: string) => {
        try {
          const response = await fetch(
            `/api/works/${workId || workMetadata.workId}`,
          );

          if (response.status === 401) {
            alert("로그인이 필요합니다.");
            router.push("/login");
            return;
          } else if (!response.ok) {
            setWorkMetadata(emptyWorkMetadata);
            setContextMemoId(Date.now());
            return;
          }

          const { fields, ...nextWorkMetadata }: Work = await response.json();
          setWorkMetadata(nextWorkMetadata);
          setWorkFields({ data: fields });
          setContextMemoId(Date.now());
        } catch (error) {
          console.error(error);
        }
      },

      createWorkField: async (
        field: Pick<WorkFieldCreationReqBody, "name" | "value">,
      ) => {
        try {
          const requestbody: WorkFieldCreationReqBody = {
            ...field,
            type: "text",
            isPublic: true,
          };

          const response = await fetch(
            `/api/works/${workMetadata.workId}/fields`,
            {
              method: "post",
              body: JSON.stringify(requestbody),
            },
          );

          // TODO: API 요청 및 핸들링
          if (response.status === 401) {
            alert("로그인이 필요합니다.");
            router.push("/login");
            return;
          } else if (!response.ok) {
            alert("필드 생성에 실패했습니다.");
            return;
          }

          const { workFieldId }: WorkFieldCreationResBody =
            await response.json();
          // TODO: workFields에 workFieldId 넣어야 함.
          //       새로 추가하는 필드를 관리하는 방법이 정해지면 작성.
          // workFields.fields.at(-1)?.workFieldId = workFieldId;
          setWorkFields({ data: workFields.data });
          setContextMemoId(Date.now());
        } catch (error) {
          console.error(error);
        }
      },

      updateWorkField: (field: WorkFieldCreationReqBody) => {
        // TODO: API 요청 및 핸들링},
      },
    }),
    [contextMemoId],
  );

  return <WorkContext value={contextValue}>{children}</WorkContext>;
}

type WorkContextValue = {
  workMetadata: WorkMetadata;
  workFields: { data: WorkField[] };

  fetchWorkWithFields: (workId?: string) => void | Promise<void>;
  createWorkField: (field: WorkFieldCreationReqBody) => void | Promise<void>;
  updateWorkField: (field: WorkFieldCreationReqBody) => void | Promise<void>;
};

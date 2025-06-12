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
  workFields: [],
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
  const [workFields, setWorkFields] = useState<WorkField[]>([]);
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
          setWorkFields(fields);
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
          setWorkFields([...workFields]); // TODO: 뒤에 하나 추가
          setContextMemoId(Date.now());
        } catch (error) {
          console.error(error);
        }
      },

      updateWorkField: async (field: WorkField) => {
        const requestBody: WorkFieldCreationReqBody = {
          name: field.fieldName,
          type: field.fieldType,
          value: field.fieldValue,
          isPublic: field.isPublic,
        };

        const response = await fetch(
          `/api/works/${workMetadata.workId}/fields/${field.workFieldId}`,
          {
            method: "put",
            body: JSON.stringify(requestBody),
          },
        );

        if (!response.ok) {
          alert(`${field.fieldName} 필드를 변경하는 데 실패했습니다.`);
          return false;
        }

        const nextWorkFields = workFields.map<WorkField>((value) => {
          if (value.workFieldId === field.workFieldId) {
            return {
              ...value,
              fieldName: field.fieldName,
              fieldType: field.fieldType,
              fieldValue: field.fieldValue,
              isPublic: field.isPublic,
            };
          } else {
            return value;
          }
        });

        setWorkFields(nextWorkFields);
        setContextMemoId(Date.now());

        return true;
      },
    }),
    [contextMemoId],
  );

  return <WorkContext value={contextValue}>{children}</WorkContext>;
}

type WorkContextValue = {
  workMetadata: WorkMetadata;
  workFields: WorkField[];

  fetchWorkWithFields: (workId?: string) => void | Promise<void>;
  createWorkField: (field: WorkFieldCreationReqBody) => void | Promise<void>;
  updateWorkField: (field: WorkField) => void | Promise<boolean>;
};

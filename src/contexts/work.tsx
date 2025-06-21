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
  derivedFieldValues: {},
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

  const derivedFieldValues = useMemo<DerivedFieldValues>(() => {
    const result: DerivedFieldValues = {};

    for (let i = 0; i < workFields.length; i += 1) {
      const field = workFields[i];
      const fieldName = field.fieldName;
      result[fieldName] = field.fieldValue;

      for (let j = 0; j < i; j += 1) {
        const priorField = workFields[j];
        result[fieldName] = result[fieldName].replaceAll(
          "{{" + priorField.fieldName + "}}",
          result[priorField.fieldName],
        );
      }
    }

    return result;
  }, [workFields]);

  const contextValue = useMemo<WorkContextValue>(
    () => ({
      workMetadata,
      workFields,
      derivedFieldValues,

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
            setWorkFields([]);
            return;
          }

          const { fields, ...nextWorkMetadata }: Work = await response.json();
          setWorkMetadata(nextWorkMetadata);
          setWorkFields(fields);
        } catch (error) {
          console.error(error);
        }
      },

      createWorkField: async (field: WorkField) => {
        try {
          const requestbody: WorkFieldCreationReqBody = {
            name: field.fieldName,
            type: "text",
            value: field.fieldValue,
            isPublic: true,
          };

          const response = await fetch(
            `/api/works/${workMetadata.workId}/fields`,
            {
              method: "post",
              body: JSON.stringify(requestbody),
            },
          );

          if (response.status === 401) {
            alert("로그인이 필요합니다.");
            router.push("/login");
            return false;
          } else if (!response.ok) {
            alert("필드 생성에 실패했습니다.");
            return false;
          }

          // TODO: 응답으로, 생성된 새 필드 자체를 온전하게 받을 필요가 있음.
          const { workFieldId }: WorkFieldCreationResBody =
            await response.json();

          setWorkFields([
            ...workFields,
            {
              ...field,
              workFieldId,
            },
          ]);

          return true;
        } catch (error) {
          console.error(error);
          return false;
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

        if (response.status === 401) {
          alert("로그인이 필요합니다.");
          router.push("/login");
          return false;
        } else if (!response.ok) {
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

        return true;
      },
    }),
    // 무시하는 항목: router
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [workMetadata, workFields, derivedFieldValues],
  );

  return <WorkContext value={contextValue}>{children}</WorkContext>;
}

type WorkContextValue = {
  workMetadata: WorkMetadata;
  workFields: WorkField[];
  derivedFieldValues: DerivedFieldValues;

  fetchWorkWithFields: (workId?: string) => void | Promise<void>;
  createWorkField: (field: WorkField) => void | Promise<boolean>;
  updateWorkField: (field: WorkField) => void | Promise<boolean>;
};

type DerivedFieldValues = {
  [fieldName: string]: string;
};

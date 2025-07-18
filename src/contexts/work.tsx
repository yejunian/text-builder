"use client";

import React, { createContext, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import status from "http-status";

import { Work, WorkMetadata } from "@/types/work";
import {
  WorkField,
  WorkFieldCreationReqBody,
  WorkFieldCreationResBody,
} from "@/types/work-field";
import { getLoginUrl } from "@/utils/get-login-url";
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
  cycledFieldNames: new Set(),
  fetchWorkWithFields: nop,
  deleteWork: nop,
  createWorkField: nop,
  updateWorkField: nop,
  deleteWorkField: nop,
});

export function WorkProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  const [prevWorkId, setPrevWorkId] = useState("");
  const [workMetadata, setWorkMetadata] =
    useState<WorkMetadata>(emptyWorkMetadata);
  const [workFields, setWorkFields] = useState<WorkField[]>([]);
  const [cycledFieldNames, setCycledFieldNames] = useState<Set<string>>(
    new Set(),
  );

  const derivedFieldValues = useMemo<DerivedFieldValues>(() => {
    const fields: { [fieldName: string]: WorkField } = {};
    const partialOrders: { [fieldName: string]: Set<string> } = {};
    const inDegrees: { [fieldName: string]: number } = {};

    for (let i = 0; i < workFields.length; i += 1) {
      const field = workFields[i];
      const { fieldName, fieldValue } = field;
      fields[fieldName] = field;

      const fieldDeps = fieldValue
        .matchAll(/\{\{(.+?)\}\}/g)
        .map((execArray) => execArray[1]);
      let fieldInDegree = 0;

      for (const priorFieldName of fieldDeps) {
        fieldInDegree += 1;

        if (partialOrders[priorFieldName]) {
          partialOrders[priorFieldName].add(fieldName);
        } else {
          partialOrders[priorFieldName] = new Set([fieldName]);
        }
      }

      inDegrees[fieldName] = fieldInDegree;
    }

    const visitedQueue: string[] = [];

    for (const fieldName in inDegrees) {
      if (inDegrees[fieldName] === 0) {
        visitedQueue.push(fieldName);
      }
    }

    const order: string[] = [];

    while (visitedQueue.length > 0) {
      // 하나 dequeue해서 order에 push
      const currentFieldName = visitedQueue.shift()!;
      order.push(currentFieldName);

      // 방문하지 않은 다음 정점 inDegree 감소하고, 결과가 0이면 그 정점 enqueue
      if (partialOrders[currentFieldName] instanceof Set) {
        for (const nextFieldName of partialOrders[currentFieldName]) {
          inDegrees[nextFieldName] -= 1;

          if (inDegrees[nextFieldName] === 0) {
            visitedQueue.push(nextFieldName);
          }
        }
      }
    }

    const cycles: Set<string> = new Set();
    for (const fieldName in inDegrees) {
      if (inDegrees[fieldName] > 0) {
        cycles.add(fieldName);
      }
    }
    setCycledFieldNames(cycles);

    const result: DerivedFieldValues = {};

    for (let i = 0; i < order.length; i += 1) {
      const fieldName = order[i];
      const field = fields[fieldName];
      result[fieldName] = field.fieldValue;

      for (let j = 0; j < i; j += 1) {
        const priorFieldName = order[j];
        result[fieldName] = result[fieldName].replaceAll(
          "{{" + priorFieldName + "}}",
          result[priorFieldName],
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
      cycledFieldNames,

      fetchWorkWithFields: async (workId?: string) => {
        if (prevWorkId === workId) {
          return;
        }

        try {
          const response = await fetch(
            `/api/works/${workId || workMetadata.workId}`,
          );

          if (response.status === status.UNAUTHORIZED) {
            alert("로그인이 필요합니다.");
            router.push(getLoginUrl(pathname));
            return;
          } else if (!response.ok) {
            setPrevWorkId("");
            setWorkMetadata(emptyWorkMetadata);
            setWorkFields([]);
            return;
          }

          const { fields, ...nextWorkMetadata }: Work = await response.json();
          setPrevWorkId(nextWorkMetadata.workId);
          setWorkMetadata(nextWorkMetadata);
          setWorkFields(fields);
        } catch (error) {
          console.error(error);
        }
      },

      deleteWork: async (workId: string) => {
        const response = await fetch(`/api/works/${workId}`, {
          method: "delete",
        });

        if (response.status === status.UNAUTHORIZED) {
          alert("로그인이 필요합니다.");
          router.push(getLoginUrl(pathname));
          return;
        } else if (!response.ok) {
          alert(`"${workMetadata.title}" 매크로를 삭제할 수 없습니다.`);
          return;
        }

        alert(`"${workMetadata.title}" 매크로를 삭제했습니다.`);
        router.push("/works");
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

          if (response.status === status.UNAUTHORIZED) {
            alert("로그인이 필요합니다.");
            router.push(getLoginUrl(pathname));
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

        if (response.status === status.UNAUTHORIZED) {
          alert("로그인이 필요합니다.");
          router.push(getLoginUrl(pathname));
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

      deleteWorkField: async (workFieldId: string) => {
        const response = await fetch(
          `/api/works/${workMetadata.workId}/fields/${workFieldId}`,
          {
            method: "delete",
          },
        );

        if (response.status === status.UNAUTHORIZED) {
          alert("로그인이 필요합니다.");
          router.push(getLoginUrl(pathname));
          return false;
        } else if (!response.ok) {
          alert("필드를 삭제하는 데 실패했습니다.");
          return false;
        }

        const nextWorkFields = workFields.filter(
          (value) => value.workFieldId !== workFieldId,
        );

        setWorkFields(nextWorkFields);

        return true;
      },
    }),
    // 무시하는 항목: router
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      prevWorkId,
      workMetadata,
      workFields,
      derivedFieldValues,
      cycledFieldNames,
      pathname,
    ],
  );

  return <WorkContext value={contextValue}>{children}</WorkContext>;
}

type WorkContextValue = {
  workMetadata: WorkMetadata;
  workFields: WorkField[];
  derivedFieldValues: DerivedFieldValues;
  cycledFieldNames: Set<string>;

  fetchWorkWithFields: (workId?: string) => void | Promise<void>;
  deleteWork: (workId: string) => void | Promise<void>;
  createWorkField: (field: WorkField) => void | Promise<boolean>;
  updateWorkField: (field: WorkField) => void | Promise<boolean>;
  deleteWorkField: (workFieldId: string) => void | Promise<boolean>;
};

type DerivedFieldValues = {
  [fieldName: string]: string;
};

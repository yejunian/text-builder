"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useSendClientRequest } from "@/hooks/use-send-client-request";
import { Work, WorkMetadata, WorkUpsertionReqBody } from "@/types/work";
import {
  AllWorkFieldsReorderReqBody,
  WorkField,
  WorkFieldCreationReqBody,
  WorkFieldCreationResBody,
} from "@/types/work-field";
import { nop } from "@/utils/nop";

import { UserContext } from "./user";

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

  isWaitingWorkResponse: true,
  isWaitingFieldResponses: true,
  waitingFieldResponses: { data: new Set() },

  fetchWorkWithFields: nop,
  updateWork: nop,
  deleteWork: nop,
  createWorkField: nop,
  updateWorkField: nop,
  updateAllWorkFieldsOrder: nop,
  deleteWorkField: nop,
});

export function WorkProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  const { loginName } = useContext(UserContext);

  const { sendClientRequest } = useSendClientRequest();

  const [prevWorkId, setPrevWorkId] = useState("");
  const [workMetadata, setWorkMetadata] =
    useState<WorkMetadata>(emptyWorkMetadata);
  const [workFields, setWorkFields] = useState<WorkField[]>([]);
  const [cycledFieldNames, setCycledFieldNames] = useState<Set<string>>(
    new Set(),
  );
  const [isWaitingWorkResponse, setIsWaitingWorkResponse] = useState(true);
  const [waitingFieldResponses, setWaitingFieldResponses] = useState({
    data: new Set<string>(),
  });

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

  const setWaitingFieldResponsesWith = (fieldId: string) => {
    return (value: boolean) => {
      const { data } = waitingFieldResponses;

      if (value) {
        data.add(fieldId);
      } else {
        data.delete(fieldId);
      }

      setWaitingFieldResponses({ data });
    };
  };

  const contextValue = useMemo<WorkContextValue>(
    () => ({
      workMetadata,
      workFields,
      derivedFieldValues,
      cycledFieldNames,

      isWaitingWorkResponse,
      isWaitingFieldResponses:
        isWaitingWorkResponse || waitingFieldResponses.data.size > 0,
      waitingFieldResponses,

      fetchWorkWithFields: async ({ workId }) => {
        if (prevWorkId === workId) {
          return;
        }

        await sendClientRequest({
          state: {
            isWaitingResponse: {
              setIsWaitingResponse: setIsWaitingWorkResponse,
            },
          },

          request: {
            url: `/api/works/${workId || workMetadata.workId}`,
          },

          response: {
            handler: {
              notOk: () => {
                setPrevWorkId("");
                setWorkMetadata(emptyWorkMetadata);
                setWorkFields([]);
              },

              ok: (body: Work) => {
                const { fields, ...nextWorkMetadata } = body;
                setPrevWorkId(nextWorkMetadata.workId);
                setWorkMetadata(nextWorkMetadata);
                setWorkFields(fields);
              },
            },
          },
        });
      },

      updateWork: async ({ workId, body }) => {
        sendClientRequest({
          state: {
            isWaitingResponse: {
              setIsWaitingResponse: setIsWaitingWorkResponse,
              willRestoreOnSuccess: body.slug === workMetadata.slug,
            },
          },

          request: {
            method: "put",
            url: `/api/works/${workId}`,
            body,
          },

          response: {
            handler: {
              notOk: () =>
                alert(`"${workMetadata.title}" 매크로를 수정할 수 없습니다.`),

              ok: () => {
                const nextWorkMetadata = {
                  ...workMetadata,
                  ...body,
                };

                setWorkMetadata(nextWorkMetadata);

                if (body.slug !== workMetadata.slug) {
                  router.replace(`/works/${loginName}/${body.slug}/edit`);
                }
              },
            },
          },
        });
      },

      deleteWork: async ({ workId }) => {
        await sendClientRequest({
          state: {
            isWaitingResponse: {
              setIsWaitingResponse: setIsWaitingWorkResponse,
              willRestoreOnSuccess: false,
            },
          },

          request: {
            method: "delete",
            url: `/api/works/${workId}`,
          },

          response: {
            handler: {
              notOk: () =>
                alert(`"${workMetadata.title}" 매크로를 삭제할 수 없습니다.`),

              ok: () => {
                alert(`"${workMetadata.title}" 매크로를 삭제했습니다.`);
                router.push("/works");
              },
            },
          },
        });
      },

      createWorkField: async ({ field }) => {
        const requestbody: WorkFieldCreationReqBody = {
          name: field.fieldName,
          type: "text",
          value: field.fieldValue,
          isPublic: true,
        };

        return await sendClientRequest({
          state: {
            isWaitingResponse: {
              setIsWaitingResponse: setWaitingFieldResponsesWith("new"),
            },
          },

          request: {
            method: "post",
            url: `/api/works/${workMetadata.workId}/fields`,
            body: requestbody,
          },

          response: {
            handler: {
              notOk: () => alert("필드 생성에 실패했습니다."),

              ok: ({ workFieldId }: WorkFieldCreationResBody) => {
                // TODO: 응답으로, 생성된 새 필드 자체를 온전하게 받을 필요가 있음.
                setWorkFields([
                  ...workFields,
                  {
                    ...field,
                    workFieldId,
                  },
                ]);
              },
            },
          },
        });
      },

      updateWorkField: async ({ field }) => {
        const requestBody: WorkFieldCreationReqBody = {
          name: field.fieldName,
          type: field.fieldType,
          value: field.fieldValue,
          isPublic: field.isPublic,
        };

        return await sendClientRequest({
          state: {
            isWaitingResponse: {
              setIsWaitingResponse: setWaitingFieldResponsesWith(
                field.workFieldId,
              ),
            },
          },

          request: {
            method: "put",
            url: `/api/works/${workMetadata.workId}/fields/${field.workFieldId}`,
            body: requestBody,
          },

          response: {
            handler: {
              notOk: () =>
                alert(`${field.fieldName} 필드를 변경하는 데 실패했습니다.`),

              ok: () => {
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
              },
            },
          },
        });
      },

      updateAllWorkFieldsOrder: async ({ fields }) => {
        const requestBody: AllWorkFieldsReorderReqBody = {
          order: fields.map((field) => field.workFieldId),
        };

        return await sendClientRequest({
          state: {
            isWaitingResponse: {
              setIsWaitingResponse: setIsWaitingWorkResponse,
            },
          },

          request: {
            method: "post",
            url: `/api/works/${workMetadata.workId}/order`,
            body: requestBody,
          },

          response: {
            handler: {
              notOk: () => alert(`필드 순서를 변경하는 데 실패했습니다.`),

              ok: () => {
                const nextWorkFields = fields.map<WorkField>(
                  (value, index) => ({
                    ...value,
                    displayOrder: index + 1,
                  }),
                );

                setWorkFields(nextWorkFields);
              },
            },
          },
        });
      },

      deleteWorkField: async ({ workFieldId }) => {
        return await sendClientRequest({
          state: {
            isWaitingResponse: {
              setIsWaitingResponse: setWaitingFieldResponsesWith(workFieldId),
            },
          },

          request: {
            method: "delete",
            url: `/api/works/${workMetadata.workId}/fields/${workFieldId}`,
          },

          response: {
            handler: {
              notOk: () => alert("필드를 삭제하는 데 실패했습니다."),

              ok: () => {
                const nextWorkFields = workFields.filter(
                  (value) => value.workFieldId !== workFieldId,
                );

                setWorkFields(nextWorkFields);
              },
            },
          },
        });
      },
    }),
    // 무시하는 항목: router, sendClientRequest
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      prevWorkId,
      workMetadata,
      workFields,
      derivedFieldValues,
      cycledFieldNames,
      pathname,
      loginName,
      isWaitingWorkResponse,
      waitingFieldResponses,
      setWaitingFieldResponsesWith,
    ],
  );

  return <WorkContext value={contextValue}>{children}</WorkContext>;
}

type WorkContextValue = {
  workMetadata: WorkMetadata;
  workFields: WorkField[];
  derivedFieldValues: DerivedFieldValues;
  cycledFieldNames: Set<string>;

  isWaitingWorkResponse: boolean;
  isWaitingFieldResponses: boolean;
  waitingFieldResponses: { data: Set<string> };

  fetchWorkWithFields: (params: WorkIdInParams) => void | Promise<void>;
  updateWork: (
    params: WorkIdInParams & WorkUpsertionInParams,
  ) => void | Promise<void>;
  deleteWork: (params: WorkIdInParams) => void | Promise<void>;
  createWorkField: (params: WorkFieldInParams) => void | Promise<boolean>;
  updateWorkField: (params: WorkFieldInParams) => void | Promise<boolean>;
  updateAllWorkFieldsOrder: (
    params: WorkFieldsInParams,
  ) => void | Promise<boolean>;
  deleteWorkField: (params: WorkFieldIdInParams) => void | Promise<boolean>;
};

type DerivedFieldValues = {
  [fieldName: string]: string;
};

type WorkIdInParams = { workId?: string };
type WorkUpsertionInParams = { body: WorkUpsertionReqBody };
type WorkFieldInParams = { field: WorkField };
type WorkFieldsInParams = { fields: WorkField[] };
type WorkFieldIdInParams = { workFieldId: string };

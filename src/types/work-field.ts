import { UpsertionTimestamps } from "./crud-timestamp";
import isObject from "./is-object";
import { isWorkFieldTypeName, WorkFieldTypeName } from "./work-field-type";

export type WorkFieldCreationReqBody = {
  // order: number;
  name: string;
  type: WorkFieldTypeName;
  value: string;
  isPublic: boolean;
};

export function isWorkFieldCreationReqBody(
  obj: unknown,
): obj is WorkFieldCreationReqBody {
  if (!isObject(obj)) {
    return false;
  } else if (!obj?.name || typeof obj.name !== "string") {
    return false;
  } else if (typeof obj?.type !== "string" || !isWorkFieldTypeName(obj.type)) {
    return false;
  } else if (typeof obj.value !== "string") {
    return false;
  } else if (typeof obj?.isPublic !== "boolean") {
    return false;
  } else {
    return true;
  }
}

export type WorkFieldCreationResBody = WorkField & {
  parent: {
    workId: string;
    updatedAt: string;
  };
};

export type WorkFieldModification = {
  ownerId: string;
  parentId: string;
  workFieldId: string;
  name: string;
  type: WorkFieldTypeName;
  value: string;
  isPublic: boolean;
};

// TODO: parentId 확인 필요
export type WorkField = UpsertionTimestamps & {
  workFieldId: string;
  // parentId: string;
  displayOrder: number;
  fieldName: string;
  isPublic: boolean;
  fieldType: WorkFieldTypeName;
  fieldValue: string;
};

export type AllWorkFieldsReorderReqBody = {
  order: string[];
};

export function isAllWorkFieldsReorderReqBody(
  obj: unknown,
): obj is AllWorkFieldsReorderReqBody {
  if (!isObject(obj)) {
    return false;
  }

  const order = obj.order;

  // TODO: UUID v7 포맷 검사
  if (
    !(order instanceof Array) ||
    order.filter((value) => typeof value !== "string").length > 0
  ) {
    return false;
  }

  return true;
}

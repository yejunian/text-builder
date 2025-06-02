import { UpsertionTimestamps } from "./crud-timestamps";
import { isWorkFieldTypeName, WorkFieldTypeName } from "./work-field-types";

export type WorkFieldCreationReqBody = {
  parentId: string;
  // order?: number;
  name: string;
  type?: WorkFieldTypeName;
  value?: string;
  isPublic?: boolean;
};

export function isWorkFieldCreationReqBody(
  obj: any,
): obj is WorkFieldCreationReqBody {
  if (!obj?.name || typeof obj.name !== "string") {
    return false;
  }

  if (obj?.type && !isWorkFieldTypeName(obj.type)) {
    return false;
  }

  if (obj?.value && typeof obj.value !== "string") {
    return false;
  }

  if (obj?.isPublic && typeof obj.isPublic !== "boolean") {
    return false;
  }

  return true;
}

export type WorkField = UpsertionTimestamps & {
  workFieldId: string;
  displayOrder: number;
  fieldName: string;
  isPublic: boolean;
  fieldType: WorkFieldTypeName;
  fieldValue: string;
};

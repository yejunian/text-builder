import {
  insertWorkField,
  WorkFieldInsertResult,
} from "@/repositories/work-fields/insert-work-field";
import { WorkFieldCreationReqBody, WorkFieldType } from "@/types/work-fields";

export async function createWorkField(
  workFieldCreation: WorkFieldCreationReqBody,
): Promise<WorkFieldInsertResult> {
  const {
    parentId,
    // order: displayOrder,
    name: fieldName,
    type: fieldTypeName = "text",
    value: fieldValue = "",
    isPublic = false,
  } = workFieldCreation;

  const fieldTypeValue =
    WorkFieldType[fieldTypeName === "unknown" ? "text" : fieldTypeName];

  return await insertWorkField({
    parentId,
    // displayOrder,
    fieldName,
    fieldType: fieldTypeValue,
    fieldValue,
    isPublic,
  });
}

import {
  insertWorkField,
  WorkFieldInsertResult,
} from "@/repositories/work-fields/insert-work-field";
import { workFieldTypeNameToId } from "@/types/work-field-types";
import { WorkFieldCreation } from "@/types/work-fields";

export async function createWorkField(
  workFieldCreation: WorkFieldCreation,
): Promise<WorkFieldInsertResult> {
  const {
    parentId,
    // order: displayOrder,
    name: fieldName,
    type: fieldTypeName,
    value: fieldValue,
    isPublic,
  } = workFieldCreation;

  const fieldTypeValue =
    workFieldTypeNameToId[fieldTypeName === "unknown" ? "text" : fieldTypeName];

  return await insertWorkField({
    parentId,
    // displayOrder,
    fieldName,
    fieldType: fieldTypeValue,
    fieldValue,
    isPublic,
  });
}

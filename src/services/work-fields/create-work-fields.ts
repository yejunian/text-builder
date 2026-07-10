import { insertWorkField } from "@/repositories/work-fields/insert-work-field";
import { DbInsertFailure } from "@/types/server/db-result";
import { WorkField, WorkFieldCreationReqBody } from "@/types/work-field";
import {
  workFieldTypeIdToName,
  workFieldTypeNameToId,
} from "@/types/work-field-type";
import { getCrudTimestampsAsIso } from "@/utils/date";

export async function createWorkField(
  workFieldCreation: WorkFieldCreation,
): Promise<WorkFieldCreationResult> {
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

  const result = await insertWorkField({
    parentId,
    // displayOrder,
    fieldName,
    fieldType: fieldTypeValue,
    fieldValue,
    isPublic,
  });

  if (typeof result === "string") {
    return result;
  }

  return {
    ...result,
    fieldType: workFieldTypeIdToName[result.fieldType],
    ...getCrudTimestampsAsIso(result),
  };
}

type WorkFieldCreation = WorkFieldCreationReqBody & {
  parentId: string;
};
type WorkFieldCreationResult = DbInsertFailure | WorkField;

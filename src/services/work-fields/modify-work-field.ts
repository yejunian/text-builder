import {
  updateWorkField,
  WorkFieldUpdateFailure,
} from "@/repositories/work-fields/update-work-field";
import { WorkField, WorkFieldModification } from "@/types/work-field";
import {
  workFieldTypeIdToName,
  workFieldTypeNameToId,
} from "@/types/work-field-type";
import { upsertionTimestampsFromIso } from "@/utils/date";

export async function modifyWorkField(
  workFieldModification: WorkFieldModification,
): Promise<ModifyWorkFieldResult> {
  const work = await updateWorkField({
    ...workFieldModification,
    type: workFieldTypeNameToId[workFieldModification.type],
  });

  if (typeof work === "string") {
    return work;
  }

  return {
    ...work,
    fieldType: workFieldTypeIdToName[work.fieldType],
    ...upsertionTimestampsFromIso(work),
  };
}

type ModifyWorkFieldResult = WorkField | WorkFieldUpdateFailure;

import {
  updateWorkField,
  WorkFieldUpdateResult,
} from "@/repositories/work-fields/update-work-field";
import { workFieldTypeNameToId } from "@/types/work-field-types";
import { WorkFieldModification } from "@/types/work-fields";

export async function modifyWorkField(
  workFieldModification: WorkFieldModification,
): Promise<ModifyWorkFieldResult> {
  const result = await updateWorkField({
    ...workFieldModification,
    type: workFieldTypeNameToId[workFieldModification.type],
  });

  return result;
}

type ModifyWorkFieldResult = WorkFieldUpdateResult;

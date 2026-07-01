import {
  deleteWorkField,
  WorkFieldDelete,
} from "@/repositories/work-fields/delete-work-field";
import { WorkField } from "@/types/work-field";
import { workFieldTypeIdToName } from "@/types/work-field-type";
import { crudTimestampsFromIso } from "@/utils/date";

export async function removeWorkField(
  workFieldRemoval: WorkFieldDelete,
): Promise<WorkField | null> {
  const deletedField = await deleteWorkField(workFieldRemoval);

  if (!deletedField) {
    return null;
  }

  return {
    ...deletedField,
    fieldType: workFieldTypeIdToName[deletedField.fieldType],
    ...crudTimestampsFromIso(deletedField),
  };
}

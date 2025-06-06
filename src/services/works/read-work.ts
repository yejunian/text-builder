import {
  selectFields,
  WorkFieldSelectFailure,
} from "@/repositories/work-fields/select-work-fields";
import {
  selectWork,
  WorkSelectFailure,
} from "@/repositories/works/select-work";
import { Work, WorkRead } from "@/types/work";
import { WorkField } from "@/types/work-field";
import { workFieldTypeIdToName } from "@/types/work-field-type";

export async function readWork(workRead: WorkRead): Promise<ReadWorkResult> {
  const work = await selectWork(workRead);

  if (typeof work === "string") {
    return work;
  }

  const workFields = await selectFields(workRead.workId);

  if (typeof workFields === "string") {
    return workFields;
  }

  return {
    ...work,
    fields: workFields.map<WorkField>((record) => {
      const fieldTypeName = workFieldTypeIdToName[record.fieldType];
      return {
        ...record,
        fieldType: fieldTypeName === "unknown" ? "text" : fieldTypeName,
      };
    }),
  };
}

type ReadWorkResult = Work | ReadWorkFailure;
type ReadWorkFailure = WorkSelectFailure | WorkFieldSelectFailure;

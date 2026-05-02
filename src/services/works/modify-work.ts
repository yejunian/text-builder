import { WorkSelectFailure } from "@/repositories/works/select-work";
import {
  updateWork,
  WorkUpdateFailure,
  WorkUpdateValue,
} from "@/repositories/works/update-work";
import { WorkMetadata } from "@/types/work";
import { upsertionTimestampsFromIso } from "@/utils/date";

export async function modifyWork(
  workModification: WorkUpdateValue,
): Promise<ModifyWorkResult> {
  const work = await updateWork(workModification);

  if (typeof work === "string") {
    return work;
  }

  return {
    ...work,
    ...upsertionTimestampsFromIso(work),
  };
}

type ModifyWorkResult = WorkMetadata | WorkUpdateFailure | WorkSelectFailure;

import { WorkSelectFailure } from "@/repositories/works/select-work";
import {
  updateWork,
  WorkUpdateFailure,
  WorkUpdateValue,
} from "@/repositories/works/update-work";
import { WorkMetadata } from "@/types/work";
import { getCrudTimestampsAsIso } from "@/utils/date";

export async function modifyWork(
  workModification: WorkUpdateValue,
): Promise<ModifyWorkResult> {
  const work = await updateWork(workModification);

  if (typeof work === "string") {
    return work;
  }

  return {
    ...work,
    ...getCrudTimestampsAsIso(work),
  };
}

type ModifyWorkResult = WorkMetadata | WorkUpdateFailure | WorkSelectFailure;

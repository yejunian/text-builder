import {
  ReorderTarget,
  updateAllWorkFieldsOrder,
} from "@/repositories/work-fields/update-all-work-fields-order";

import { readWork } from "../works/read-work";

export async function reorderAllWorkFields(work: ReorderTarget) {
  const reorderSuccess = await updateAllWorkFieldsOrder(work);

  if (!reorderSuccess) {
    return reorderSuccess;
  }

  return await readWork({
    ownerId: work.ownerId,
    workId: work.workId,
  });
}

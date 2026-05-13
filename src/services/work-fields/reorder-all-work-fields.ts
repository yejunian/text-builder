import {
  ReorderTarget,
  updateAllWorkFieldsOrder,
} from "@/repositories/work-fields/update-all-work-fields-order";

import { readWork } from "../works/read-work";

export async function reorderAllWorkFields(work: ReorderTarget) {
  const reorderResult = await updateAllWorkFieldsOrder(work);

  if (typeof reorderResult === "string") {
    return reorderResult;
  }

  return await readWork({
    ownerId: work.ownerId,
    workId: work.workId,
  });
}

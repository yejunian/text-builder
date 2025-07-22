import {
  ReorderTarget,
  updateAllWorkFieldsOrder,
} from "@/repositories/work-fields/update-all-work-fields-order";

export async function reorderAllWorkFields(work: ReorderTarget) {
  return await updateAllWorkFieldsOrder(work);
}

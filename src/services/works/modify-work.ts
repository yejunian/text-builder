import {
  updateWork,
  WorkUpdateResult,
  WorkUpdateValue,
} from "@/repositories/works/update-work";

export async function modifyWork(
  workModification: WorkUpdateValue,
): Promise<WorkUpdateResult> {
  return await updateWork(workModification);
}

import {
  insertWork,
  WorkInsertResult,
  WorkInsertValue,
} from "@/repositories/works/insert-work";

export async function createWork(
  workInsert: WorkInsertValue,
): Promise<WorkInsertResult> {
  return await insertWork(workInsert);
}

import { deleteWork } from "@/repositories/works/delete-work";
import { WorkRead } from "@/types/work";

export async function removeWork(workRemove: WorkRead): Promise<boolean> {
  return await deleteWork(workRemove);
}

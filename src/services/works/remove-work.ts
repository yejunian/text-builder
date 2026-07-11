import { deleteWork } from "@/repositories/works/delete-work";
import { Deleted } from "@/types/crud-timestamp";
import { Work, WorkRead } from "@/types/work";
import { getCrudTimestampsAsIso } from "@/utils/date";

export async function removeWork(
  workRemove: WorkRead,
): Promise<null | Deleted<Omit<Work, "fields">>> {
  const deletedWork = await deleteWork(workRemove);

  if (!deletedWork) {
    return null;
  }

  return {
    ...deletedWork,
    ...getCrudTimestampsAsIso(deletedWork),
  };
}

import {
  deleteWorkField,
  WorkFieldDelete,
} from "@/repositories/work-fields/delete-work-field";

export async function removeWorkField(
  workFieldRemoval: WorkFieldDelete,
): Promise<boolean> {
  return await deleteWorkField(workFieldRemoval);
}

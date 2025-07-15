import {
  AllWorksSelectFailure,
  selectAllWorks,
} from "@/repositories/works/select-all-works";
import { AllWorksRead, WorkMetadata } from "@/types/work";
import { upsertionTimestampsFromIso } from "@/utils/date";

export async function readAllWorks(
  worksRead: AllWorksRead,
): Promise<ReadAllWorksResult> {
  const allWorks = await selectAllWorks(worksRead);

  if (typeof allWorks === "string") {
    return allWorks;
  }

  return {
    allWorks: allWorks.map((work) => ({
      ...work,
      ...upsertionTimestampsFromIso(work),
    })),
  };
}

type ReadAllWorksResult = ReadAllWorksSuccess | ReadAllWorksFailure;

type ReadAllWorksSuccess = {
  allWorks: WorkMetadata[];
};

type ReadAllWorksFailure = AllWorksSelectFailure;

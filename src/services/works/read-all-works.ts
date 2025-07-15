import {
  AllWorksSelectFailure,
  selectAllWorks,
} from "@/repositories/works/select-all-works";
import { AllWorksRead, WorkMetadata } from "@/types/work";

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
      createdAt: work.createdAt.toISOString(),
      updatedAt: work.updatedAt.toISOString(),
    })),
  };
}

type ReadAllWorksResult = ReadAllWorksSuccess | ReadAllWorksFailure;

type ReadAllWorksSuccess = {
  allWorks: WorkMetadata[];
};

type ReadAllWorksFailure = AllWorksSelectFailure;

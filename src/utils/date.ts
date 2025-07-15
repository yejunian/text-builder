import { UpsertionTimestamps } from "@/types/crud-timestamp";

export function upsertionTimestampsFromIso(
  sourceObject: UpsertionDates,
): UpsertionTimestamps {
  return {
    createdAt: sourceObject.createdAt.toISOString(),
    updatedAt: sourceObject.updatedAt.toISOString(),
  };
}

interface UpsertionDates {
  createdAt: Date;
  updatedAt: Date;
}

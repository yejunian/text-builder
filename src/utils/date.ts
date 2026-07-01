import { CrudTimestamp, UpsertionTimestamps } from "@/types/crud-timestamp";

// TODO: 호출을 crudTimestampsFromIso로 합치기?
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

export function crudTimestampsFromIso(sourceObject: CrudDates): CrudTimestamp {
  if (sourceObject.deletedAt) {
    return {
      ...upsertionTimestampsFromIso(sourceObject),
      deletedAt: sourceObject.deletedAt.toISOString(),
    };
  } else {
    return upsertionTimestampsFromIso(sourceObject);
  }
}

interface CrudDates extends UpsertionDates {
  deletedAt?: Date | null;
}

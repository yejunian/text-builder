import { Deleted, UpsertionTimestamps } from "@/types/crud-timestamp";
import isObject from "@/types/is-object";

export function getCrudTimestampsAsIso(
  sourceObject: AliveUpsertionDate,
): UpsertionTimestamps;
export function getCrudTimestampsAsIso(
  sourceObject: DeadUpsertionDate,
): Deleted<UpsertionTimestamps>;
export function getCrudTimestampsAsIso(
  sourceObject: AliveUpsertionDate | DeadUpsertionDate,
): UpsertionTimestamps | Deleted<UpsertionTimestamps> {
  const createdAt = sourceObject.createdAt.toISOString();
  const updatedAt = sourceObject.updatedAt.toISOString();

  if (sourceObject?.deletedAt instanceof Date) {
    return {
      createdAt,
      updatedAt,
      deletedAt: sourceObject.deletedAt.toISOString(),
    };
  } else {
    return {
      createdAt,
      updatedAt,
    };
  }
}

export function isAliveUpsertionDate(obj: unknown): obj is AliveUpsertionDate {
  return (
    isObject(obj) && (obj.deletedAt === null || obj.deletedAt === undefined)
  );
}

export function isDeadUpsertionDate(obj: unknown): obj is DeadUpsertionDate {
  return isObject(obj) && obj?.deletedAt instanceof Date;
}

interface AliveUpsertionDate {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: null | undefined;
}

interface DeadUpsertionDate {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

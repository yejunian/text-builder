import isObject from "./is-object";

export type UpsertionTimestamps = {
  createdAt: string;
  updatedAt: string;
};

export type DeletionTimestamp = {
  deletedAt: string;
};

export type Deleted<T> = T & DeletionTimestamp;

export function isDeleted<T>(obj: unknown): obj is Deleted<T> {
  return isObject(obj) && !!obj?.deletedAt && typeof obj.deletedAt === "string";
}

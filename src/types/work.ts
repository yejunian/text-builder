import { forbiddenNamePattern } from "@/utils/strings";

import { UpsertionTimestamps } from "./crud-timestamp";
import isObject from "./is-object";
import { WorkField } from "./work-field";

export type WorkUpsertionReqBody = {
  slug: string;
  title: string;
};

export function isWorkUpsertionReqBody(
  obj: unknown,
): obj is WorkUpsertionReqBody {
  return (
    isObject(obj) &&
    isWorkSlug(obj?.slug) &&
    typeof obj.title === "string" &&
    obj.title.length > 0
  );
}

export function isWorkSlug(str: unknown): boolean {
  return (
    typeof str === "string" &&
    str.length > 0 &&
    str.length <= 150 &&
    !forbiddenNamePattern.test(str)
  );
}

export type WorkRead = {
  ownerId: string;
  workId: string;
};

export type AllWorksRead = {
  ownerId: string;
};

export type Work = WorkMetadata & {
  fields: WorkField[];
};

export type WorkMetadata = UpsertionTimestamps & {
  workId: string;
  ownerId: string;
  slug: string;
  title: string;
};

export type AllWorksResBody = {
  allWorks: WorkMetadata[];
};

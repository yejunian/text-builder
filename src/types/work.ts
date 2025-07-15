import { forbiddenNamePattern } from "@/utils/strings";

import { UpsertionTimestamps } from "./crud-timestamp";
import isObject from "./is-object";
import { WorkField } from "./work-field";

export type WorkCreationReqBody = {
  slug: string;
  title: string;
};

export function isWorkCreationReqBody(
  obj: unknown,
): obj is WorkCreationReqBody {
  if (!isObject(obj)) {
    return false;
  }

  if (!isWorkSlug(obj?.slug)) {
    return false;
  }

  if (!obj?.title || typeof obj.title !== "string") {
    return false;
  }

  return true;
}

export function isWorkSlug(str: unknown): boolean {
  return (
    !!str &&
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

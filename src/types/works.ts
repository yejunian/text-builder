import { forbiddenNamePattern } from "@/utils/strings";

export type WorkCreationReqBody = {
  slug: string;
  title: string;
};

export function isWorkCreationReqBody(obj: any): obj is WorkCreationReqBody {
  if (!isWorkSlug(obj?.slug)) {
    return false;
  }

  if (!obj?.title || typeof obj.title !== "string") {
    return false;
  }

  return true;
}

export function isWorkSlug(str: any): boolean {
  return (
    str &&
    typeof str === "string" &&
    str.length > 0 &&
    str.length <= 150 &&
    !forbiddenNamePattern.test(str)
  );
}

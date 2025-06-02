export type WorkFieldCreationReqBody = {
  parentId: string;
  // order?: number;
  name: string;
  type?: WorkFieldTypeName;
  value?: string;
  isPublic?: boolean;
};

export function isWorkFieldCreationReqBody(
  obj: any,
): obj is WorkFieldCreationReqBody {
  if (!obj?.name || typeof obj.name !== "string") {
    return false;
  }

  if (obj?.type && !isWorkFieldTypeName(obj.type)) {
    return false;
  }

  if (obj?.value && typeof obj.value !== "string") {
    return false;
  }

  if (obj?.isPublic && typeof obj.isPublic !== "boolean") {
    return false;
  }

  return true;
}

export const WorkFieldType = {
  unknown: 0,

  formula: 1_000_000,
  simpleformula: 1_100_000,

  text: 2_000_000,

  number: 3_000_000,

  datetime: 4_000_000,
  date: 4_100_000,
  time: 4_200_000,
} as const;

export type WorkFieldTypeName = keyof typeof WorkFieldType;
export type WorkFieldTypeValue = (typeof WorkFieldType)[WorkFieldTypeName];

export const WorkFieldTypeIdToName = Object.freeze(
  Object.fromEntries<WorkFieldTypeName>(
    Object.entries(WorkFieldType).map(([k, v]) => [v, k as WorkFieldTypeName]),
  ),
);

export function isWorkFieldTypeName(str: any): str is WorkFieldTypeName {
  return (
    WorkFieldTypeIdToName[(WorkFieldType as Record<string, number>)[str]] ===
    str
  );
}

export function isWorkFieldTypeId(num: any): num is WorkFieldTypeValue {
  return WorkFieldType[WorkFieldTypeIdToName[num]] === num;
}

export const workFieldTypeNameToId = {
  unknown: 0,

  formula: 1_000_000,
  simpleformula: 1_100_000,

  text: 2_000_000,

  number: 3_000_000,

  datetime: 4_000_000,
  date: 4_100_000,
  time: 4_200_000,
} as const;

export type WorkFieldTypeName = keyof typeof workFieldTypeNameToId;
export type WorkFieldTypeValue =
  (typeof workFieldTypeNameToId)[WorkFieldTypeName];

export const workFieldTypeIdToName = Object.freeze(
  Object.fromEntries<WorkFieldTypeName>(
    Object.entries(workFieldTypeNameToId).map(([k, v]) => [
      v,
      k as WorkFieldTypeName,
    ]),
  ),
);

export function isWorkFieldTypeName(str: any): str is WorkFieldTypeName {
  return (
    str === "unknown" ||
    workFieldTypeIdToName[
      (workFieldTypeNameToId as Record<string, number>)[str]
    ] === str
  );
}

export function isWorkFieldTypeId(num: any): num is WorkFieldTypeValue {
  return workFieldTypeNameToId[workFieldTypeIdToName[num]] === num;
}

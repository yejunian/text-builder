import { WorkField } from "@/types/work-field";

export function deriveFieldValues(workFields: WorkField[]): {
  derivedFieldValues: DerivedFieldValues;
  cycledFieldNames: Set<string>;
} {
  const fields: { [fieldName: string]: WorkField } = {};
  // Set의 항목이 fieldName을 참조함.
  const partialOrders: { [fieldName: string]: Set<string> } = {};
  const inDegrees: { [fieldName: string]: number } = {};

  // 부분 순서, 진입 차수 계산
  for (let i = 0; i < workFields.length; i += 1) {
    const field = workFields[i];
    const { fieldName, fieldValue } = field;
    fields[fieldName] = field;

    const fieldDeps = new Set(
      fieldValue.matchAll(/\{\{(.+?)\}\}/g).map((execArray) => execArray[1]),
    );
    let fieldInDegree = 0;

    for (const priorFieldName of fieldDeps) {
      fieldInDegree += 1;

      if (partialOrders[priorFieldName]) {
        partialOrders[priorFieldName].add(fieldName);
      } else {
        partialOrders[priorFieldName] = new Set([fieldName]);
      }
    }

    inDegrees[fieldName] = fieldInDegree;
  }

  const visitedQueue: string[] = Object.keys(inDegrees).filter(
    (fieldName) => inDegrees[fieldName] === 0,
  );

  const replaceOrder: string[] = []; // 치환 순서 (위상정렬 결과)

  while (visitedQueue.length > 0) {
    // visitedQueue에서 하나 꺼내서 replaceOrder에 push
    const currentFieldName = visitedQueue.shift()!;
    replaceOrder.push(currentFieldName);

    // 방문하지 않은 다음 정점 inDegree 감소하고, 결과가 0이면 그 정점 enqueue
    if (partialOrders[currentFieldName] instanceof Set) {
      for (const nextFieldName of partialOrders[currentFieldName]) {
        inDegrees[nextFieldName] -= 1;

        if (inDegrees[nextFieldName] === 0) {
          visitedQueue.push(nextFieldName);
        }
      }
    }
  }

  const cycledNames: Set<string> = new Set(
    Object.keys(inDegrees).filter((fieldName) => inDegrees[fieldName] > 0),
  );

  const derivedValues: DerivedFieldValues = {};

  // 정상 필드 치환
  for (let i = 0; i < replaceOrder.length; i += 1) {
    const fieldName = replaceOrder[i];
    const field = fields[fieldName];
    derivedValues[fieldName] = field.fieldValue;

    for (let j = 0; j < i; j += 1) {
      const priorFieldName = replaceOrder[j];
      derivedValues[fieldName] = derivedValues[fieldName].replaceAll(
        "{{" + priorFieldName + "}}",
        derivedValues[priorFieldName],
      );
    }
  }

  // 순환 참조 필드에서 치환 가능한 참조 처리
  for (const fieldName of cycledNames) {
    const field = fields[fieldName];
    derivedValues[fieldName] = field.fieldValue;

    for (const priorFieldName of replaceOrder) {
      derivedValues[fieldName] = derivedValues[fieldName].replaceAll(
        "{{" + priorFieldName + "}}",
        derivedValues[priorFieldName],
      );
    }
  }

  return {
    cycledFieldNames: cycledNames,
    derivedFieldValues: derivedValues,
  };
}

export type DerivedFieldValues = {
  [fieldName: string]: string;
};

"use client";

import { useContext, useEffect, useState } from "react";

import { Loader, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WorkContext } from "@/contexts/work";
import { WorkField } from "@/types/work-field";

import FieldDisplay from "./field-display";
import FieldEditor from "./field-editor";

type Props = {
  workId: string;
};

export default function FieldList({ workId }: Props) {
  const {
    workFields,
    derivedFieldValues,
    cycledFieldNames,
    fetchWorkWithFields,
    createWorkField,
    updateWorkField,
  } = useContext(WorkContext);
  const [editingFields, setEditingFields] = useState({
    data: new Set<string>(),
  });
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(
    () => {
      fetchWorkWithFields(workId);
    },
    // 무시하는 항목: fetchWorkWithFields
    // 목적: 작업 ID에 따라서만 작업을 다시 불러오고자 함.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [workId],
  );

  const handleEditField = (id: string) => {
    editingFields.data.add(id);
    setEditingFields({ ...editingFields });
  };

  const handleSaveField = async (nextField: WorkField) => {
    const success = await updateWorkField(nextField);

    if (success) {
      editingFields.data.delete(nextField.workFieldId);
      setEditingFields({ ...editingFields });
    }
  };

  const handleCancelEdit = (id: string) => {
    editingFields.data.delete(id);
    setEditingFields({ ...editingFields });
  };

  const handleSaveNewField = async (field: WorkField) => {
    const success = await createWorkField(field);

    if (success) {
      setIsAddOpen(false);
    }
  };

  const handleAddField = () => {
    setIsAddOpen(true);
  };

  return (
    <div className="space-y-4">
      {workFields.map((field) =>
        editingFields.data.has(field.workFieldId) ? (
          <FieldEditor
            key={field.workFieldId}
            field={field}
            hasCycle={cycledFieldNames.has(field.fieldName)}
            onSave={handleSaveField}
            onCancel={handleCancelEdit}
            // onDelete={handleDeleteField}
          />
        ) : (
          <FieldDisplay
            key={field.workFieldId}
            field={field}
            hasCycle={cycledFieldNames.has(field.fieldName)}
            derivedFieldValue={derivedFieldValues[field.fieldName]}
            onEdit={() => handleEditField(field.workFieldId)}
          />
        ),
      )}

      {workFields.length === 0 && (
        <div className="text-muted-foreground space-y-4 py-12 text-center text-balance">
          <Loader
            className="mx-auto opacity-50"
            size={192}
            strokeWidth={1.5}
            absoluteStrokeWidth
          />
          <p>매크로가 비었습니다.</p>
          <p>아래 ‘새 필드 추가’ 버튼을 클릭하여 필드를 생성해 보세요.</p>
        </div>
      )}

      <div className="my-6 border-t" />

      {isAddOpen ? (
        <FieldEditor
          field={{
            workFieldId: "",
            displayOrder:
              1 +
              workFields.reduce(
                (acc, { displayOrder }) => Math.max(acc, displayOrder),
                0,
              ),
            fieldName: "새 필드",
            isPublic: true,
            fieldType: "text",
            fieldValue: "",
            createdAt: "",
            updatedAt: "",
          }}
          onSave={handleSaveNewField}
          onCancel={() => setIsAddOpen(false)}
        />
      ) : (
        <Button
          variant="outline"
          className="mb-64 flex w-full items-center justify-center gap-2 py-6"
          onClick={handleAddField}
        >
          <PlusIcon size={16} /> 새 필드 추가
        </Button>
      )}
    </div>
  );
}

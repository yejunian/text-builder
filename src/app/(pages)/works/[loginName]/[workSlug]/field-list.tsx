"use client";

import { useContext, useEffect, useState } from "react";

import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WorkContext } from "@/contexts/work";
import { WorkField } from "@/types/work-field";

import { FieldDisplay } from "./field-display";
import { FieldEditor } from "./field-editor";

type Props = {
  workId: string;
};

export default function FieldList({ workId }: Props) {
  const { workFields, fetchWorkWithFields, updateWorkField } =
    useContext(WorkContext);
  const [editingFields, setEditingFields] = useState({
    data: new Set<string>(),
  });

  useEffect(() => {
    fetchWorkWithFields(workId);
  }, [workId]);

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

  // TODO: 필드 생성 폼 표시, API 호출, 응답 핸들링 구현
  const handleAddField = () => {
    alert("handleAddField");
  };

  return (
    <div className="space-y-4">
      {workFields.map((field) =>
        editingFields.data.has(field.workFieldId) ? (
          <FieldEditor
            key={field.workFieldId}
            field={field}
            onSave={handleSaveField}
            onCancel={handleCancelEdit}
            // onDelete={handleDeleteField}
          />
        ) : (
          <FieldDisplay
            key={field.workFieldId}
            field={field}
            onEdit={() => handleEditField(field.workFieldId)}
          />
        ),
      )}

      <Button
        variant="outline"
        className="flex w-full items-center justify-center gap-2 py-6"
        onClick={handleAddField}
      >
        <PlusIcon size={16} /> 새 필드 추가
      </Button>
    </div>
  );
}

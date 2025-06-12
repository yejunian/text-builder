"use client";

import { useContext, useEffect } from "react";

import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WorkContext } from "@/contexts/work";

import { FieldDisplay } from "./field-display";
import { FieldEditor } from "./field-editor";

type Props = {
  workId: string;
};

export default function FieldList({ workId }: Props) {
  const { workFields, fetchWorkWithFields } = useContext(WorkContext);

  useEffect(() => {
    fetchWorkWithFields(workId);
  }, [workId]);

  // XXX: <!-- TEMP
  const editingFieldId = null;
  const handleSaveField = () => alert("onSave");
  const handleCancelEdit = () => alert("onCancel");
  const handleDeleteField = () => alert("onDelete");
  const handleEditField = (id: string) => alert(`onEdit("${id}")`);
  const handleAddField = () => alert("handleAddField");
  // XXX: TEMP -->

  return (
    <div className="space-y-4">
      {workFields.data.map((field) => (
        <div key={field.workFieldId}>
          {editingFieldId === field.workFieldId ? (
            <FieldEditor
              field={field}
              onSave={handleSaveField}
              onCancel={handleCancelEdit}
              onDelete={handleDeleteField}
            />
          ) : (
            <FieldDisplay
              field={field}
              onEdit={() => handleEditField(field.workFieldId)}
            />
          )}
        </div>
      ))}

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

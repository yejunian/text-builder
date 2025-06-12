"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { WorkField } from "@/types/work-field";

interface FieldEditorProps {
  field: WorkField;
  onSave: (field: WorkField) => void;
  onCancel: () => void;
  onDelete: (fieldId: string) => void;
}

export function FieldEditor({
  field,
  onSave,
  onCancel,
  onDelete,
}: FieldEditorProps) {
  const [editedField, setEditedField] = useState<WorkField>({ ...field });

  const handleChange = (key: keyof WorkField, value: any) => {
    setEditedField({ ...editedField, [key]: value });
  };

  // TODO: API 요청의 처리 결과로 onSave 호출
  const handleSave = () => {
    onSave(editedField);
  };

  return (
    <Card className="border shadow-sm">
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label htmlFor="field-name">필드 이름</Label>
          <Input
            id="field-name"
            value={editedField.fieldName}
            onChange={(e) => handleChange("fieldName", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="field-type">타입</Label>
          <Select
            value={editedField.fieldType}
            onValueChange={(value) => handleChange("fieldType", value)}
          >
            <SelectTrigger id="field-type">
              <SelectValue placeholder="타입 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">text</SelectItem>
              <SelectItem value="number">number</SelectItem>
              <SelectItem value="date">date</SelectItem>
              <SelectItem value="formula">formula</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="field-value">값</Label>
          <Textarea
            id="field-value"
            rows={5}
            value={editedField.fieldValue}
            onChange={(e) => handleChange("fieldValue", e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is-private"
            checked={!editedField.isPublic}
            onCheckedChange={(checked) => handleChange("isPublic", !checked)}
          />
          <Label htmlFor="is-private">편집 화면에서만 표시</Label>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="space-x-2">
          {/* TODO: API 처리 결과로 onDelete 호출 */}
          {/* <Button variant="outline" onClick={() => onDelete(field.workFieldId)}>
            삭제
          </Button> */}
        </div>

        <div className="space-x-2">
          <Button variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button onClick={handleSave}>확인</Button>
        </div>
      </CardFooter>
    </Card>
  );
}

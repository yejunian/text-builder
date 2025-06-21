"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WorkField } from "@/types/work-field";

type Props = {
  field: WorkField;
  onSave: (field: WorkField) => void;
  onCancel: (fieldId: string) => void;
  // onDelete: (fieldId: string) => void;
};

export default function FieldEditor({
  field,
  onSave,
  onCancel,
  // onDelete,
}: Props) {
  const [editedField, setEditedField] = useState<WorkField>({ ...field });

  // TODO: value 타입을 더 정확하게 지정해야 함.
  const handleChange = (key: keyof WorkField, value: string) => {
    setEditedField({ ...editedField, [key]: value });
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <h3 className="text-lg font-medium">편집: {field.fieldName}</h3>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="field-name">필드 이름</Label>
          <Input
            id="field-name"
            value={editedField.fieldName}
            autoFocus={!field.workFieldId}
            onChange={(e) => handleChange("fieldName", e.target.value)}
          />
          <ul className="text-muted-foreground ml-1 list-inside list-disc text-xs">
            <li>
              <span className="bg-muted rounded-xs px-1 py-px">
                {`{{${editedField.fieldName}}}`}
              </span>
              (으)로 이 필드의 값을 후속 필드에 넣을 수 있습니다.
            </li>
          </ul>
        </div>

        {/* <div className="space-y-2">
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
        </div> */}

        <div className="space-y-2">
          <Label htmlFor="field-value">값</Label>
          <Textarea
            id="field-value"
            value={editedField.fieldValue}
            autoFocus={!!field.workFieldId}
            onChange={(e) => handleChange("fieldValue", e.target.value)}
          />
          <ul className="text-muted-foreground ml-1 list-inside list-disc text-xs">
            <li>
              <span className="bg-muted rounded-xs px-1 py-px">
                {"{{필드 이름}}"}
              </span>
              (으)로 선행 필드의 값을 가져올 수 있습니다.
            </li>
          </ul>
        </div>

        {/* <div className="flex items-center space-x-2">
          <Checkbox
            id="is-private"
            checked={!editedField.isPublic}
            onCheckedChange={(checked) => handleChange("isPublic", !checked)}
          />
          <Label htmlFor="is-private">편집 화면에서만 표시</Label>
        </div> */}
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="space-x-2">
          {/* TODO: API 처리 결과로 onDelete 호출 */}
          {/* <Button variant="outline" onClick={() => onDelete(field.workFieldId)}>
            삭제
          </Button> */}
        </div>

        <div className="space-x-2">
          <Button variant="outline" onClick={() => onCancel(field.workFieldId)}>
            취소
          </Button>
          <Button onClick={() => onSave(editedField)}>확인</Button>
        </div>
      </CardFooter>
    </Card>
  );
}

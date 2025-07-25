"use client";

import { useState } from "react";

import { FileJson, LucideCheck } from "lucide-react";

import Mustached from "@/components/mustached";
import ReferenceErrorBadge from "@/components/reference-error-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { WorkField } from "@/types/work-field";

type Props = {
  field: WorkField;
  hasCycle?: boolean | undefined;
  disabled?: boolean | undefined;
  onSave: (field: WorkField) => void;
  onCancel: (fieldId: string) => void;
  onDelete?: (fieldId: string) => void;
};

export default function FieldEditor({
  field,
  hasCycle = false,
  disabled = false,
  onSave,
  onCancel,
  onDelete,
}: Props) {
  const [editedField, setEditedField] = useState<WorkField>({ ...field });
  const [refCopyTimeoutId, setRefCopyTimeoutId] = useState(-1);

  const handleChange = <T,>(key: keyof WorkField, value: T) => {
    setEditedField({ ...editedField, [key]: value });
  };

  const handleCopyClickWith =
    (text: string, timeoutId: number, setTimeoutId: (value: number) => void) =>
    async () => {
      await navigator.clipboard.writeText(text);
      window.clearTimeout(timeoutId);
      setTimeoutId(window.setTimeout(() => setTimeoutId(-1), 2000));
    };

  const handleCopyRefClick = handleCopyClickWith(
    `{{${field.fieldName}}}`,
    refCopyTimeoutId,
    setRefCopyTimeoutId,
  );

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold">{field.fieldName}</h3>
          <Badge variant="outline">편집 중</Badge>
          {hasCycle && <ReferenceErrorBadge />}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`field-name--${field.workFieldId}`}>필드 이름</Label>

          <div className="flex gap-2">
            <Input
              id={`field-name--${field.workFieldId}`}
              value={editedField.fieldName}
              autoFocus={!field.workFieldId}
              onChange={(e) => handleChange("fieldName", e.target.value)}
              disabled={disabled}
            />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={handleCopyRefClick}
                  disabled={disabled}
                >
                  <svg viewBox="0 0 24 24">
                    <FileJson
                      className={cn(
                        "transition-opacity",
                        refCopyTimeoutId >= 0 ? "opacity-0" : "opacity-100",
                      )}
                    />
                    <LucideCheck
                      strokeWidth={3}
                      className={cn(
                        "text-green-600 transition-opacity",
                        refCopyTimeoutId >= 0 ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </svg>
                  필드 참조 복사
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                <p>
                  <Mustached>{field.fieldName}</Mustached>을(를) 복사합니다.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          <ul className="text-muted-foreground list-outside list-disc pl-4 text-xs leading-normal">
            <li>
              <Mustached className="bg-muted rounded-xs px-1 py-px">
                {editedField.fieldName}
              </Mustached>
              (으)로 이 필드의 값을 다른 필드에 넣을 수 있습니다.
            </li>
          </ul>
        </div>

        {/* <div className="space-y-2">
          <Label htmlFor={`field-type--${field.workFieldId}`}>타입</Label>
          <Select
            value={editedField.fieldType}
            onValueChange={(value) => handleChange("fieldType", value)}
          >
            <SelectTrigger id={`field-type--${field.workFieldId}`}>
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
          <Label htmlFor={`field-value--${field.workFieldId}`}>값</Label>

          <Textarea
            id={`field-value--${field.workFieldId}`}
            className="font-mono-sans"
            value={editedField.fieldValue}
            autoFocus={!!field.workFieldId}
            onChange={(e) => handleChange("fieldValue", e.target.value)}
            disabled={disabled}
          />

          <ul className="text-muted-foreground list-outside list-disc pl-4 text-xs leading-normal">
            <li>
              <Mustached className="bg-muted rounded-xs px-1 py-px">
                필드 이름
              </Mustached>
              (으)로 다른 필드의 값을 가져올 수 있습니다.
            </li>
            <li>
              치환할 수 없는 참조는 <Mustached>참조</Mustached> 그대로
              표시됩니다.
            </li>
          </ul>
        </div>

        <div className="flex items-center space-x-2 *:cursor-pointer">
          <Checkbox
            id={`is-private--${field.workFieldId}`}
            checked={!editedField.isPublic}
            onCheckedChange={(checked) => handleChange("isPublic", !checked)}
            disabled={disabled}
          />
          <Label htmlFor={`is-private--${field.workFieldId}`}>
            편집 화면에서만 표시 (보기 모드에서는 숨김)
          </Label>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="space-x-2">
          {onDelete ? (
            <Button
              variant="outline"
              onClick={() => onDelete(field.workFieldId)}
              disabled={disabled}
            >
              삭제
            </Button>
          ) : null}
        </div>

        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => onCancel(field.workFieldId)}
            disabled={disabled}
          >
            취소
          </Button>

          <Button onClick={() => onSave(editedField)} disabled={disabled}>
            적용
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

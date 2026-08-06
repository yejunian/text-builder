"use client";

import { useState } from "react";

import { Check, Copy } from "lucide-react";

import Mustached from "@/components/mustached";
import ReferenceErrorBadge from "@/components/reference-error-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import { WorkField } from "@/types/work-field";

type Props = {
  field: WorkField;
  hasCycle?: boolean | undefined;
  disabled?: boolean | undefined;
  onEditStart?: (fieldId: string) => void;
  onSave: (field: WorkField) => Promise<boolean> | boolean;
  onCancel: (fieldId: string) => void;
  onDelete?: (fieldId: string) => void;
};

export default function FieldEditor({
  field,
  hasCycle = false,
  disabled = false,
  onEditStart,
  onSave,
  onCancel,
  onDelete,
}: Props) {
  const [isEditing, setIsEditing] = useState(field.workFieldId === "new");
  const [editedField, setEditedField] = useState<WorkField>({ ...field });
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  const handleChange = <T,>(key: keyof WorkField, value: T) => {
    if (!isEditing && onEditStart) {
      setIsEditing(true);
      onEditStart(field.workFieldId);
    }

    setEditedField({ ...editedField, [key]: value });
  };

  const handleSave = async () => {
    const success = await onSave(editedField);

    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    onCancel(field.workFieldId);
    setEditedField({ ...field });
    setIsEditing(false);
  };

  return (
    <Card className="border shadow-sm">
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>필드명</Label>

          <div className="flex gap-2">
            <InputGroup className="h-10">
              <InputGroupInput
                className="text-md md:text-md font-bold"
                value={editedField.fieldName}
                onChange={(e) => handleChange("fieldName", e.target.value)}
                disabled={disabled}
              />

              <InputGroupAddon className="font-mono font-bold">
                {"{{"}
              </InputGroupAddon>
              <InputGroupAddon
                className="font-mono font-bold"
                align="inline-end"
              >
                {"}}"}
              </InputGroupAddon>
            </InputGroup>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-lg"
                  aria-label="Copy"
                  disabled={disabled}
                  onClick={() =>
                    copyToClipboard("{{" + editedField.fieldName + "}}")
                  }
                >
                  {isCopied ? (
                    <Check className="text-green-600 transition-opacity" />
                  ) : (
                    <Copy />
                  )}
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                <p>
                  이 필드의 참조 <Mustached>{field.fieldName}</Mustached>
                  을(를) 복사합니다.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
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
          <Label>값 {hasCycle && <ReferenceErrorBadge />}</Label>

          <Textarea
            className="font-mono-sans"
            value={editedField.fieldValue}
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
        <div className="flex gap-2">
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

        <div
          className={cn("space-x-2", {
            "cursor-not-allowed": disabled || !isEditing,
          })}
        >
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={disabled || !isEditing}
          >
            취소
          </Button>

          <Button onClick={handleSave} disabled={disabled || !isEditing}>
            저장
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

"use client";

import { useState } from "react";

import { Check, Copy, FileJson } from "lucide-react";

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
  onSave: (field: WorkField) => void;
  onCancel: (fieldId: string) => void;
  // onDelete: (fieldId: string) => void;
};

export default function FieldEditor({
  field,
  hasCycle = false,
  onSave,
  onCancel,
  // onDelete,
}: Props) {
  const [editedField, setEditedField] = useState<WorkField>({ ...field });
  const [refCopiedTimeoutId, setRefCopiedTimeoutId] = useState(-1);
  const [rawCopiedTimeoutId, setRawCopiedTimeoutId] = useState(-1);

  const handleChange = <T,>(key: keyof WorkField, value: T) => {
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

          <div className="flex gap-2">
            <Input
              id="field-name"
              value={editedField.fieldName}
              autoFocus={!field.workFieldId}
              onChange={(e) => handleChange("fieldName", e.target.value)}
            />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      `{{${field.fieldName}}}`,
                    );
                    window.clearTimeout(refCopiedTimeoutId);
                    setRefCopiedTimeoutId(
                      window.setTimeout(() => setRefCopiedTimeoutId(-1), 2000),
                    );
                  }}
                >
                  <svg viewBox="0 0 24 24">
                    <FileJson
                      className={cn(
                        "transition-opacity",
                        refCopiedTimeoutId >= 0 ? "opacity-0" : "opacity-100",
                      )}
                    />
                    <Check
                      strokeWidth={3}
                      className={cn(
                        "text-green-600 transition-opacity",
                        refCopiedTimeoutId >= 0 ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </svg>
                  필드 참조 복사
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                <p>{`"{{${field.fieldName}}}"를 복사합니다.`}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <ul className="text-muted-foreground ml-1 list-inside list-disc text-xs leading-normal">
            <li>
              <span className="bg-muted rounded-xs px-1 py-px">
                {`{{${editedField.fieldName}}}`}
              </span>
              (으)로 이 필드의 값을 다른 필드에 넣을 수 있습니다.
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

          <div className="flex gap-2">
            <Textarea
              id="field-value"
              value={editedField.fieldValue}
              autoFocus={!!field.workFieldId}
              onChange={(e) => handleChange("fieldValue", e.target.value)}
            />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={async () => {
                    await navigator.clipboard.writeText(field.fieldValue);
                    window.clearTimeout(rawCopiedTimeoutId);
                    setRawCopiedTimeoutId(
                      window.setTimeout(() => setRawCopiedTimeoutId(-1), 2000),
                    );
                  }}
                >
                  <svg viewBox="0 0 24 24">
                    <Copy
                      className={cn(
                        "transition-opacity",
                        rawCopiedTimeoutId >= 0 ? "opacity-0" : "opacity-100",
                      )}
                    />
                    <Check
                      strokeWidth={3}
                      className={cn(
                        "text-green-600 transition-opacity",
                        rawCopiedTimeoutId >= 0 ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </svg>
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                <p>참조를 치환하지 않은 필드 내용 복사</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <ul className="text-muted-foreground ml-1 list-inside list-disc text-xs leading-normal">
            <li>
              <span className="bg-muted rounded-xs px-1 py-px">
                {"{{필드 이름}}"}
              </span>
              (으)로 다른 필드의 값을 가져올 수 있습니다.
            </li>
            {hasCycle && (
              <li className="text-sm font-bold">
                🚨 오류: 순환 참조가 해소되기 전까지 참조가 정상적으로 치환되지
                않습니다.
              </li>
            )}
          </ul>
        </div>

        <div className="flex items-center space-x-2 *:cursor-pointer">
          <Checkbox
            id="is-private"
            checked={!editedField.isPublic}
            onCheckedChange={(checked) => handleChange("isPublic", !checked)}
          />
          <Label htmlFor="is-private">
            편집 화면에서만 표시 (보기 모드에서는 숨김)
          </Label>
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
          <Button variant="outline" onClick={() => onCancel(field.workFieldId)}>
            취소
          </Button>
          <Button onClick={() => onSave(editedField)}>적용</Button>
        </div>
      </CardFooter>
    </Card>
  );
}

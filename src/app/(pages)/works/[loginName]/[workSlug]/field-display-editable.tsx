"use client";

import { useState } from "react";

import { FileJson, LucideCheck, LucideCopy, LucideLock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  derivedFieldValue: string;
  disabled?: boolean | undefined;
  onEdit: () => void;
};

export default function FieldDisplayEditable({
  field,
  hasCycle = false,
  derivedFieldValue,
  disabled = false,
  onEdit,
}: Props) {
  const [isReplacedValueMode, setIsReplacedValueMode] = useState(false);
  const [refCopyTimeoutId, setRefCopyTimeoutId] = useState(-1);
  const [rawCopyTimeoutId, setRawCopyTimeoutId] = useState(-1);
  const [contentCopyTimeoutId, setContentCopyTimeoutId] = useState(-1);

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
  const handleCopyRawValueClick = handleCopyClickWith(
    field.fieldValue,
    rawCopyTimeoutId,
    setRawCopyTimeoutId,
  );
  const handleCopyReplacedValueClick = handleCopyClickWith(
    derivedFieldValue ?? field.fieldValue,
    contentCopyTimeoutId,
    setContentCopyTimeoutId,
  );

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="-ml-3 text-lg font-bold"
                  onClick={handleCopyRefClick}
                  disabled={disabled}
                >
                  <h3 className="text-lg font-bold">{field.fieldName}</h3>

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
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                <p>이 필드의 참조 {`{{${field.fieldName}}}`}를 복사합니다.</p>
              </TooltipContent>
            </Tooltip>

            {/* <Badge variant="outline" className="text-muted-foreground text-xs">
              {field.fieldType}
            </Badge> */}

            {!field.isPublic && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <LucideLock size={16} className="text-yellow-700" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>이 필드는 편집 모드에서만 표시합니다.</p>
                </TooltipContent>
              </Tooltip>
            )}

            {hasCycle && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="destructive">참조 오류</Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    이 필드는 치환할 수 없는 {"{{참조}}"}를 포함하고 있습니다.
                    <br />
                    치환할 수 없는 참조는 {"{{참조}}"} 그대로 표시됩니다.
                    <br />
                    아래 중 한 가지 이상에 해당할 수 있습니다.
                  </p>
                  <ul className="ml-2 list-inside list-disc">
                    <li>존재하지 않는 필드 참조</li>
                    <li>순환 참조: A → B → C → A</li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Label className="px-3">
                  <Checkbox
                    checked={isReplacedValueMode}
                    onCheckedChange={(checked) =>
                      setIsReplacedValueMode(!!checked)
                    }
                    disabled={disabled}
                  />
                  치환 보기
                </Label>
              </TooltipTrigger>
              <TooltipContent>
                <p>이 필드의 {"{{참조}}"}를 반영한 내용을 미리 확인합니다.</p>
              </TooltipContent>
            </Tooltip>

            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              disabled={disabled}
            >
              편집
            </Button>
          </div>
        </div>

        <div className="relative">
          <Textarea
            readOnly
            value={isReplacedValueMode ? derivedFieldValue : field.fieldValue}
            className="bg-muted/30 resize-none"
            onClick={(event) => {
              (event.target as HTMLTextAreaElement).select();
            }}
          />

          <div className="absolute top-2 right-2 flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyRawValueClick}
                  disabled={disabled}
                >
                  <svg viewBox="0 0 24 24">
                    <FileJson
                      className={cn(
                        "transition-opacity",
                        rawCopyTimeoutId >= 0 ? "opacity-0" : "opacity-100",
                      )}
                    />
                    <LucideCheck
                      strokeWidth={3}
                      className={cn(
                        "text-green-600 transition-opacity",
                        rawCopyTimeoutId >= 0 ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </svg>
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                <p>{"{{참조}}"}를 치환하지 않은, 필드의 원본을 복사합니다.</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyReplacedValueClick}
                  disabled={disabled}
                >
                  <svg viewBox="0 0 24 24">
                    <LucideCopy
                      className={cn(
                        "transition-opacity",
                        contentCopyTimeoutId >= 0 ? "opacity-0" : "opacity-100",
                      )}
                    />
                    <LucideCheck
                      strokeWidth={3}
                      className={cn(
                        "text-green-600 transition-opacity",
                        contentCopyTimeoutId >= 0 ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </svg>
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                <p>{"{{참조}}"}를 치환한, 필드의 내용을 복사합니다.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

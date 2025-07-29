"use client";

import { useState } from "react";

import { FileJson, LucideCheck, LucideCopy, LucideLock } from "lucide-react";

import Mustached from "@/components/mustached";
import ReferenceErrorBadge from "@/components/reference-error-badge";
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg leading-6 font-bold">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-mt-2 -mb-1 -ml-3 align-middle"
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
                  </Button>
                </TooltipTrigger>

                <TooltipContent>
                  <p>
                    이 필드의 참조{" "}
                    <Mustached>
                      {field.fieldName.slice(0, 12)}
                      {field.fieldName.length > 12 ? "…" : null}
                    </Mustached>
                    을(를) 복사합니다.
                  </p>
                </TooltipContent>
              </Tooltip>
              {field.fieldName}
            </h3>
          </div>

          <div className="flex items-center justify-end gap-2">
            {/* <Badge variant="outline" className="text-muted-foreground text-xs">
              {field.fieldType}
            </Badge> */}

            {!field.isPublic && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <LucideLock size={16} className="text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>이 필드는 편집 모드에서만 표시합니다.</p>
                </TooltipContent>
              </Tooltip>
            )}

            {hasCycle && <ReferenceErrorBadge />}

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
                <p>
                  이 필드의 <Mustached>참조</Mustached>를 반영한 내용을 미리
                  확인합니다.
                </p>
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
            className="bg-muted/30 font-mono-sans resize-none"
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
                <p>
                  <Mustached>참조</Mustached>를 치환하지 않은, 필드의 원본을
                  복사합니다.
                </p>
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
                <p>
                  <Mustached>참조</Mustached>를 치환한, 필드의 내용을
                  복사합니다.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

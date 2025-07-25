"use client";

import { useState } from "react";

import { Check, Copy, FileJson, LucideLock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
                    <Check
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
                <p>{`이 필드의 참조 복사: {{${field.fieldName}}}`}</p>
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

            {hasCycle && <Badge variant="destructive">잘못된 참조</Badge>}
          </div>

          <div className="flex items-center gap-2">
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
            value={derivedFieldValue}
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
                    <Check
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
                <p>참조를 치환하지 않은 필드 내용 복사</p>
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
                    <Copy
                      className={cn(
                        "transition-opacity",
                        contentCopyTimeoutId >= 0 ? "opacity-0" : "opacity-100",
                      )}
                    />
                    <Check
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
                <p>현재 보이는 필드 내용 복사</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

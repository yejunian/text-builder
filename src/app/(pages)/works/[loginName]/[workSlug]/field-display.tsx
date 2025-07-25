"use client";

import { useState } from "react";

import { Check, Copy } from "lucide-react";

import ReferenceErrorBadge from "@/components/reference-error-badge";
import { Button } from "@/components/ui/button";
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
};

export default function FieldDisplay({
  field,
  hasCycle = false,
  derivedFieldValue,
  disabled = false,
}: Props) {
  const [contentCopyTimeoutId, setContentCopyTimeoutId] = useState(-1);

  const handleCopyClickWith =
    (text: string, timeoutId: number, setTimeoutId: (value: number) => void) =>
    async () => {
      await navigator.clipboard.writeText(text);
      window.clearTimeout(timeoutId);
      setTimeoutId(window.setTimeout(() => setTimeoutId(-1), 2000));
    };

  const handleCopyReplacedValueClick = handleCopyClickWith(
    derivedFieldValue ?? field.fieldValue,
    contentCopyTimeoutId,
    setContentCopyTimeoutId,
  );

  return (
    <article>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold">{field.fieldName}</h3>

            {hasCycle && <ReferenceErrorBadge />}
          </div>

          <div className="flex items-center gap-2"></div>
        </div>

        <div className="relative">
          <Textarea
            readOnly
            value={derivedFieldValue}
            className="bg-muted/30 resize-none font-sans"
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
      </div>
    </article>
  );
}

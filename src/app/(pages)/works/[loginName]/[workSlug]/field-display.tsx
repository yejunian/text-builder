"use client";

import { useState } from "react";

import { Check, Copy, FileJson } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { WorkField } from "@/types/work-field";

type Props = {
  field: WorkField;
  hasCycle?: boolean | undefined;
  derivedFieldValue: string;
  editable: boolean;
  onEdit: () => void;
};

export default function FieldDisplay({
  field,
  hasCycle = false,
  derivedFieldValue,
  editable,
  onEdit,
}: Props) {
  const [refCopiedTimeoutId, setRefCopiedTimeoutId] = useState(-1);
  const [contentCopiedTimeoutId, setContentCopiedTimeoutId] = useState(-1);

  return (
    <Card className="border shadow-sm">
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="-ml-3 text-lg font-medium"
              title={`이 필드의 참조 복사: {{${field.fieldName}}}`}
              onClick={async () => {
                await navigator.clipboard.writeText(`{{${field.fieldName}}}`);
                window.clearTimeout(refCopiedTimeoutId);
                setRefCopiedTimeoutId(
                  window.setTimeout(() => setRefCopiedTimeoutId(-1), 2000),
                );
              }}
            >
              <h3 className="text-lg font-medium">{field.fieldName}</h3>

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
            </Button>

            {/* <Badge variant="outline" className="text-muted-foreground text-xs">
              {field.fieldType}
            </Badge> */}

            {/* {!field.isPublic && (
              <LockIcon size={16} className="text-muted-foreground" />
            )} */}

            {hasCycle && <Badge variant="destructive">순환 참조</Badge>}
          </div>

          <div className="flex items-center gap-2">
            {editable && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                편집
              </Button>
            )}
          </div>
        </div>

        <div className="relative">
          <Textarea
            readOnly
            value={derivedFieldValue ?? field.fieldValue}
            className="bg-muted/30 resize-none"
            onClick={(event) => {
              (event.target as HTMLTextAreaElement).select();
            }}
          />

          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2"
            onClick={async () => {
              await navigator.clipboard.writeText(
                derivedFieldValue ?? field.fieldValue,
              );
              window.clearTimeout(contentCopiedTimeoutId);
              setContentCopiedTimeoutId(
                window.setTimeout(() => setContentCopiedTimeoutId(-1), 2000),
              );
            }}
          >
            <Copy
              className={cn(
                "transition-opacity",
                contentCopiedTimeoutId >= 0 ? "opacity-0" : "opacity-100",
              )}
            />
            <Check
              strokeWidth={4}
              className={cn(
                "absolute text-green-600 transition-opacity",
                contentCopiedTimeoutId >= 0 ? "opacity-100" : "opacity-0",
              )}
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

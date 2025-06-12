"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { WorkField } from "@/types/work-field";

type Props = {
  field: WorkField;
  onEdit: () => void;
};

export default function FieldDisplay({ field, onEdit }: Props) {
  return (
    <Card className="border shadow-sm">
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">{field.fieldName}</h3>

            {/* <Badge variant="outline" className="text-muted-foreground text-xs">
              {field.fieldType}
            </Badge> */}

            {/* {!field.isPublic && (
              <LockIcon size={16} className="text-muted-foreground" />
            )} */}
          </div>

          <Button variant="outline" size="sm" onClick={onEdit}>
            편집
          </Button>
        </div>

        <Textarea
          readOnly
          value={field.fieldValue}
          className="bg-muted/30 resize-none"
          onClick={(event) => {
            (event.target as HTMLTextAreaElement).select();
          }}
        />
      </CardContent>
    </Card>
  );
}

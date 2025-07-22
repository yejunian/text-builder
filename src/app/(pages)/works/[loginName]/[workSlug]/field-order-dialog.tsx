"use client";

import { useContext, useEffect, useState } from "react";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripHorizontal, LockIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WorkContext } from "@/contexts/work";
import { WorkField } from "@/types/work-field";

type FieldOrderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type SortableFieldCardProps = {
  field: WorkField;
};

function SortableFieldCard({ field }: SortableFieldCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.workFieldId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? "opacity-50" : ""}`}
    >
      <Card className="border shadow-sm">
        <CardContent className="space-y-2">
          <div className="relative -top-5 my-0 flex h-0 justify-center">
            <div
              {...attributes}
              {...listeners}
              className="hover:bg-muted z-10 flex h-6 w-10 cursor-grab items-center justify-center rounded active:cursor-grabbing"
            >
              <GripHorizontal size={16} className="text-muted-foreground" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">{field.fieldName}</h3>
              <Badge variant="outline" className="text-xs">
                {field.fieldType}
              </Badge>
              {!field.isPublic && (
                <LockIcon size={16} className="text-muted-foreground" />
              )}
            </div>
          </div>

          <div className="line-clamp-3 w-full text-sm whitespace-pre">
            {field.fieldValue}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function FieldOrderDialog({
  open,
  onOpenChange,
}: FieldOrderDialogProps) {
  const { workFields, updateAllWorkFieldsOrder } = useContext(WorkContext);

  const [reorderedFields, setReorderedFields] = useState<WorkField[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(
    () => {
      setReorderedFields([...workFields]);
    },
    // 무시하는 항목: workFields
    // 목적: 부하를 줄이기 위하여 다이얼로그를 열 때만 상태를 갱신하고자 함.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open],
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setReorderedFields((items) => {
        const oldIndex = items.findIndex(
          (item) => item.workFieldId === active.id,
        );
        const newIndex = items.findIndex(
          (item) => item.workFieldId === over.id,
        );

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleApply = async () => {
    const success = await updateAllWorkFieldsOrder(reorderedFields);

    if (success) {
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open}>
      <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>필드 순서 조정</DialogTitle>
          <DialogDescription>
            카드 상단의 핸들
            <GripHorizontal
              size={12}
              className="text-muted-foreground mx-px inline-block align-middle"
            />
            을 끌어서 필드의 순서를 변경합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={reorderedFields.map((field) => field.workFieldId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {reorderedFields.map((field) => (
                  <SortableFieldCard key={field.workFieldId} field={field} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            취소
          </Button>
          <Button onClick={handleApply}>적용</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

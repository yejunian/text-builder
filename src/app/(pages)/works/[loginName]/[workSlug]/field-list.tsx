"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";

import {
  Ellipsis,
  Eye,
  Loader,
  PackageX,
  Pencil,
  PlusIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserContext } from "@/contexts/user";
import { WorkContext } from "@/contexts/work";
import { WorkField } from "@/types/work-field";

import FieldDisplay from "./field-display";
import FieldEditor from "./field-editor";

type Props = {
  workId: string;
  editable?: boolean | undefined;
};

export default function FieldList({ workId, editable = false }: Props) {
  const { loginName } = useContext(UserContext);
  const {
    workMetadata,
    workFields,
    derivedFieldValues,
    cycledFieldNames,
    fetchWorkWithFields,
    deleteWork,
    createWorkField,
    updateWorkField,
  } = useContext(WorkContext);

  const [editingFields, setEditingFields] = useState({
    data: new Set<string>(),
  });
  const [isAddOpen, setIsAddOpen] = useState(false);

  const visibleWorkFields = workFields.filter(
    (field) => editable || field.isPublic,
  );

  useEffect(
    () => {
      fetchWorkWithFields(workId);
    },
    // 무시하는 항목: fetchWorkWithFields
    // 목적: 작업 ID에 따라서만 작업을 다시 불러오고자 함.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [workId],
  );

  const handleEditField = (id: string) => {
    editingFields.data.add(id);
    setEditingFields({ ...editingFields });
  };

  const handleSaveField = async (nextField: WorkField) => {
    const success = await updateWorkField(nextField);

    if (success) {
      editingFields.data.delete(nextField.workFieldId);
      setEditingFields({ ...editingFields });
    }
  };

  const handleCancelEdit = (id: string) => {
    editingFields.data.delete(id);
    setEditingFields({ ...editingFields });
  };

  const handleSaveNewField = async (field: WorkField) => {
    const success = await createWorkField(field);

    if (success) {
      setIsAddOpen(false);
    }
  };

  const handleAddField = () => {
    setIsAddOpen(true);
  };

  const handleDelete = () => {
    if (
      confirm(`현재 편집 중인 매크로 "${workMetadata.title}"을(를) 삭제할까요?`)
    ) {
      deleteWork(workId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          {editable && (
            <Badge variant="outline" className="inline-block">
              편집 중
            </Badge>
          )}
          <h1 className="text-xl font-bold">{workMetadata.title}</h1>
        </div>

        <div className="flex justify-end gap-2">
          {editable ? (
            <>
              <Tooltip>
                <TooltipTrigger>
                  <Button variant="link" size="sm" asChild>
                    <Link href={`/works/${loginName}/${workMetadata.slug}`}>
                      <Eye /> 보기 모드로
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>편집을 중단하고 보기 모드로 돌아갑니다.</p>
                </TooltipContent>
              </Tooltip>

              <Button
                variant={workFields.length === 0 ? "default" : "outline"}
                size="sm"
                onClick={handleAddField}
              >
                <PlusIcon size={16} /> 새 필드
              </Button>

              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Ellipsis />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>동작 더 보기</p>
                  </TooltipContent>
                </Tooltip>

                <DropdownMenuContent>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={handleDelete}
                  >
                    <PackageX /> 매크로 삭제
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              variant={visibleWorkFields.length === 0 ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={`/works/${loginName}/${workMetadata.slug}/edit`}>
                <Pencil /> 편집
              </Link>
            </Button>
          )}
        </div>
      </div>

      {visibleWorkFields.map((field) =>
        editable && editingFields.data.has(field.workFieldId) ? (
          <FieldEditor
            key={field.workFieldId}
            field={field}
            hasCycle={cycledFieldNames.has(field.fieldName)}
            onSave={handleSaveField}
            onCancel={handleCancelEdit}
            // onDelete={handleDeleteField}
          />
        ) : (
          <FieldDisplay
            key={field.workFieldId}
            field={field}
            hasCycle={cycledFieldNames.has(field.fieldName)}
            derivedFieldValue={derivedFieldValues[field.fieldName]}
            editable={editable}
            onEdit={() => handleEditField(field.workFieldId)}
          />
        ),
      )}

      {visibleWorkFields.length === 0 && (
        <div className="text-muted-foreground space-y-4 py-12 text-center text-balance">
          {isAddOpen || (
            <Loader
              className="mx-auto opacity-50"
              size={192}
              strokeWidth={1.5}
              absoluteStrokeWidth
            />
          )}
          <p>매크로가 비었습니다.</p>
          {editable ? (
            <p>
              {isAddOpen
                ? "아래 입력란을 채우고 ‘적용’ "
                : "위 또는 아래의 ‘새 필드 추가’ "}
              버튼을 눌러서 새 필드를 생성해 보세요.
            </p>
          ) : (
            <p>오른쪽 위의 ‘편집’ 버튼을 눌러서 매크로를 편집해 보세요.</p>
          )}
        </div>
      )}

      {editable && (
        <>
          <div className="my-6 border-t" />

          {isAddOpen ? (
            <FieldEditor
              field={{
                workFieldId: "",
                displayOrder:
                  1 +
                  workFields.reduce(
                    (acc, { displayOrder }) => Math.max(acc, displayOrder),
                    0,
                  ),
                fieldName: "새 필드",
                isPublic: true,
                fieldType: "text",
                fieldValue: "",
                createdAt: "",
                updatedAt: "",
              }}
              onSave={handleSaveNewField}
              onCancel={() => setIsAddOpen(false)}
            />
          ) : (
            <Button
              variant={workFields.length === 0 ? "default" : "outline"}
              className="mb-64 flex w-full items-center justify-center gap-2 py-6"
              onClick={handleAddField}
            >
              <PlusIcon size={16} /> 새 필드 추가
            </Button>
          )}
        </>
      )}
    </div>
  );
}

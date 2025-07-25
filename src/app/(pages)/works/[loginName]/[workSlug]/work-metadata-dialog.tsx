"use client";

import React, { useContext, useEffect, useState } from "react";

import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WorkContext } from "@/contexts/work";
import { WorkMetadata } from "@/types/work";

export default function WorkMetadataDialog() {
  const { workMetadata, isWaitingFieldResponses, updateWork } =
    useContext(WorkContext);

  const [editedField, setEditedField] = useState<
    Pick<WorkMetadata, "title" | "slug">
  >({
    title: workMetadata.title,
    slug: workMetadata.slug,
  });

  useEffect(() => {
    setEditedField({
      title: workMetadata.title,
      slug: workMetadata.slug,
    });
  }, [workMetadata.workId, workMetadata.title, workMetadata.slug]);

  const handleChange = <T,>(key: keyof WorkMetadata, value: T) => {
    setEditedField({ ...editedField, [key]: value });
  };

  const handleApplyClick = () => {
    // body.slug가 변경되면 페이지 이동
    updateWork({
      workId: workMetadata.workId,
      body: editedField,
    });
  };

  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild disabled={isWaitingFieldResponses}>
            <Button variant="ghost" size="sm" className="ml-1">
              <Pencil />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>

        <TooltipContent>
          <p>매크로 정보 수정</p>
        </TooltipContent>
      </Tooltip>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>매크로 정보 수정</DialogTitle>
          <DialogDescription>
            텍스트 매크로 ID를 수정하면 페이지를 다시 로드합니다. 편집 내용을
            적용하지 않은 필드의 편집 데이터가 유실됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="work-metadata-title">제목</Label>
            <Input
              id="work-metadata-title"
              value={editedField.title}
              onChange={(event) => handleChange("title", event.target.value)}
              disabled={isWaitingFieldResponses}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="work-metadata-slug">텍스트 매크로 ID</Label>
            <Input
              id="work-metadata-slug"
              value={editedField.slug}
              onChange={(event) => handleChange("slug", event.target.value)}
              disabled={isWaitingFieldResponses}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isWaitingFieldResponses}>
              취소
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              onClick={handleApplyClick}
              disabled={isWaitingFieldResponses}
            >
              적용
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

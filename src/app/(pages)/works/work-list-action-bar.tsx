"use client";

import { useContext } from "react";
import Link from "next/link";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UserContext } from "@/contexts/user";

export default function WorkListActionBar() {
  const { loginName } = useContext(UserContext);

  return (
    <div className="flex gap-2">
      {/* 정렬 기준 드롭다운 */}
      {/* TODO: 컨텍스트로 값 공유 */}
      {/* <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="정렬 기준 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="updated">수정한 날짜순</SelectItem>
          <SelectItem value="created">만든 날짜순</SelectItem>
          <SelectItem value="title">제목순</SelectItem>
          <SelectItem value="author">작성자순</SelectItem>
        </SelectContent>
      </Select> */}

      <Button asChild size="sm">
        <Link href={`/works/${loginName}/new`}>
          <Plus className="h-4 w-4" />새 텍스트 매크로
        </Link>
      </Button>
    </div>
  );
}

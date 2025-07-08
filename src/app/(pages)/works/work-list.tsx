"use client";

import { useContext, useEffect } from "react";
import Link from "next/link";

import { Calendar, ChevronRight, PackageOpen, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserContext } from "@/contexts/user";
import { WorkListContext } from "@/contexts/work-list";

export default function WorkList() {
  const { loginName } = useContext(UserContext);
  const { works, fetchWorks } = useContext(WorkListContext);

  useEffect(
    () => {
      fetchWorks();
    },
    // 무시하는 항목: fetchWorks
    // 목적: 사용자에 따라서만 작업 목록을 다시 불러오고자 함.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loginName],
  );

  return (
    <>
      {/* 데스크톱 테이블 뷰 */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              {/* <TableHead>작성자</TableHead> */}
              <TableHead className="w-48">만든 날짜</TableHead>
              <TableHead className="w-48">수정한 날짜</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {works.map((work) => (
              <TableRow key={work.workId} className="hover:bg-muted/50">
                <TableCell>
                  <Link
                    href={`/works/${loginName}/${work.slug}`}
                    className="font-medium hover:underline"
                  >
                    {work.title}
                  </Link>
                </TableCell>

                {/* <TableCell className="flex items-center">
                  <User className="text-muted-foreground mr-2 h-4 w-4" />
                  {displayName}
                </TableCell> */}

                <TableCell className="text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {work.createdAt}
                  </div>
                </TableCell>

                <TableCell className="text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {work.updatedAt}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 모바일 리스트 뷰 */}
      <div className="space-y-4 md:hidden">
        {works.map((work) => (
          <Link
            key={work.workId}
            href={`/works/${loginName}/${work.slug}`}
            className="hover:bg-muted/50 block rounded-lg border p-4 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="mb-1 font-medium">{work.title}</h3>
                <p className="text-muted-foreground flex items-center text-sm">
                  <Calendar className="mr-1 h-3 w-3" />
                  최근 수정: {work.updatedAt}
                </p>
              </div>
              <ChevronRight className="text-muted-foreground mt-1 h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>

      {works.length === 0 && (
        <div className="text-muted-foreground space-y-4 py-12 text-center text-balance">
          <PackageOpen
            className="mx-auto opacity-50"
            size={192}
            strokeWidth={1.5}
            absoluteStrokeWidth
          />
          <p>텍스트 매크로가 없습니다.</p>
          <p>첫 번째 텍스트 매크로를 생성해 보세요.</p>
          <Button className="mt-2" asChild size="lg">
            <Link href={`/works/${loginName}/new`}>
              <Plus className="h-4 w-4" />새 텍스트 매크로
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}

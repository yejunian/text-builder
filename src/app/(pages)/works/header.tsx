"use client";

import { useContext } from "react";
import Link from "next/link";

import {
  FlaskConical,
  FolderOpen,
  LoaderCircle,
  LogOut,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserContext } from "@/contexts/user";
import { useLogout } from "@/hooks/use-logout";

export default function Header() {
  const { loginName, displayName } = useContext(UserContext);

  const { isWaitingLogoutResponse, logout } = useLogout();

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          {/* 모바일 메뉴 버튼 */}
          {/* <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button> */}

          {/* 브레드크럼(예정) */}
          <nav className="flex items-center space-x-1 text-sm">
            <div>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="px-2 font-medium"
              >
                <Link href="/works">Text Builder</Link>
              </Button>{" "}
              <sup className="-ml-2 text-xs font-medium text-violet-600">
                <FlaskConical strokeWidth="2.6" className="inline size-3" />
                beta
              </sup>
            </div>

            {/* 데스크톱에서는 전체 브레드크럼 표시 */}
            {/* <div className="hidden items-center space-x-1 md:flex">
              <Button asChild variant="ghost" size="sm" className="h-auto p-1">
                <Link href="/works">Text Builder</Link>
              </Button>

              <ChevronRight className="text-muted-foreground h-4 w-4" />
            </div> */}

            {/* 모바일에서는 마지막 항목만 표시 */}
            {/* <Button asChild variant="ghost" size="sm" className="h-auto p-1">
              <Link href={`/works/${loginName}`}>내 텍스트 매크로</Link>
            </Button> */}
          </nav>
        </div>

        {/* 계정 메뉴 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={isWaitingLogoutResponse}>
            <Button variant="ghost" size="sm" className="flex items-center">
              {isWaitingLogoutResponse && loginName ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">로그아웃 중...</span>
                </>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{displayName}</span>
                </>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <span className="sm:hidden">
                {displayName} ({loginName})
              </span>
              <span className="hidden sm:inline">{loginName}</span>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              계정 설정
            </DropdownMenuItem>

            <DropdownMenuSeparator /> */}

            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link href="/works">
                <FolderOpen className="mr-2 h-4 w-4" />내 텍스트 매크로
              </Link>
            </DropdownMenuItem>

            {/* <DropdownMenuItem className="cursor-pointer">
              <Share2 className="mr-2 h-4 w-4" />
              공유 프로젝트
            </DropdownMenuItem> */}

            {/* <DropdownMenuItem className="cursor-pointer" asChild>
              <Link href="/works?type=deleted">
                <Trash2 className="mr-2 h-4 w-4" />
                삭제한 프로젝트
              </Link>
            </DropdownMenuItem> */}

            <DropdownMenuSeparator />

            <DropdownMenuItem className="cursor-pointer" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

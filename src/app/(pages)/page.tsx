import Link from "next/link";

import { ArrowRight, ClipboardPenLine, ShieldCheck, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function RootPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 fixed top-0 z-50 w-full border-b backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <h1 className="text-foreground text-sm font-medium">
              Text Builder
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">로그인</Link>
            </Button>

            <Button variant="default" size="sm" asChild>
              <Link href="/signup">
                지금 시작하기
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="flex min-h-svh items-center pt-14 pb-16">
          <div className="container mx-auto px-4 py-20 text-center text-balance sm:px-6 lg:px-8">
            <h2 className="text-foreground mb-6 px-4 text-4xl leading-tight font-bold sm:text-5xl lg:text-6xl">
              텍스트 교체 작업을 <br className="hidden sm:block" />
              실수 없이 더 정확하게
            </h2>

            <p className="mx-auto mb-8 text-base leading-relaxed text-gray-600 sm:text-lg lg:text-xl">
              Text Builder를 활용하여 반복되는 텍스트 수정 작업에서{" "}
              <br className="hidden sm:block" />
              필요한 부분에만 집중하고 변경 누락 실수를 줄여 보세요.
            </p>

            <div className="mx-auto mb-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
              <div className="overflow-clip rounded-xl border border-white/20 bg-white/60 p-6 shadow-lg backdrop-blur-sm">
                <ClipboardPenLine className="absolute right-0 bottom-0 h-3/4 w-auto stroke-1 opacity-5" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  핵심에 집중
                </h3>
                <p className="text-gray-600">
                  긴 텍스트에서 변경할 부분에 집중하여 빠짐없이 수정하세요.
                </p>
              </div>

              <div className="rounded-xl border border-white/20 bg-white/60 p-6 shadow-lg backdrop-blur-sm">
                <Zap className="absolute right-0 bottom-0 h-3/4 w-auto stroke-1 opacity-5" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  효율적인 작업
                </h3>
                <p className="text-gray-600">
                  여러 번 들어가는 내용을 한번에 수정하세요.
                </p>
              </div>

              <div className="rounded-xl border border-white/20 bg-white/60 p-6 shadow-lg backdrop-blur-sm">
                <ShieldCheck className="absolute right-0 bottom-0 h-3/4 w-auto stroke-1 opacity-5" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  변경 누락 방지
                </h3>
                <p className="text-gray-600">
                  휴먼 에러를 줄임으로써 완벽한 결과물을 생성하세요.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="text-lg">
                <Link href="/signup">지금 시작하기</Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                asChild
                className="border-gray-300 text-lg text-gray-700 hover:bg-gray-50"
              >
                <Link href="/login">로그인</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

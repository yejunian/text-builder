import { Metadata } from "next";

import { WorkListProvider } from "@/contexts/work-list";

import WorkList from "./work-list";
import WorkListActionBar from "./work-list-action-bar";

export const metadata: Metadata = {
  title: "내 텍스트 매크로 | 텍스트 빌더",
};

export default async function WorksPage() {
  return (
    <div className="flex">
      {/* 메인 영역 */}
      <WorkListProvider>
        <main className="container mx-auto flex-1">
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold">내 텍스트 매크로</h1>
              <WorkListActionBar />
            </div>

            <WorkList />
          </div>
        </main>
      </WorkListProvider>
    </div>
  );
}

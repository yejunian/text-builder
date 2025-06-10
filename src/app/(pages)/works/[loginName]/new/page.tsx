import { Metadata } from "next";

import NewWorkForm from "./new-work-form";

export const metadata: Metadata = {
  title: "새 텍스트 매크로 만들기 | 텍스트 빌더",
};

export default async function NewWorkPage() {
  return (
    <div className="flex">
      <main className="container mx-auto flex-1">
        <NewWorkForm />
      </main>
    </div>
  );
}

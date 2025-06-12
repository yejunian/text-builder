import { Metadata } from "next";
import { redirect } from "next/navigation";

import { WorkProvider } from "@/contexts/work";
import { selectWorkId } from "@/repositories/works/select-work-id";

import FieldList from "./field-list";

export const metadata: Metadata = {
  title: "텍스트 매크로 | 텍스트 빌더",
};

export default async function WorkPage({ params }: Props) {
  const { loginName, workSlug } = await params;
  const workIds = await selectWorkId(loginName, workSlug);

  if (typeof workIds === "string") {
    return redirect("/login");
  }

  return (
    <div className="flex">
      <WorkProvider>
        <main className="container mx-auto max-w-2xl flex-1 p-4 md:p-6">
          <FieldList workId={workIds.workId} />
        </main>
      </WorkProvider>
    </div>
  );
}

type Props = {
  params: Promise<{
    loginName: string;
    workSlug: string;
  }>;
};

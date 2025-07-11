import { Metadata } from "next";
import { redirect } from "next/navigation";

import { selectWorkId } from "@/repositories/works/select-work-id";

import FieldList from "../field-list";

export const metadata: Metadata = {
  title: "텍스트 매크로 | 텍스트 빌더",
};

export default async function WorkPage({ params }: Props) {
  const { loginName, workSlug } = await params;
  const workIds = await selectWorkId(loginName, workSlug);

  // TODO: 쿠키의 로그인 상태에 따라 다르게 이동
  // - 로그인을 했다면 -> 목록으로 이동
  // - 로그인을 안 했다면 -> 로그인 페이지로 이동
  if (typeof workIds === "string") {
    return redirect("/login");
  }

  return <FieldList workId={workIds.workId} editable />;
}

type Props = {
  params: Promise<{
    loginName: string;
    workSlug: string;
  }>;
};

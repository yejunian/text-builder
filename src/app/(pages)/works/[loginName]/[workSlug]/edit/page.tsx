import { Metadata } from "next";
import { redirect } from "next/navigation";

import MoveToLogin from "@/components/move-to-login";
import { selectWorkId } from "@/repositories/works/select-work-id";
import { userTokenUtils } from "@/utils/server/user-tokens/user-token-utils";

import FieldList from "../field-list";

export const metadata: Metadata = {
  title: "텍스트 매크로 | 텍스트 빌더",
};

export default async function WorkPage({ params }: Props) {
  const userTokens = await userTokenUtils.serverComponent();

  if (!userTokens) {
    return <MoveToLogin />;
  }

  const { loginName, workSlug } = await params;
  const workIds = await selectWorkId(loginName, workSlug);

  const loginUserId = userTokens.access.payload.sub;

  if (typeof workIds === "string") {
    // 아마도 unknown
    return redirect("/works");
  } else if (workIds === null || workIds.ownerId !== loginUserId) {
    // TODO: 403 응답 (원래는 404와 구분되어야 하지만, 그렇게 하면 현재 상황에서는 남의 계정에 특정 work가 존재하는지 파악 가능)
    return redirect("/works");
  }

  // TODO: return을 제외하고는 `../page.tsx`와 거의 동일함
  // `../share/page.tsx`도 비슷한 구조를 가져간다면 `../layout.tsx`로 추출할 필요가 있음
  return <FieldList workId={workIds.workId} editable />;
}

type Props = {
  params: Promise<{
    loginName: string;
    workSlug: string;
  }>;
};

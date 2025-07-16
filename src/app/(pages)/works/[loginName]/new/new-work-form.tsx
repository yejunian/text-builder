"use client";

import { FormEvent, useContext, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import status from "http-status";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserContext } from "@/contexts/user";
import { WorkCreationReqBody } from "@/types/work";
import { getLoginUrl } from "@/utils/get-login-url";

export default function NewWorkForm() {
  const router = useRouter();
  const pathname = usePathname();

  const { loginName } = useContext(UserContext);

  const [workTitle, setWorkTitle] = useState("");
  const [workSlug, setWorkSlug] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!workTitle || !workSlug) {
      event.currentTarget.reportValidity();
    }

    const workCreationReqBody: WorkCreationReqBody = {
      slug: workSlug,
      title: workTitle,
    };

    const response = await fetch("/api/works", {
      method: "post",
      body: JSON.stringify(workCreationReqBody),
    });

    if (response.status === status.UNAUTHORIZED) {
      // TODO: 입력했던 항목을 임시 저장할 필요가 있음
      alert("로그인이 필요합니다.");
      router.push(getLoginUrl(pathname));
      return;
    } else if (response.status === status.BAD_REQUEST) {
      alert("입력이 올바르지 않거나 입력한 제목 또는 ID가 이미 존재합니다.");
      return;
    } else if (!response.ok) {
      alert("새 텍스트 매크로 생성에 실패했습니다.");
      return;
    }

    alert(`새 텍스트 매크로를 생성했습니다.`);
    router.push(`/works/${loginName}/${workSlug}`);
  };

  return (
    <div className="mx-auto w-full max-w-sm p-6">
      <h1 className="mb-6 text-2xl font-bold">새 텍스트 매크로 만들기</h1>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label
            htmlFor="work-title"
            className="after:text-red-600 after:content-['*']"
          >
            제목
          </Label>
          <Input
            id="work-title"
            type="text"
            value={workTitle}
            onChange={(event) => setWorkTitle(event.target.value)}
            autoFocus
            required
          />
          <ul className="text-muted-foreground ml-1 list-inside list-disc text-xs">
            <li>화면에 표시할 텍스트 매크로 제목(150자 이내).</li>
          </ul>
        </div>

        <div className="grid gap-2">
          <Label
            htmlFor="work-slug"
            className="after:text-red-600 after:content-['*']"
          >
            텍스트 매크로 ID
          </Label>
          <Input
            id="work-slug"
            type="text"
            value={workSlug}
            onChange={(event) => setWorkSlug(event.target.value)}
            required
          />
          <ul className="text-muted-foreground ml-1 list-inside list-disc text-xs">
            <li>텍스트 매크로 주소에 사용하는 ID(150자 이내).</li>
            <li>영문 소문자, 숫자, 하이픈(-), 밑줄(_), 온점(.) 사용 가능.</li>
            <li>온점(.)은 연달아서 또는 시작이나 끝에 사용 불가.</li>
          </ul>
        </div>

        <Button type="submit" className="w-full">
          텍스트 매크로 만들기
        </Button>
      </form>
    </div>
  );
}

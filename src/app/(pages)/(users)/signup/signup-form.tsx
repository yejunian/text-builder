"use client";

import type React from "react";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { FlaskConical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSendClientRequest } from "@/hooks/use-send-client-request";
import { UserCreationReqBody } from "@/types/user";

export default function SignupForm() {
  const router = useRouter();

  const { sendClientRequest } = useSendClientRequest();

  const [loginName, setLoginName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!loginName || !password || !passwordConfirm) {
      event.currentTarget.reportValidity();
    }

    if (password !== passwordConfirm) {
      alert("비밀번호 확인란이 일치하지 않습니다.");
    }

    const userCreationReqBody: UserCreationReqBody = {
      loginName,
      displayName,
      password,
    };

    await sendClientRequest({
      request: {
        method: "post",
        url: "/api/users",
        body: userCreationReqBody,
      },

      response: {
        handler: {
          notOk: () => alert("계정 생성에 실패했습니다."),

          ok: () => {
            alert(`‘${loginName}’ 계정을 생성했습니다.`);
            router.push("/login");
          },
        },
      },
    });
  };

  return (
    <form className="p-6 md:p-8" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl font-bold">
            Text Builder{" "}
            <sup className="text-sm font-medium text-violet-700">
              <FlaskConical size="12" strokeWidth="2.5" className="inline" />
              beta
            </sup>
          </h1>
          <p className="text-muted-foreground text-sm text-balance">
            계정을 생성해서 텍스트 매크로를 만들고 활용해 보세요
          </p>
        </div>

        <div className="grid gap-2">
          <Label
            htmlFor="login-name"
            className="after:text-red-600 after:content-['*']"
          >
            로그인 이름
          </Label>
          <Input
            id="login-name"
            type="text"
            value={loginName}
            onChange={(event) => setLoginName(event.target.value)}
            autoFocus
            required
          />
          <ul className="text-muted-foreground ml-1 list-inside list-disc text-xs">
            <li>로그인과 공유에 사용하는 이름(30자 이내).</li>
            <li>영문 소문자, 숫자, 하이픈(-), 밑줄(_), 온점(.) 사용 가능.</li>
            <li>온점(.)은 연달아서 또는 시작이나 끝에 사용 불가.</li>
          </ul>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="login-name">표시 이름</Label>
          <Input
            id="display-name"
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
          <ul className="text-muted-foreground ml-1 list-inside list-disc text-xs">
            <li>화면에 표시하는 이름(100자 이내).</li>
            <li>공란으로 두면 이 내용이 표시될 자리에 ‘로그인 이름’ 표시.</li>
          </ul>
        </div>

        <div className="grid gap-2">
          <Label
            htmlFor="password"
            className="after:text-red-600 after:content-['*']"
          >
            비밀번호
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label
            htmlFor="password-confirm"
            className="after:text-red-600 after:content-['*']"
          >
            비밀번호 확인
          </Label>
          <Input
            id="password-confirm"
            type="password"
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full">
          계정 생성
        </Button>

        {/* <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            또는
          </span>
        </div>

        <Button
          type="button"
          className="w-full bg-[#fee500] text-black/85 hover:bg-[#fee500]/90"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 36 36"
            className="h-4 w-4"
          >
            <path
              d="M18 .97C8.058.97 0 7.226 0 14.943c0 4.798 3.117 9.03 7.863 11.546l-1.997 7.33c-.177.649.561 1.165 1.127.789l8.754-5.805c.738.071 1.489.113 2.253.113 9.941 0 18-6.257 18-13.973S27.941.97 18 .97"
              fill="#000"
            />
          </svg>
          카카오 로그인
        </Button> */}

        <div className="text-center text-sm">
          계정을 이미 만들었나요?{" "}
          <Link href="/login" className="font-medium text-blue-600 underline">
            로그인
          </Link>
        </div>
      </div>
    </form>
  );
}

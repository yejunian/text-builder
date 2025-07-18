"use client";

import type React from "react";
import { FormEvent, useContext, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import status from "http-status";
import { FlaskConical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserContext } from "@/contexts/user";
import { UserLoginResBody } from "@/types/user";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");

  const router = useRouter();

  const { login } = useContext(UserContext);

  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!loginName || !password) {
      event.currentTarget.reportValidity();
    }

    const response = await fetch("/api/login", {
      method: "post",
      body: JSON.stringify({
        loginName,
        password,
      }),
    });

    if (response.status === status.CONFLICT) {
      alert("이미 로그인했습니다.");
      router.push("/works");
      return;
    } else if (!response.ok) {
      alert("로그인에 실패했습니다.");
      return;
    }

    const result: UserLoginResBody = await response.json();
    login(result);

    if (nextPath) {
      router.push(nextPath);
    } else {
      router.push("/works");
    }
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
            로그인해서 텍스트 매크로를 만들고 활용해 보세요
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="login-name">로그인 이름</Label>
          <Input
            id="login-name"
            type="text"
            value={loginName}
            onChange={(event) => setLoginName(event.target.value)}
            autoFocus
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full">
          로그인
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
          계정이 없나요?{" "}
          <Link href="/signup" className="font-medium text-blue-600 underline">
            계정 생성하기
          </Link>
        </div>
      </div>
    </form>
  );
}

import type React from "react";
import { Suspense } from "react";
import { Metadata } from "next";

import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "로그인 | 텍스트 빌더",
  description: "로그인해서 텍스트 매크로를 만들고 활용해 보세요.",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

import type React from "react";
import { Metadata } from "next";

import SignupForm from "./signup-form";

export const metadata: Metadata = {
  title: "계정 생성 | 텍스트 빌더",
  description: "계정을 생성해서 텍스트 매크로를 만들고 활용해 보세요.",
};

export default function SignupPage() {
  return <SignupForm />;
}

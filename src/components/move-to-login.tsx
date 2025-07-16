"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getLoginUrl } from "@/utils/get-login-url";

export default function MoveToLogin() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    router.push(getLoginUrl(pathname));
  }, [pathname, router]);

  return <main>로그인이 필요합니다.</main>;
}

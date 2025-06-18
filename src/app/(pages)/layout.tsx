import type { Metadata } from "next";

import "@/globals.css";

import { UserProvider } from "@/contexts/user";

export const metadata: Metadata = {
  title: "텍스트 빌더",
  description:
    "형식이 정해진 텍스트를 일일이 고치지 않고 필요한 곳만 한번에 수정하기",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="wrap-break-word break-keep">
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}

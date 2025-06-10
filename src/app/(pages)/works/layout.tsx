import { Metadata } from "next";

import Footer from "./footer";
import Header from "./header";

export const metadata: Metadata = {
  title: "텍스트 매크로 전체 보기 | 텍스트 빌더",
};

export default function WorksLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Header />
      <div className="mb-auto">{children}</div>
      <Footer />
    </div>
  );
}

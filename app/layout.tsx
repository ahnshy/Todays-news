
import "./globals.css";
import React from "react";
import { ThemeRegistry } from "@/components/ThemeRegistry";

export const metadata = {
  title: "KR Daily News Highlights",
  description: "전날 많이 본 뉴스를 아침 7시에 요약해 보여주는 하이라이트",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}

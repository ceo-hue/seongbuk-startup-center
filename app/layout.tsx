import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "성북구 중장년 기술창업센터",
  description: "다시, 도전할 수 있는 중장년 기술창업의 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import "./editorial.css";

const notoSans = Noto_Sans_SC({
  weight: "variable",
  display: "swap",
  preload: false,
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "AI 基础教育公益网站",
  description: "面向学生、家长和教育工作者的中文人工智能公益学习平台。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={notoSans.variable}
      data-scroll-behavior="smooth"
    >
      <body>{children}</body>
    </html>
  );
}

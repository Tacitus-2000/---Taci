import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./_components/Providers";

export const metadata: Metadata = {
  title: "律师内容平台",
  description: "面向律师业务的 Admin 后台与 Client 前台入口",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

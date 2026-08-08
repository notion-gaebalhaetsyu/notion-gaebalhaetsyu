import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "개발했슈 | 위젯 제빵소",
  description: "노션에 필요한 기능, 우리가 직접 구웠슈!",
};

import { ToastProvider } from "@/components/Toast";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pl-64">
        <ToastProvider>
          <Sidebar />
          <main className="flex-1 p-8">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}

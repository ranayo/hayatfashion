// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Header from "@/components/Header";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HAYATFASHION",
  description: "Online fashion store built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f6f2ef]`}
      >
        {/* כותרת עליונה של האתר */}
        <Header />

        {/* תוכן הדפים */}
        {children}

        {/* Toastים (למשל “נוסף לעגלה ✨”) */}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}

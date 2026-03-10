import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@widgets/header";
import { AuthProvider } from "@features/auth";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "싱긋 · SynGrid",
  description: "실시간 협업 뷰포트 그리드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${outfit.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <AuthProvider>
          <Header title="싱긋" />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@widgets/header";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Synchronized Grid",
  description: "Real-time collaborative viewport grid",
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
        <Header title="Synchronized Grid" />
        {children}
      </body>
    </html>
  );
}

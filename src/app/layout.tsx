import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "GEN-SO（言層）",
  description: "ユーザーの言葉やライフログを、3D空間上の「地層（Strata）」として視覚化する没入型アート作品",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-black text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}


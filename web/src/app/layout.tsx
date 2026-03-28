import type { Metadata } from "next";
import { Geist_Mono, Outfit } from "next/font/google";
import { Footer } from "@/components/features/common/Footer";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteTitle = "Tabiji — 旅行のしおり作成・共有｜無料・アプリ不要";
const siteDescription =
  "旅行のしおりをスマホやPCのブラウザだけで無料作成。アカウント登録もアプリも不要で、URLを送るだけでみんなと共有できる旅行の行程表・スケジュール共有サービスです。";

export const metadata: Metadata = {
  title: {
    template: "%s | Tabiji",
    default: siteTitle,
  },
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    siteName: "Tabiji",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tabiji",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${outfit.variable} ${geistMono.variable}`} lang="ja">
      <body className="antialiased">
        {children}
        <Footer />
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}

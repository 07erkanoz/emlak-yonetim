import "./globals.css";
import type { Metadata } from "next";

// Metadata (PWA için gerekenler burada kalabilir)
export const metadata: Metadata = {
  title: "Emlak Paneli",
  description: "Kira ve mülk yönetimi uygulaması",
  manifest: "/manifest.json", // doğru yerdesin, kalabilir
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Emlak Panel",
  },
  // themeColor ve viewport'u buradan tamamen kaldırdık
};

// Next.js 14+ için viewport ayrı export olmalı
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1e293b", // theme-color meta etiketi yerine buraya taşıdık
};

// children'ın tipini tanımlıyoruz → TypeScript hatası gider
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <head>
        {/* PWA ile ilgili ek meta etiketler hâlâ kalabilir, sorun yok */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Emlak Panel" />
        {/* viewport ve theme-color artık export'larda tanımlı olduğu için buradan kaldırdık */}
      </head>
      <body className="bg-neutral-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}

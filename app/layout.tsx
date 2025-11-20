import "./globals.css";

export const metadata = {
  title: "Emlak Paneli",
  description: "Kira ve mülk yönetimi uygulaması",
  manifest: "/manifest.json",
  // ❗ Buradan themeColor ve viewport kaldırıldı.
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Emlak Panel",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e293b" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Emlak Panel" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="bg-neutral-900">{children}</body>
    </html>
  );
}

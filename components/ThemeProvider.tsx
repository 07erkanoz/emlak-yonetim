"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Eski localStorage tema bilgisini temizle
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('theme');
    }
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="emlak-theme"
    >
      {children}
    </NextThemesProvider>
  );
}

"use client";

import { useRouter } from "next/navigation";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  userName?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export default function AppHeader({
  title = "Emlak Paneli",
  subtitle,
  userName,
  showBackButton = false,
  onBack
}: AppHeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("mulkUser");
    router.push("/login");
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/70 backdrop-blur-2xl shadow-2xl shadow-black/50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Sol taraf - Başlık */}
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="p-2.5 rounded-2xl bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-300 backdrop-blur-xl border border-white/10"
                aria-label="Geri"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl drop-shadow-glow">🏢</span>
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{title}</span>
              </h1>
              {subtitle && (
                <div className="text-sm text-slate-400">{subtitle}</div>
              )}
            </div>
          </div>

          {/* Sağ taraf - Kullanıcı ve Butonlar */}
          <div className="flex items-center gap-3">
            {userName && (
              <div className="hidden md:block text-right">
                <div className="text-sm font-semibold text-white">
                  {userName}
                </div>
                <div className="text-xs text-slate-400">
                  {new Date().toLocaleDateString('tr-TR', {
                    day: '2-digit',
                    month: 'long'
                  })}
                </div>
              </div>
            )}

            {/* Çıkış Butonu */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 hover:from-red-500/30 hover:to-pink-500/30 hover:text-red-200 transition-all duration-300 font-medium text-sm backdrop-blur-xl border border-red-500/20 hover:border-red-500/40 shadow-lg shadow-red-500/10"
              aria-label="Çıkış"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

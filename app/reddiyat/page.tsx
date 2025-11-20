"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppHeader from "@/components/AppHeader";

interface ReddiyatItem {
  tarih: string;
  tutar: number;
  aciklama: string;
  tenantName: string;
  parabirimi: string;
}

function ReddiyatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const msid = searchParams.get("msid");

  const [reddiyatList, setReddiyatList] = useState<ReddiyatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [reddiyatByCurrency, setReddiyatByCurrency] = useState<Record<string, number>>({});

  useEffect(() => {
    // Login kontrolü
    try {
      const storedUser = localStorage.getItem("mulkUser");
      if (!storedUser) {
        router.replace("/login");
        return;
      }
      const parsed = JSON.parse(storedUser);
      setUser(parsed);

      // Reddiyat verilerini yükle
      loadReddiyat(parsed.id);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  async function loadReddiyat(userId: number) {
    try {
      const res = await fetch(`/api/dashboard?mulksahib_id=${userId}`);
      const data = await res.json();
      
      if (data.success) {
        setReddiyatList(data.reddiyatList || []);
        setReddiyatByCurrency(data.reddiyatByCurrency || {});
      }
    } catch (err) {
      console.error("Reddiyat yüklenemedi:", err);
    } finally {
      setLoading(false);
    }
  }

  const formatMoney = (amount: number, currency: string) => {
    const formatted = amount.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `${formatted} ${currency}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Yükleniyor...</div>
      </div>
    );
  }

  // Para birimlerine göre grupla
  const currencies = Object.keys(reddiyatByCurrency).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">
      {/* Header */}
      <AppHeader
        title="Reddiyat Bekleyen"
        subtitle="Avukat kasasında bekleyen ödemeler"
        userName={user?.name}
        showBackButton={true}
      />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Para Birimi Bazlı Toplam Kartlar */}
        {currencies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currencies.map((currency) => (
              <div
                key={currency}
                className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 dark:from-amber-600 dark:via-orange-600 dark:to-amber-700 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-transform"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-white/80 text-sm font-medium mb-2">
                      Toplam Reddiyat ({currency})
                    </div>
                    <div className="text-5xl font-bold text-white mb-2">
                      {formatMoney(reddiyatByCurrency[currency], currency)}
                    </div>
                    <div className="text-white/70 text-sm">
                      {reddiyatList.filter(r => r.parabirimi === currency).length} adet ödeme
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-4xl">💰</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-3xl p-12 text-center">
            <span className="text-6xl mb-4 block">✅</span>
            <div className="text-2xl font-semibold text-white mb-2">
              Tebrikler!
            </div>
            <div className="text-slate-400">
              Şu anda bekleyen reddiyat ödemesi bulunmuyor.
            </div>
          </div>
        )}

        {/* Reddiyat Listesi - Para Birimlerine Göre */}
        {currencies.map((currency) => {
          const items = reddiyatList.filter(r => r.parabirimi === currency);
          
          return (
            <div key={currency} className="bg-white dark:bg-slate-900/50 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <span className="text-3xl">📋</span>
                  {currency} Cinsinden Bekleyen Ödemeler
                </h2>
                <div className="px-4 py-2 bg-amber-500/20 dark:bg-amber-500/20 rounded-full text-amber-600 dark:text-amber-400 text-sm font-semibold">
                  {items.length} ödeme
                </div>
              </div>
              
              {items.length > 0 ? (
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition group"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-14 h-14 rounded-full bg-amber-500/20 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                          <span className="text-2xl">💵</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-white text-lg mb-1">
                            {item.tenantName || 'Kiracı'}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {item.aciklama || 'Tahsilat'} • {new Date(item.tarih).toLocaleDateString('tr-TR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-6">
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                          {formatMoney(item.tutar, currency)}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Toplam Satırı */}
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border-2 border-amber-300 dark:border-amber-700 rounded-2xl mt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-amber-500/30 flex items-center justify-center">
                        <span className="text-2xl">💎</span>
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-xl">TOPLAM ({currency})</div>
                        <div className="text-sm text-amber-700 dark:text-amber-300">Avukatta bekleyen tutar</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                        {formatMoney(reddiyatByCurrency[currency], currency)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-600 dark:text-slate-400">
                  <span className="text-4xl mb-2 block">✅</span>
                  {currency} cinsinden bekleyen ödeme bulunmuyor.
                </div>
              )}
            </div>
          );
        })}

        {/* Bilgi Notu */}
        <div className="bg-blue-900/20 border-2 border-blue-800 rounded-3xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">ℹ️</span>
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold text-blue-300 mb-2">Reddiyat Nedir?</div>
              <div className="text-sm text-blue-200/80 leading-relaxed">
                Reddiyat, kiracılardan avukat tarafından tahsil edilmiş ancak henüz mülk sahibine 
                aktarılmamış olan kira ödemelerini ifade eder. Bu tutarlar avukatın kasasında 
                beklemektedir ve yakın zamanda hesabınıza aktarılacaktır.
              </div>
            </div>
          </div>
        </div>

        {/* Footer Butonlar */}
        <div className="flex gap-4 pb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 px-8 rounded-2xl transition shadow-lg text-lg"
          >
            Ana Sayfa
          </button>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center py-6 text-sm text-slate-600">
        © 2024 Emlak Yönetimi - sbyazilim.com.tr
      </div>
    </div>
  );
}

export default function ReddiyatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Yükleniyor...</div>
      </div>
    }>
      <ReddiyatContent />
    </Suspense>
  );
}

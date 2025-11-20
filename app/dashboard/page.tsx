"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DonutChart from "@/components/DonutChart";
import AppHeader from "@/components/AppHeader";

interface CurrencySummary {
  currency: string;
  totalRent: number;
  totalCollected: number;
  remaining: number;
}

interface Tenant {
  id: number;
  adi: string;
  propertyName: string;
  sozlesmebedeli: number;
  kalan: number;
  parabirimi: string;
}

interface Payment {
  tarih: string;
  tutar: number;
  aciklama: string;
  tenantName: string;
  parabirimi: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // Kiracı arama

  // Login kontrolü - Her zaman kontrol et
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem("mulkUser");
        
        // localStorage'da kullanıcı yoksa login'e yönlendir
        if (!storedUser) {
          router.replace("/login");
          return;
        }

        const parsed = JSON.parse(storedUser);
        
        // Parse edilen veri geçersizse login'e yönlendir
        if (!parsed?.id) {
          localStorage.removeItem("mulkUser");
          router.replace("/login");
          return;
        }

        setUser(parsed);
        setReady(true);
      } catch {
        localStorage.removeItem("mulkUser");
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);

  // Dashboard verilerini yükle
  useEffect(() => {
    if (!ready || !user?.id) return;

    async function loadDashboard() {
      try {
        const res = await fetch(`/api/dashboard?mulksahib_id=${user.id}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Dashboard yükleme hatası:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user, ready]);

  const handleLogout = () => {
    localStorage.removeItem("mulkUser");
    router.push("/login");
  };

  // Para formatı: 16.275,00 EUR
  const formatMoney = (amount: number, currency: string) => {
    const formatted = amount.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `${formatted} ${currency}`;
  };

  if (!ready) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Yükleniyor...</div>
      </div>
    );
  }

  if (!data?.success) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="text-red-500">Hata: {data?.error || "Veri alınamadı"}</div>
      </div>
    );
  }

  const currencySummaries: CurrencySummary[] = data.currencySummary || [];
  const tenants: Tenant[] = data.tenants || [];
  const history: Payment[] = data.history || [];
  const schedule = data.schedule || [];
  const reddiyatByCurrency = data.reddiyatByCurrency || {};

  // Kiracı arama filtresi - TÜM kiracılar arasında ara
  const filteredTenants = searchQuery
    ? tenants.filter(tenant =>
        tenant.adi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.propertyName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const today = new Date();
  const dateStr = today.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <AppHeader
        title="Mülk Sahibi Dashboard"
        subtitle="Kira ve mülk yönetimi"
        userName={data.mulkSahibi?.adi || user.name}
      />

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Kiracı Arama */}
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 shadow-2xl shadow-black/50">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Kiracı ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/10 transition-all duration-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {/* Arama Sonuçları Dropdown */}
          {searchQuery && filteredTenants.length > 0 && (
            <div className="mt-2 absolute z-50 w-full bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 max-h-96 overflow-y-auto">
              {filteredTenants.map((tenant) => (
                <div
                  key={tenant.id}
                  onClick={() => {
                    router.push(`/kiraci/${tenant.id}`);
                    setSearchQuery("");
                  }}
                  className="flex items-center justify-between p-4 hover:bg-white/10 cursor-pointer transition-all duration-300 border-b border-white/5 last:border-0"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-white">{tenant.adi}</div>
                    <div className="text-sm text-slate-400">{tenant.propertyName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-blue-400">
                      Detay &gt;
                    </div>
                    {tenant.kalan > 0 && (
                      <div className="text-xs text-red-400">
                        Borç: {formatMoney(tenant.kalan, tenant.parabirimi)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {searchQuery && filteredTenants.length === 0 && (
            <div className="mt-2 p-4 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl text-center text-slate-400">
              Kiracı bulunamadı
            </div>
          )}
        </div>

        {/* Para Birimi Bazlı Özet Kartlar */}
        {currencySummaries.map((summary) => (
          <div key={summary.currency}>
            <div className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              {summary.currency} Cinsinden Sözleşmeler
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <SummaryCard 
                title="Toplam Sözleşme" 
                value={summary.totalRent}
                currency={summary.currency}
                subtitle="Kiracı sözleşme toplamı"
                color="blue"
              />
              <SummaryCard 
                title="Tahsil Edilen" 
                value={summary.totalCollected}
                currency={summary.currency}
                subtitle="Toplam tahsilat"
                color="green"
              />
              <SummaryCard 
                title="Tahsil Bakiye" 
                value={summary.remaining}
                currency={summary.currency}
                subtitle="Ödenmemiş kira"
                color="orange"
              />
              <SummaryCard 
                title="Reddiyat Bekleyen" 
                value={reddiyatByCurrency[summary.currency] || 0}
                currency={summary.currency}
                subtitle="Mülk sahibine aktarılacak"
                color="red"
                onClick={() => router.push(`/reddiyat?msid=${user.id}`)}
              />
            </div>
          </div>
        ))}

        {/* Ana Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kira Dağılımı - İlk para birimi için */}
          {currencySummaries.length > 0 && (
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Kira Dağılımı ({currencySummaries[0].currency})
              </h2>
              <DonutChart
                totalRent={currencySummaries[0].totalRent}
                totalCollected={currencySummaries[0].totalCollected}
                reddiyatPending={reddiyatByCurrency[currencySummaries[0].currency] || 0}
              />
            </div>
          )}

          {/* En Çok Borcu Olan Kiracılar - Tıklanabilir */}
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">En Çok Borcu Olan Kiracılar</h2>
              <div className="text-xs text-slate-500 dark:text-slate-400">Tıklayarak detay görün</div>
            </div>
            
            <div className="space-y-3">
              {tenants
                .filter(t => t.kalan > 0)
                .sort((a, b) => b.kalan - a.kalan)
                .slice(0, 5)
                .map((tenant) => (
                  <div 
                    key={tenant.id}
                    className="flex items-start justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer group"
                    onClick={() => router.push(`/kiraci/${tenant.id}`)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        {tenant.adi}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{tenant.propertyName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-red-600 dark:text-red-400">
                        {formatMoney(tenant.kalan, tenant.parabirimi)}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-500">Detay &gt;</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Hatırlatmalar */}
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Hatırlatmalar / Notlar</h2>
            </div>
            
            <div className="space-y-3">
              {schedule.length > 0 ? (
                schedule.slice(0, 4).map((item: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-start justify-between">
                      <div className="font-medium text-slate-900 dark:text-white text-sm">{item.tenantName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(item.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{item.description}</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-500 dark:text-slate-500 py-8">Hatırlatma yok</div>
              )}
            </div>
          </div>
        </div>

        {/* Son Tahsilatlar */}
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Son Tahsilatlar</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Kiracı</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Tarih</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Açıklama</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Tutar</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 10).map((payment, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 text-sm text-slate-900 dark:text-white">{payment.tenantName}</td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(payment.tarih).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{payment.aciklama}</td>
                    <td className="py-3 px-4 text-sm text-right font-semibold text-green-600 dark:text-green-400">
                      {formatMoney(payment.tutar, payment.parabirimi)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Butonlar */}
        <div className="flex gap-4 pb-8">
          <button
            onClick={() => router.push(`/kiracilar?msid=${user.id}`)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition shadow-lg"
          >
            📋 Tüm Kiracılar
          </button>
          <button
            onClick={() => router.push(`/reddiyat?msid=${user.id}`)}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-4 px-6 rounded-xl transition shadow-lg"
          >
            💰 Reddiyat
          </button>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center py-4 text-xs text-slate-400 dark:text-slate-600">
        © {new Date().getFullYear()} Emlak Yönetimi - Erkan ÖZ - sbyazilim.com.tr - erknaoz.com
      </div>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: number;
  currency: string;
  subtitle: string;
  color: "blue" | "green" | "orange" | "red";
  onClick?: () => void;
}

function SummaryCard({ title, value, currency, subtitle, color, onClick }: SummaryCardProps) {
  const colors = {
    blue: "from-blue-600 to-cyan-600",
    green: "from-green-600 to-emerald-600",
    orange: "from-orange-600 to-amber-600",
    red: "from-red-600 to-rose-600"
  };

  const formatMoney = (amount: number, currency: string) => {
    const formatted = amount.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `${formatted} ${currency}`;
  };

  return (
    <div 
      className={`bg-gradient-to-br ${colors[color]} rounded-2xl p-6 shadow-lg ${onClick ? 'cursor-pointer hover:scale-105' : ''} transition-transform`}
      onClick={onClick}
    >
      <div className="text-white/80 text-sm font-medium mb-1">{title}</div>
      <div className="text-3xl font-bold text-white mb-1">
        {formatMoney(value, currency)}
      </div>
      <div className="text-white/60 text-xs">{subtitle}</div>
    </div>
  );
}
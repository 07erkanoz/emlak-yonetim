"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";

interface Tenant {
  id: number;
  adi: string;
  tc: string;
  telefon: string;
  evadres: string;
  adres: string;
  parabirimi: string;
  bakiyesi: number;
  sozlesmebedeli: number;
  tahsilat: number;
  kalan: number;
  kirabaslangic: string;
  kirabitis: string;
  notlar: string;
  mulk_adi: string;
  amaci?: string;
  tahliye?: string;
  icralik?: string;
}

interface Fis {
  id: number;
  tarih: string;
  tutar: number;
  aciklama: string;
  fistipi: string;
  parabirimi: string;
}

export default function TenantDetailPage({ params }: any) {
  const { id } = params;
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("mulkUser");
      if (!storedUser) {
        router.replace("/login");
        return;
      }
    } catch {
      router.replace("/login");
      return;
    }

    fetch(`/api/kiraci/${id}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, router]);

  const formatMoney = (amount: number, currency: string) => {
    const formatted = amount.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `${formatted} ${currency}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

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
        <div className="text-red-500">{data?.error || "Kiracı bulunamadı"}</div>
      </div>
    );
  }

  const tenant: Tenant = data.tenant;
  const vadeler: Fis[] = data.vadeler || [];
  const tahsilatlar: Fis[] = data.tahsilatlar || [];
  const summary = data.summary;

  // Yüzde hesapla
  const percentage = summary.total > 0 ? (summary.paid / summary.total) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">
      {/* Header */}
      <AppHeader
        title={tenant.adi}
        subtitle={tenant.mulk_adi}
        showBackButton={true}
      />

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Üst Kısım - Geliştirilmiş Kiracı Bilgileri */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sol - Kiracı Bilgileri */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{tenant.adi}</h1>
                <div className="flex items-start gap-3 text-slate-400 mt-3 p-4 bg-slate-800/50 rounded-xl">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Mülk Adresi</div>
                    <span className="text-sm font-medium text-white">{tenant.adres || tenant.mulk_adi}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoBox icon="🆔" label="T.C. Kimlik No" value={tenant.tc || '-'} />
                <InfoBox icon="📞" label="Telefon" value={tenant.telefon || '-'} />
                <InfoBox icon="🏢" label="Kullanım Amacı" value={tenant.amaci || 'İş Yeri'} />
                <InfoBox icon="💶" label="Para Birimi" value={tenant.parabirimi} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Kira Başlangıç</div>
                    <div className="text-sm font-semibold text-white">{formatDate(tenant.kirabaslangic)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Kira Bitiş</div>
                    <div className="text-sm font-semibold text-white">{formatDate(tenant.kirabitis)}</div>
                  </div>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex gap-3 pt-4">
                <StatusBadge 
                  label="Tahliye" 
                  active={tenant.tahliye === 'E'} 
                  color="orange"
                />
                <StatusBadge 
                  label="İcralık" 
                  active={tenant.icralik === 'E'} 
                  color="red"
                />
              </div>
            </div>

            {/* Sağ - Progress Chart */}
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-slate-800"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${percentage * 5.53} 553`}
                    className="text-green-500 transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold text-white">{percentage.toFixed(0)}%</div>
                  <div className="text-xs text-slate-400 mt-1">Tahsil Oranı</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Özet Kartlar - 3 Kart */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard3
            title="Sözleşme Bedeli"
            value={summary.total}
            currency={tenant.parabirimi}
            icon="📄"
            color="blue"
          />
          <SummaryCard3
            title="Ödenen"
            value={summary.paid}
            currency={tenant.parabirimi}
            icon="✅"
            color="green"
          />
          <SummaryCard3
            title="Kalan Borç"
            value={summary.remaining}
            currency={tenant.parabirimi}
            icon="⏳"
            color="red"
          />
        </div>

        {/* Tahsilatlar - ÜST SIRAYA TAŞINDI */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">💵</span>
            Tahsilat Geçmişi
          </h2>
          
          {tahsilatlar.length > 0 ? (
            <div className="space-y-2">
              {tahsilatlar.map((tahsilat) => (
                <div 
                  key={tahsilat.id} 
                  className="flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">✅</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white">{tahsilat.aciklama || 'Tahsilat'}</div>
                      <div className="text-sm text-slate-400">{formatDate(tahsilat.tarih)}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="text-lg font-bold text-green-400">
                      {formatMoney(tahsilat.tutar, tahsilat.parabirimi)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <span className="text-4xl mb-2 block">📭</span>
              Henüz tahsilat kaydı bulunmuyor.
            </div>
          )}
        </div>

        {/* Sözleşme Bedelleri Listesi - TAHSİLATLARIN ALTINA TAŞINDI */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Sözleşme Ödeme Bedelleri
          </h2>
          
          {vadeler.length > 0 ? (
            <div className="space-y-2">
              {vadeler.map((vade) => (
                <div 
                  key={vade.id} 
                  className="flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">💰</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white">{vade.fistipi}</div>
                      <div className="text-sm text-slate-400">{formatDate(vade.tarih)}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="text-lg font-bold text-blue-400">
                      {formatMoney(vade.tutar, vade.parabirimi)}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Toplam Satırı */}
              <div className="flex items-center justify-between p-4 bg-blue-900/20 border border-blue-800 rounded-xl mt-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/30 flex items-center justify-center">
                    <span className="text-xl">💎</span>
                  </div>
                  <div>
                    <div className="font-bold text-white text-lg">Toplam Sözleşme Bedeli</div>
                    <div className="text-sm text-blue-300">Tüm ödemelerin toplamı</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-400">
                    {formatMoney(summary.total, tenant.parabirimi)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <span className="text-4xl mb-2 block">📋</span>
              Sözleşme bedeli kaydı bulunmuyor.
            </div>
          )}
        </div>

        {/* Notlar */}
        {tenant.notlar && (
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📝</span>
              Kiracı Notu
            </h2>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <p className="text-slate-300 whitespace-pre-line leading-relaxed">{tenant.notlar}</p>
            </div>
          </div>
        )}

        {/* Footer Butonlar */}
        <div className="flex gap-4 pb-8">
          <button
            onClick={() => router.push("/kiracilar")}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition"
          >
            Kiracılar
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-4 px-6 rounded-xl transition"
          >
            Ana Sayfa
          </button>
        </div>
      </div>

      <div className="text-center py-4 text-xs text-slate-600">
        © 2024 Emlak Yönetimi - sbyazilim.com.tr
      </div>
    </div>
  );
}

function InfoBox({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl">
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-sm font-semibold text-white">{value}</div>
      </div>
    </div>
  );
}

function StatusBadge({ label, active, color }: { label: string; active: boolean; color: string }) {
  const colors = {
    orange: active ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-slate-800/30 text-slate-500 border-slate-700',
    red: active ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-slate-800/30 text-slate-500 border-slate-700'
  };

  return (
    <div className={`px-4 py-2 rounded-full text-xs font-semibold border ${colors[color as keyof typeof colors]}`}>
      {label}: {active ? 'Evet' : 'Hayır'}
    </div>
  );
}

function SummaryCard3({ title, value, currency, icon, color }: any) {
  const colors = {
    blue: "from-blue-600 to-cyan-600",
    green: "from-green-600 to-emerald-600",
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
    <div className={`bg-gradient-to-br ${colors[color as keyof typeof colors]} rounded-2xl p-6 shadow-lg`}>
      <div className="flex items-start justify-between mb-3">
        <div className="text-white/80 text-sm font-medium">{title}</div>
        <span className="text-3xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-white">
        {formatMoney(value, currency)}
      </div>
    </div>
  );
}

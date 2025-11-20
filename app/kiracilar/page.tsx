"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppHeader from "@/components/AppHeader";

interface Tenant {
  id: number;
  adi: string;
  propertyName: string;
  sozlesmebedeli: number;
  kalan: number;
  parabirimi: string;
  kirabaslangic: string;
  kirabitis: string;
}

export default function KiracilarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const msid = searchParams.get("msid");

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

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

      // Kiracıları yükle
      loadTenants(parsed.id);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  async function loadTenants(userId: number) {
    try {
      const res = await fetch(`/api/dashboard?mulksahib_id=${userId}`);
      const data = await res.json();
      
      if (data.success) {
        setTenants(data.tenants || []);
      }
    } catch (err) {
      console.error("Kiracılar yüklenemedi:", err);
    } finally {
      setLoading(false);
    }
  }

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">
      {/* Header */}
      <AppHeader
        title="Kiracı Listesi"
        subtitle={`Toplam ${tenants.length} kiracı`}
        userName={user?.name}
        showBackButton={true}
      />

      <div className="container mx-auto px-4 py-6">
        {/* Kiracı Listesi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {tenants.map((tenant) => (
            <div
              key={tenant.id}
              onClick={() => router.push(`/kiraci/${tenant.id}`)}
              className="bg-white dark:bg-slate-900/50 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {tenant.adi}
                  </h3>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{tenant.propertyName}</div>
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500">
                  &gt;
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 dark:text-slate-500">Sözleşme Bedeli:</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {tenant.parabirimi}{formatMoney(tenant.sozlesmebedeli)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 dark:text-slate-500">Kalan Borç:</span>
                  <span className={`text-sm font-bold ${tenant.kalan > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {tenant.parabirimi}{formatMoney(tenant.kalan)}
                  </span>
                </div>

                {tenant.kirabaslangic && tenant.kirabitis && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="text-xs text-slate-600 dark:text-slate-500">
                      {new Date(tenant.kirabaslangic).toLocaleDateString('tr-TR')}
                      {' → '}
                      {new Date(tenant.kirabitis).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                )}
              </div>

              {/* Durum Badge */}
              {tenant.kalan > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-800">
                    Borç Var
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {tenants.length === 0 && (
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-12 text-center">
            <div className="text-slate-400">Henüz kiracı kaydı bulunmuyor.</div>
          </div>
        )}

        {/* Footer Butonlar */}
        <div className="flex gap-4 pb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition"
          >
            Ana Sayfa
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("mulkUser");
              router.push("/login");
            }}
            className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-4 px-6 rounded-xl transition"
          >
            Programı Kapat
          </button>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center py-4 text-xs text-slate-600">
        © 2024 Emlak Yönetimi - sbyazilim.com.tr
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Lütfen kullanıcı adı ve şifre giriniz.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Giriş başarısız.");
        setLoading(false);
        return;
      }

      // Login başarılı → kullanıcıyı sakla
      localStorage.setItem(
        "mulkUser",
        JSON.stringify({
          id: data.mulkSahibi.id,
          name: data.mulkSahibi.adi,
          username: data.mulkSahibi.username,
        })
      );

      router.push("/dashboard");

    } catch (err) {
      console.error(err);
      setError("Sunucu bağlantısında sorun oluştu.");
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-black/30">
        
        <h1 className="mb-1 text-center text-xl font-semibold text-slate-100">
          Mülk Sahibi Girişi
        </h1>
        <p className="mb-6 text-center text-xs text-slate-400">
          Lütfen kullanıcı adı ve şifrenizle giriş yapınız.
        </p>

        {/* Hata mesajı */}
        {error && (
          <div className="mb-4 rounded-lg border border-rose-500 bg-rose-900/40 px-3 py-2 text-xs text-rose-200">
            {error}
          </div>
        )}

        {/* FORM */}
        <form className="space-y-3" onSubmit={handleLogin}>
          <div>
            <label className="text-xs text-slate-300">Kullanıcı Adı</label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-slate-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="musteri123"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300">Şifre</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-slate-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-40"
          >
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

      </div>
    </div>
  );
}

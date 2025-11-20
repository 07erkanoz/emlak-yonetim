import { query } from "@/lib/db";

export async function GET(request: Request) {
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      const { searchParams } = new URL(request.url);
      const mulksahib_id = searchParams.get("mulksahib_id");

      if (!mulksahib_id) {
        return Response.json({ success: false, error: "mulksahib_id gerekiyor" }, { status: 400 });
      }

      const msid = mulksahib_id;

      /* ============================================================
         1) MÜLK SAHİBİ BİLGİSİ
      ============================================================ */
      const ownerRows: any = await query(
        "SELECT id, adi, tc, telefon FROM mulksahibi WHERE id = ? LIMIT 1",
        [msid]
      );
      const owner = ownerRows[0] || null;

      /* ============================================================
         2) PARA BİRİMİNE GÖRE SÖZLEŞME TOPLAMARI
      ============================================================ */
      const currencySummary: any = await query(
        `SELECT 
          SUM(bakiyesi) AS totalRent,
          SUM(tahsilat) AS totalCollected,
          SUM(kalan) AS remaining,
          parabirimi
         FROM kiraci 
         WHERE msid = ? 
           AND aktif='E' 
           AND (tipi IS NULL OR tipi='N')
         GROUP BY parabirimi`,
        [msid]
      );

      /* ============================================================
         3) SON TAHSİLATLAR (history) - Para birimi ile
      ============================================================ */
      const historyRows: any = await query(
        `SELECT 
          F.tarih,
          F.tutar,
          F.aciklama,
          F.parabirimi,
          K.adi AS tenantName
         FROM fisler F
         LEFT JOIN kiraci K ON K.id = F.kid
         WHERE F.msid = ? AND F.fistipi='Tahsilat'
         ORDER BY F.tarih DESC
         LIMIT 20`,
        [msid]
      );

      /* ============================================================
         4) HATIRLATMALAR (schedule)
      ============================================================ */
      const scheduleRows: any = await query(
        `SELECT 
          K.adi AS tenantName,
          K.notlar AS description,
          K.kirabitis AS date
         FROM kiraci K
         WHERE K.msid = ?
           AND K.aktif='E'
           AND K.notlar IS NOT NULL
           AND K.notlar <> ''`,
        [msid]
      );

      /* ============================================================
         5) KİRACI LİSTESİ (tenants)
      ============================================================ */
      const tenantsRows: any = await query(
        `SELECT
            K.id,
            K.adi,
            K.sozlesmebedeli,
            K.kalan,
            K.parabirimi,
            K.kirabaslangic,
            K.kirabitis,
            M.adi AS propertyName
         FROM kiraci K
         LEFT JOIN mulk M ON M.id = K.mulkid
         WHERE K.msid = ?
           AND K.aktif='E'
           AND (K.tipi IS NULL OR K.tipi='N')
         ORDER BY K.kalan DESC`,
        [msid]
      );

      /* ============================================================
         6) REDDİYAT BEKLEYENLER
      ============================================================ */
      const reddiyatRows: any = await query(
        `SELECT 
            F.tarih,
            F.tutar,
            F.aciklama,
            F.parabirimi,
            K.adi AS tenantName
         FROM fisler F
         LEFT JOIN kiraci K ON K.id = F.kid
         WHERE F.msid = ?
           AND F.fistipi = 'Tahsilat'
           AND F.avid = 0
           AND F.reddiyatid = 0
         ORDER BY F.tarih DESC`,
        [msid]
      );

      // Para birimine göre reddiyat toplamları
      const reddiyatByCurrency = reddiyatRows.reduce((acc: any, r: any) => {
        const currency = r.parabirimi || 'TL';
        if (!acc[currency]) acc[currency] = 0;
        acc[currency] += Number(r.tutar || 0);
        return acc;
      }, {});

      /* ============================================================
         7) JSON RESPONSE
      ============================================================ */
      return Response.json({
        success: true,
        mulkSahibi: owner,
        
        // Para birimi bazlı özetler
        currencySummary: currencySummary.map((item: any) => ({
          currency: item.parabirimi || 'TL',
          totalRent: Number(item.totalRent || 0),
          totalCollected: Number(item.totalCollected || 0),
          remaining: Number(item.remaining || 0)
        })),

        // Genel toplamlar (eski API uyumluluğu için)
        totalRentAmount: Number(currencySummary[0]?.totalRent || 0),
        totalCollected: Number(currencySummary[0]?.totalCollected || 0),
        remainingBalance: Number(currencySummary[0]?.remaining || 0),

        tenants: tenantsRows.map((t: any) => ({
          ...t,
          sozlesmebedeli: Number(t.sozlesmebedeli || 0),
          kalan: Number(t.kalan || 0)
        })),

        history: historyRows.map((h: any) => ({
          ...h,
          tutar: Number(h.tutar || 0)
        })),

        schedule: scheduleRows,

        // Reddiyat
        reddiyatByCurrency,
        reddiyatPending: Object.values(reddiyatByCurrency).reduce((sum: number, val: any) => sum + val, 0),
        reddiyatList: reddiyatRows.map((r: any) => ({
          ...r,
          tutar: Number(r.tutar || 0)
        })),
      });

    } catch (error: any) {
      attempts++;
      console.error(`Dashboard API error (attempt ${attempts}/${maxAttempts}):`, error);
      
      // ECONNRESET hatası ise yeniden dene
      if (error.code === 'ECONNRESET' && attempts < maxAttempts) {
        console.log(`Retrying connection... (${attempts}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 saniye bekle
        continue;
      }
      
      // Son denemede hata döndür
      if (attempts >= maxAttempts) {
        return Response.json({ 
          success: false, 
          error: "Veritabanı bağlantı hatası. Lütfen tekrar deneyin.",
          details: error.message
        }, { status: 500 });
      }
    }
  }
  
  // Hiçbir deneme başarılı olamadıysa
  return Response.json({ 
    success: false, 
    error: "Beklenmeyen hata oluştu" 
  }, { status: 500 });
}
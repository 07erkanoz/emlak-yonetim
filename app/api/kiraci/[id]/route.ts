export const dynamic = "force-dynamic";
import { query } from "@/lib/db";

export async function GET(req: Request, { params }: any) {
  try {
    const id = params.id;

    // Kiracı temel bilgi
    const tenantRows: any = await query(
      `SELECT k.*, m.adi AS mulk_adi, m.adres AS mulk_adres
       FROM kiraci k
       LEFT JOIN mulk m ON k.mulkid = m.id
       WHERE k.id = ?
       LIMIT 1`,
      [id]
    );

    if (!tenantRows || tenantRows.length === 0) {
      return Response.json({ success: false, error: "Kiracı bulunamadı" }, { status: 404 });
    }

    const tenant = tenantRows[0];

    // Vade Tarihleri (İndirim ve Sözleşme Bedeli) - PHP ile aynı
    const vadeler: any = await query(
      `SELECT * 
       FROM fisler
       WHERE kid = ?
         AND fistipi IN ('İndirim', 'Sözleşme Bedeli')
       ORDER BY tarih`,
      [id]
    );
    
    console.log('Vadeler query result:', vadeler); // Debug için

    // Tahsilatlar (para birimi ile)
    const tahsilatlar: any = await query(
      `SELECT *
       FROM fisler
       WHERE kid = ?
         AND fistipi = 'Tahsilat'
       ORDER BY tarih DESC`,
      [id]
    );

    // Toplam hesaplama
    const bakiyesi = Number(tenant.bakiyesi || 0);
    const tahsilat = Number(tenant.tahsilat || 0);
    const kalan = Number(tenant.kalan || 0);

    // Reddiyat (fistipi = 'Reddiyat' veya fistipi='Tahsilat' AND avid=0 AND reddiyatid=0)
    const reddiyat: any = await query(
      `SELECT *
       FROM fisler
       WHERE kid = ?
         AND (fistipi = 'Reddiyat' 
              OR (fistipi = 'Tahsilat' AND avid = 0 AND reddiyatid = 0))
       ORDER BY tarih DESC`,
      [id]
    );

    return Response.json({
      success: true,
      tenant: {
        id: tenant.id,
        adi: tenant.adi,
        tc: tenant.tc,
        telefon: tenant.telefon,
        evadres: tenant.evadres,
        adres: tenant.mulk_adres || tenant.evadres,
        parabirimi: tenant.parabirimi,
        bakiyesi: bakiyesi, // Sözleşme bedeli TOPLAMI
        sozlesmebedeli: Number(tenant.sozlesmebedeli || 0), // Aylık değil, toplam
        tahsilat: tahsilat,
        kalan: kalan,
        kirabaslangic: tenant.kirabaslangic,
        kirabitis: tenant.kirabitis,
        notlar: tenant.notlar,
        mulk_adi: tenant.mulk_adi,
        amaci: tenant.amaci,
        tahliye: tenant.tahliye,
        icralik: tenant.icralik,
      },
      vadeler: vadeler.map((v: any) => ({
        ...v,
        tutar: Number(v.tutar || 0)
      })),
      tahsilatlar: tahsilatlar.map((t: any) => ({
        ...t,
        tutar: Number(t.tutar || 0)
      })),
      summary: {
        total: bakiyesi, // Toplam sözleşme bedeli
        paid: tahsilat,  // Ödenen
        remaining: kalan // Kalan
      },
      reddiyat: reddiyat.map((r: any) => ({
        ...r,
        tutar: Number(r.tutar || 0)
      })),
    });
  } catch (err) {
    console.error(err);
    return Response.json({ success: false, error: "Sunucu hatası" }, { status: 500 });
  }
}

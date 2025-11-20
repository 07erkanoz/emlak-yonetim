import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return Response.json(
        { success: false, error: "Kullanıcı adı ve şifre gerekli" },
        { status: 400 }
      );
    }

    // SQL → gerçek tablonuzdaki alan: username, password
    const rows: any = await query(
      `SELECT id, adi, username, password 
       FROM mulksahibi 
       WHERE username = ? 
         AND password = ? 
       LIMIT 1`,
      [username, password]
    );

    if (!rows || rows.length === 0) {
      return Response.json(
        { success: false, error: "Kullanıcı adı veya şifre hatalı." },
        { status: 401 }
      );
    }

    const user = rows[0];

    return Response.json({
      success: true,
      mulkSahibi: {
        id: user.id,
        adi: user.adi,
        username: user.username,
      },
    });

  } catch (err) {
    console.error("LOGIN API ERROR:", err);
    return Response.json(
      { success: false, error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

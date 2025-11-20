import mysql from "mysql2/promise";

// ----------------------------------------------------------
// 🔐 Bağlantı havuzu (pool) - Geliştirilmiş
// ----------------------------------------------------------
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // MySQL charset
  charset: "utf8mb4",

  // Pool ayarları
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // Maksimum boşta bekleyen bağlantı
  idleTimeout: 60000, // 60 saniye
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,

  // Timeout ayarları
  connectTimeout: 30000, // 30 saniye
});

// ----------------------------------------------------------
// 📌 Tek Query Fonksiyonu - Hata yönetimi iyileştirildi
// ----------------------------------------------------------
export async function query(sql: string, params: any[] = []) {
  let connection;
  try {
    // Pool'dan bağlantı al
    connection = await pool.getConnection();
    
    // Query çalıştır
    const [rows] = await connection.execute(sql, params);
    
    return rows as any[];
  } catch (err: any) {
    console.error("DATABASE QUERY ERROR:", {
      error: err.message,
      code: err.code,
      sqlState: err.sqlState,
      sql: sql.substring(0, 100) + "...",
    });
    throw err;
  } finally {
    // Bağlantıyı mutlaka geri ver
    if (connection) {
      connection.release();
    }
  }
}

// Pool olaylarını dinle (debugging için)
pool.on('connection', (connection) => {
  console.log('MySQL: Yeni bağlantı oluşturuldu');
});

pool.on('acquire', (connection) => {
  console.log('MySQL: Bağlantı alındı');
});

pool.on('release', (connection) => {
  console.log('MySQL: Bağlantı serbest bırakıldı');
});

pool.on('enqueue', () => {
  console.log('MySQL: Bağlantı bekleniyor...');
});
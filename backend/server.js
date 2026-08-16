const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let db;

// Veritabanını başlatma ve tablo oluşturma fonksiyonu
async function initDb() {
  db = await open({
    filename: './aykome.db',
    driver: sqlite3.Database
  });

  // Tablo yoksa otomatik oluşturulur
  await db.exec(`
    CREATE TABLE IF NOT EXISTS basvurular (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kurumAdi TEXT,
      telefon TEXT,
      kaziTuru TEXT,
      aciklama TEXT,
      enlem REAL,
      boylam REAL,
      tarih TEXT,
      durum TEXT DEFAULT 'Onay Bekliyor'
    )
  `);

  console.log('💾 SQLite Veritabanı ve "basvurular" Tablosu Hazır!');
}

initDb();

// 1. BAŞVURU EKLEME ENDPOINT'İ (Veritabanına Veri Yazar)
app.post('/api/basvuru', async (req, res) => {
  try {
    const { kurumAdi, telefon, kaziTuru, aciklama, koordinat, tarih } = req.body;

    const result = await db.run(
      `INSERT INTO basvurular (kurumAdi, telefon, kaziTuru, aciklama, enlem, boylam, tarih)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [kurumAdi, telefon, kaziTuru, aciklama, koordinat.lat, koordinat.lng, tarih]
    );

    console.log(`✅ Başvuru veritabanına kaydedildi! Kayıt ID: ${result.lastID}`);

    res.status(201).json({
      message: 'Başvuru veritabanına başarıyla kaydedildi!',
      kayit: { id: result.lastID, ...req.body }
    });
  } catch (error) {
    console.error('Veritabanı kayıt hatası:', error);
    res.status(500).json({ error: 'Kayıt sırasında sunucu hatası oluştu.' });
  }
});

// 2. TÜM BAŞVURULARI LİSTELEME ENDPOINT'İ (Veritabanından Veri Okur)
app.get('/api/basvuru', async (req, res) => {
  try {
    const basvurular = await db.all('SELECT * FROM basvurular ORDER BY id DESC');
    res.json(basvurular);
  } catch (error) {
    res.status(500).json({ error: 'Veriler veritabanından çekilemedi.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 AYKOME Sunucusu http://localhost:${PORT} adresinde çalışıyor!`);
});
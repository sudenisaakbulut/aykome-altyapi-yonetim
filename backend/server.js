require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@libsql/client');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Turso Bulut SQLite veritabanı bağlantısı
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Tabloyu oluştur (yoksa)
async function initDB() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS basvurular (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kurumAdi TEXT NOT NULL,
        telefon TEXT NOT NULL,
        kaziTuru TEXT NOT NULL,
        enlem REAL NOT NULL,
        boylam REAL NOT NULL,
        aciklama TEXT,
        tarih TEXT,
        durum TEXT DEFAULT 'İnceleniyor'
      )
    `);
    console.log('Turso bulut veritabanına bağlanıldı ve tablo hazır.');
  } catch (err) {
    console.error('Veritabanı başlatma hatası:', err.message);
  }
}

initDB();

// Ana dizin kontrolü
app.get('/', (req, res) => {
  res.send('AYKOME Backend API (Turso Cloud DB) Çalışıyor!');
});

// Tüm başvuruları listele (GET)
app.get('/api/basvuru', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM basvurular ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Yeni başvuru kaydet (POST)
app.post('/api/basvuru', async (req, res) => {
  const { kurumAdi, telefon, kaziTuru, koordinat, aciklama, tarih } = req.body;

  if (!kurumAdi || !telefon || !koordinat) {
    return res.status(400).json({ error: 'Eksik bilgi gönderildi.' });
  }

  const enlem = koordinat.lat;
  const boylam = koordinat.lng;
  const durum = 'İnceleniyor';

  try {
    const result = await db.execute({
      sql: `
        INSERT INTO basvurular (kurumAdi, telefon, kaziTuru, enlem, boylam, aciklama, tarih, durum)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [kurumAdi, telefon, kaziTuru, enlem, boylam, aciklama, tarih, durum],
    });

    res.status(201).json({
      message: 'Kazı başvurusu başarıyla kaydedildi!',
      kayit: {
        id: Number(result.lastInsertRowid),
        kurumAdi,
        telefon,
        kaziTuru,
        enlem,
        boylam,
        aciklama,
        tarih,
        durum,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Başvuru sil (DELETE)
app.delete('/api/basvuru/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.execute({
      sql: 'DELETE FROM basvurular WHERE id = ?',
      args: [id],
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Kayıt bulunamadı.' });
    }

    res.json({ message: 'Başvuru başarıyla silindi.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// SQLite veritabanı bağlantısı
const db = new sqlite3.Database('./aykome.db', (err) => {
  if (err) {
    console.error('Veritabanı bağlantı hatası:', err.message);
  } else {
    console.log('SQLite veritabanına bağlanıldı.');
  }
});

// Tabloyu oluştur (yoksa)
db.run(`
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

// Ana dizin kontrolü
app.get('/', (req, res) => {
  res.send('AYKOME Backend API Çalışıyor!');
});

// Tüm başvuruları listele (GET)
app.get('/api/basvuru', (req, res) => {
  db.all('SELECT * FROM basvurular ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Yeni başvuru kaydet (POST)
app.post('/api/basvuru', (req, res) => {
  const { kurumAdi, telefon, kaziTuru, koordinat, aciklama, tarih } = req.body;

  if (!kurumAdi || !telefon || !koordinat) {
    return res.status(400).json({ error: 'Eksik bilgi gönderildi.' });
  }

  const enlem = koordinat.lat;
  const boylam = koordinat.lng;
  const durum = 'İnceleniyor';

  const sql = `
    INSERT INTO basvurular (kurumAdi, telefon, kaziTuru, enlem, boylam, aciklama, tarih, durum)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [kurumAdi, telefon, kaziTuru, enlem, boylam, aciklama, tarih, durum], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({
      message: 'Kazı başvurusu başarıyla kaydedildi!',
      kayit: {
        id: this.lastID,
        kurumAdi,
        telefon,
        kaziTuru,
        enlem,
        boylam,
        aciklama,
        tarih,
        durum
      }
    });
  });
});
// Başvuru sil (DELETE)
app.delete('/api/basvuru/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM basvurular WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Kayıt bulunamadı.' });
    }
    res.json({ message: 'Başvuru başarıyla silindi.' });
  });
});
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});
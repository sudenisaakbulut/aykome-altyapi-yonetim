# 🗺️ AYKOME - CBS Tabanlı Altyapı ve Kazı İzin Yönetim Portalı

🌐 **Canlı Demo (Live Site):** [https://aykome-frontend.onrender.com](https://aykome-frontend.onrender.com)

> **Not:** Proje ücretsiz sunucu (Render) üzerinde barındırıldığı için ilk açılışta backend sunucusunun uyanması 30-50 saniye sürebilir.

Bu proje; belediyeler, altyapı kuruluşları (İSKİ, Türk Telekom, EDAŞ vb.) ve saha ekipleri arasında altyapı kazı izin süreçlerini koordine etmek için geliştirilmiş bir **Coğrafi Bilgi Sistemi (CBS / GIS)** ve **Full-Stack Web Uygulamasıdır**.

---

## 📸 Ekran Görüntüsü
<img width="850" alt="Ekran Görüntüsü (14)" src="https://github.com/user-attachments/assets/b9a35ac9-874b-41a7-9ffe-c56939918b26" />
<br/><br/>
<img width="850" alt="Ekran Görüntüsü (13)" src="https://github.com/user-attachments/assets/8fcce6ec-030e-45ef-b353-7fd852eb3c4a" />
<br/><br/>
<img width="850" alt="Ekran Görüntüsü (12)" src="https://github.com/user-attachments/assets/575cf7d4-5684-4543-8f63-f0d1ceef5377" />
<br/><br/>
<img width="850" alt="Ekran Görüntüsü (15)" src="https://github.com/user-attachments/assets/20c4b866-1927-4008-b3ac-71f312e7b5e5" />

## 🚀 Özellikler

- **İnteraktif Harita:** Leaflet & OpenStreetMap altyapısı ile harita üzerinden doğrudan enlem/boylam seçimi.
- **Başvuru Yönetimi:** Kurum adı, iletişim bilgisi, kazı türü ve açıklama içeren dinamik başvuru formu.
- **Yönetici Takip Tablosu:** Veritabanındaki tüm başvuruları eşzamanlı listeleyen ve haritada pin olarak görselleştiren takip paneli.
- **Kalıcı Veritabanı:** Başvuruların kaybolmaması için SQLite veritabanı entegrasyonu.

---

## 🛠️ Kullanılan Teknolojiler

- **Frontend:** React (Vite), React-Leaflet, OpenStreetMap, CSS3
- **Backend:** Node.js, Express.js, CORS
- **Veritabanı:** SQLite3
- **Deployment & Versiyon Kontrol:** Render, Git & GitHub

---

## 💻 Kurulum ve Çalıştırma

### 1. Depoyu Klonlayın
```bash
git clone [https://github.com/sudenisaakbulut/aykome-altyapi-yonetim.git](https://github.com/sudenisaakbulut/aykome-altyapi-yonetim.git)
cd aykome-altyapi-yonetim

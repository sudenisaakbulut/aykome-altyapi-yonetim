import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Haritadan yeni nokta seçme bileşeni
function LocationMarker({ onSelectLocation }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelectLocation(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        📍 Yeni Seçilen Konum <br />
        Enlem: {position.lat.toFixed(4)} <br />
        Boylam: {position.lng.toFixed(4)}
      </Popup>
    </Marker>
  );
}

export default function App() {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [basvurular, setBasvurular] = useState([]);
  const [formData, setFormData] = useState({
    kurumAdi: '',
    telefon: '',
    kaziTuru: 'Fiber İnternet',
    aciklama: '',
  });

  // Veritabanındaki başvuruları çeken fonksiyon
  const basvurulariGetir = async () => {
    try {
      const res = await fetch('https://aykome-altyapi-yonetim.onrender.com/api/basvurular');
      const data = await res.json();
      setBasvurular(data);
    } catch (err) {
      console.error('Veri çekme hatası:', err);
    }
  };

  // Sayfa açıldığında verileri otomatik çek
  useEffect(() => {
    basvurulariGetir();
  }, []);

  // Form gönderme işlemi
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPoint) {
      alert('Lütfen haritadan bir kazı konumu seçin!');
      return;
    }

    const yeniBasvuru = {
      ...formData,
      koordinat: selectedPoint,
      tarih: new Date().toLocaleDateString('tr-TR'),
    };

    try {
      const response = await fetch('/api/basvuru', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(yeniBasvuru),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.message}\nKayıt ID: ${data.kayit.id}`);
        setFormData({ kurumAdi: '', telefon: '', kaziTuru: 'Fiber İnternet', aciklama: '' });
        setSelectedPoint(null);
        basvurulariGetir(); // Listeyi ve haritayı anında yenile
      } else {
        alert('❌ Başvuru kaydedilemedi.');
      }
    } catch (error) {
      console.error('Bağlantı hatası:', error);
      alert('❌ Backend sunucusuna ulaşılamadı!');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ borderBottom: '2px solid #007bff', paddingBottom: '10px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, color: '#333' }}>AYKOME - Altyapı Koordinasyon Portalı</h1>
        <p style={{ margin: '5px 0 0', color: '#666' }}>Kazı İzin Başvuruları ve Saha Takip Sistemi</p>
      </header>

      {/* ÜST BÖLÜM: Harita ve Form */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
        {/* Harita */}
        <div style={{ flex: '2', minWidth: '350px' }}>
          <h3>Kazı Haritası (Kayıtlı Noktalar)</h3>
          <MapContainer center={[40.98, 37.90]} zoom={11} style={{ height: '420px', width: '100%', borderRadius: '8px' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Yeni Tıklanan Nokta */}
            <LocationMarker onSelectLocation={(coords) => setSelectedPoint(coords)} />

            {/* Veritabanındaki Kayıtlı Başvuruların İşaretçileri */}
            {basvurular.map((b) => (
              <Marker key={b.id} position={[b.enlem, b.boylam]}>
                <Popup>
                  <strong>{b.kurumAdi}</strong> ({b.kaziTuru})<br />
                  <strong>Durum:</strong> {b.durum}<br />
                  <strong>Açıklama:</strong> {b.aciklama}<br />
                  <strong>Tarih:</strong> {b.tarih}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Form */}
        <div style={{ flex: '1', minWidth: '300px', background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3>Yeni Kazı Başvurusu</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Kurum Adı:</label>
              <input 
                type="text" 
                placeholder="Örn: Türk Telekom, EDAŞ" 
                value={formData.kurumAdi}
                onChange={(e) => setFormData({ ...formData, kurumAdi: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>İletişim Telefonu:</label>
              <input 
                type="tel" 
                placeholder="05XX XXX XX XX" 
                value={formData.telefon}
                onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Kazı Türü:</label>
              <select 
                value={formData.kaziTuru}
                onChange={(e) => setFormData({ ...formData, kaziTuru: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              >
                <option value="Fiber İnternet">Fiber İnternet</option>
                <option value="Su / Kanalizasyon">Su / Kanalizasyon</option>
                <option value="Elektrik Hat">Elektrik Hat</option>
                <option value="Doğalgaz">Doğalgaz</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Seçilen Koordinat:</label>
              <input 
                type="text" 
                readOnly 
                value={selectedPoint ? `${selectedPoint.lat.toFixed(4)}, ${selectedPoint.lng.toFixed(4)}` : 'Haritadan tıklayın'}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', background: '#eee', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Açıklama:</label>
              <textarea 
                rows="2"
                placeholder="Adres veya çalışma detayı..." 
                value={formData.aciklama}
                onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <button 
              type="submit" 
              style={{ 
                padding: '10px', 
                backgroundColor: '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Başvuruyu Kaydet
            </button>
          </form>
        </div>
      </div>

      {/* ALT BÖLÜM: Veritabanı Tablosu */}
      <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px' }}>
        <h3>📋 Veritabanındaki Başvuru Listesi ({basvurular.length} Kayıt)</h3>
        {basvurular.length === 0 ? (
          <p style={{ color: '#888' }}>Henüz kayıtlı başvuru bulunmamaktadır.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '10px' }}>ID</th>
                <th style={{ padding: '10px' }}>Kurum</th>
                <th style={{ padding: '10px' }}>Tür</th>
                <th style={{ padding: '10px' }}>Telefon</th>
                <th style={{ padding: '10px' }}>Koordinat</th>
                <th style={{ padding: '10px' }}>Tarih</th>
                <th style={{ padding: '10px' }}>Durum</th>
              </tr>
            </thead>
            <tbody>
              {basvurular.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px' }}>#{b.id}</td>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{b.kurumAdi}</td>
                  <td style={{ padding: '10px' }}>{b.kaziTuru}</td>
                  <td style={{ padding: '10px' }}>{b.telefon}</td>
                  <td style={{ padding: '10px', fontSize: '12px' }}>{b.enlem?.toFixed(4)}, {b.boylam?.toFixed(4)}</td>
                  <td style={{ padding: '10px' }}>{b.tarih}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ 
                      backgroundColor: '#fff3cd', 
                      color: '#856404', 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {b.durum}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
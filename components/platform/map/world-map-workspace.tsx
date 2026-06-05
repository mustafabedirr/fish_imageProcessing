"use client";

import {
  Anchor,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CloudRain,
  Expand,
  Filter,
  Fish,
  Layers,
  Leaf,
  MapPin,
  Minus,
  Play,
  Plus,
  Search,
  Shield,
  Star,
  Thermometer,
  Waves,
  Wind,
} from "lucide-react";

const layerItems = [
  { icon: Fish, title: "Balık Yoğunluğu", low: "Düşük", high: "Yüksek", active: true, tone: "blue" },
  { icon: Thermometer, title: "Su Sıcaklığı", low: "Soğuk", high: "Sıcak", active: true, tone: "heat" },
  { icon: Leaf, title: "Klorofil Seviyesi", low: "Düşük", high: "Yüksek", active: false, tone: "green" },
  { icon: Waves, title: "Akıntı Yönü", low: "Yön & Hız", high: "", active: true, tone: "blue" },
  { icon: Shield, title: "Koruma Alanları", low: "Resmi Bölgeler", high: "", active: true, tone: "green" },
  { icon: Anchor, title: "Limanlar", low: "Liman & İskele", high: "", active: false, tone: "muted" },
  { icon: CloudRain, title: "Hava Durumu", low: "Rüzgar & Yağış", high: "", active: false, tone: "muted" },
];

const observations = [
  {
    name: "Levrek",
    latin: "Dicentrarchus labrax",
    time: "Bugün 14:32",
    score: "%95.4",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=180&q=80",
  },
  {
    name: "Çipura",
    latin: "Sparus aurata",
    time: "Bugün 10:15",
    score: "%92.1",
    image: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=180&q=80",
  },
  {
    name: "Palamut",
    latin: "Sarda sarda",
    time: "Dün 18:45",
    score: "%91.3",
    image: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=180&q=80",
  },
];

const mapMetrics = [
  { icon: Thermometer, label: "Su Sıcaklığı", value: "18.6 °C" },
  { icon: Wind, label: "Rüzgar", value: "12 kn" },
  { icon: Waves, label: "Dalga Yüksekliği", value: "0.3 m" },
];

export default function WorldMapWorkspace() {
  return (
    <section className="aqua-map-workspace">
      <div className="aqua-map-screen">
        <header className="aqua-map-header">
          <div>
            <h1>Harita</h1>
            <p>Bölgeleri keşfedin, verileri görüntüleyin ve analiz edin.</p>
          </div>

          <div className="aqua-map-actions">
            <label className="aqua-map-search">
              <Search size={18} />
              <input type="search" placeholder="Konum, bölge veya koordinat ara..." />
              <span>⌘ K</span>
            </label>
            <button type="button">
              <Filter size={18} />
              Filtreler
            </button>
            <button type="button" className="aqua-map-icon-button" aria-label="Bildirimler">
              <Bell size={18} />
              <b>3</b>
            </button>
            <button type="button">
              <Layers size={18} />
              Veri Katmanları
            </button>
            <button type="button" className="aqua-map-icon-button" aria-label="Tam ekran">
              <Expand size={18} />
            </button>
          </div>
        </header>

        <div className="aqua-map-content">
          <aside className="aqua-layer-panel">
            <div className="aqua-panel-title">
              <h2>Veri Katmanları</h2>
              <button type="button" aria-label="Katman panelini kapat">×</button>
            </div>

            <div className="aqua-layer-list">
              {layerItems.map((item) => {
                const Icon = item.icon;
                return (
                  <article className="aqua-layer-row" key={item.title}>
                    <div className="aqua-layer-row-head">
                      <span className={`aqua-layer-icon aqua-layer-icon--${item.tone}`}>
                        <Icon size={17} />
                      </span>
                      <strong>{item.title}</strong>
                      <span className={item.active ? "aqua-layer-check is-active" : "aqua-layer-check"}>
                        {item.active ? <Check size={14} /> : null}
                      </span>
                    </div>
                    <div className={`aqua-layer-meter aqua-layer-meter--${item.tone}`} />
                    <div className="aqua-layer-scale">
                      <span>{item.low}</span>
                      <span>{item.high}</span>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="aqua-map-view-controls">
              <h3>Harita Görünümü</h3>
              <div>
                <button type="button" className="is-selected">
                  Standart
                </button>
                <button type="button">Uydu</button>
                <button type="button">Koyu</button>
              </div>
            </div>

            <label className="aqua-map-date">
              <span>Zaman Aralığı</span>
              <button type="button">
                12 Mayıs - 18 Mayıs 2024
                <CalendarDays size={16} />
              </button>
            </label>

            <button type="button" className="aqua-manage-layers">
              Katmanları Yönet
            </button>
          </aside>

          <main className="aqua-map-stage">
            <section className="aqua-map-viewport">
              <div className="aqua-map-metric-strip">
                {mapMetrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <article key={metric.label}>
                      <Icon size={19} />
                      <strong>{metric.value}</strong>
                      <span>{metric.label}</span>
                    </article>
                  );
                })}
              </div>

              <div className="aqua-map-canvas-v2" aria-label="Ege Denizi veri haritası">
                <span className="aqua-country aqua-country--greece">YUNANİSTAN</span>
                <span className="aqua-country aqua-country--turkey">TÜRKİYE</span>
                <span className="aqua-sea aqua-sea--aegean">Ege Denizi</span>
                <span className="aqua-sea aqua-sea--med">Akdeniz</span>
                <span className="aqua-city aqua-city--izmir">İzmir</span>
                <span className="aqua-city aqua-city--kusadasi">Kuşadası</span>
                <span className="aqua-city aqua-city--bodrum">Bodrum</span>
                <span className="aqua-city aqua-city--rhodes">Rodos</span>
                <span className="aqua-city aqua-city--crete">Girit</span>

                {Array.from({ length: 18 }).map((_, index) => (
                  <i key={`current-${index}`} className={`aqua-current aqua-current--${index + 1}`} />
                ))}
                {["a", "b", "c", "d", "e", "f", "g", "h"].map((id) => (
                  <i key={id} className={`aqua-hotspot aqua-hotspot--${id}`} />
                ))}
                {["one", "two", "three", "four"].map((id) => (
                  <i key={id} className={`aqua-protected aqua-protected--${id}`} />
                ))}
                {["one", "two", "three", "four"].map((id) => (
                  <span key={id} className={`aqua-port aqua-port--${id}`}>
                    <Anchor size={14} />
                  </span>
                ))}
              </div>

              <div className="aqua-map-zoom">
                <button type="button" aria-label="Yakınlaştır">
                  <Plus size={18} />
                </button>
                <button type="button" aria-label="Uzaklaştır">
                  <Minus size={18} />
                </button>
                <button type="button" aria-label="Konuma git">
                  <MapPin size={18} />
                </button>
                <button type="button" aria-label="Katmanlar">
                  <Layers size={18} />
                </button>
              </div>

              <div className="aqua-map-scale-v2">
                <span>50 km</span>
              </div>

              <div className="aqua-map-timeline">
                <button type="button" aria-label="Zaman çizelgesini oynat">
                  <Play size={18} />
                </button>
                <div className="aqua-timeline-track">
                  {["12 May", "13 May", "14 May", "15 May", "16 May", "17 May", "18 May"].map((day) => (
                    <span key={day} className={day === "16 May" ? "is-active" : ""}>
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          </main>

          <aside className="aqua-region-panel">
            <section className="aqua-region-card">
              <div className="aqua-region-title">
                <span>Seçili Bölge</span>
                <Star size={18} />
              </div>
              <h2>Kuzey Ege Bölgesi</h2>
              <p>39.2326° N, 26.4412° E</p>
              <div className="aqua-region-preview">
                <span />
              </div>

              <nav className="aqua-region-tabs" aria-label="Bölge detay sekmeleri">
                <button type="button" className="is-active">
                  Özet
                </button>
                <button type="button">Canlı Veriler</button>
                <button type="button">Analiz</button>
                <button type="button">Notlar</button>
              </nav>

              <div className="aqua-region-metrics">
                <article>
                  <span>Balık Yoğunluğu</span>
                  <strong>Yüksek</strong>
                  <small>%78</small>
                </article>
                <article>
                  <span>Su Sıcaklığı</span>
                  <strong>18.6 °C</strong>
                </article>
                <article>
                  <span>Klorofil Seviyesi</span>
                  <strong>Orta</strong>
                  <small>3.2 mg/m³</small>
                </article>
                <article>
                  <span>Akıntı Hızı</span>
                  <strong>0.8 m/s</strong>
                </article>
                <article>
                  <span>Dalga Yüksekliği</span>
                  <strong>0.3 m</strong>
                </article>
                <article>
                  <span>Rüzgar Hızı</span>
                  <strong>12 kn</strong>
                </article>
              </div>
            </section>

            <section className="aqua-observation-card">
              <div className="aqua-observation-head">
                <h2>Son Gözlemler</h2>
                <a href="/platform/analyze">Tümünü Gör</a>
              </div>
              <div className="aqua-observation-list">
                {observations.map((item) => (
                  <article key={item.name}>
                    <img src={item.image} alt="" />
                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.latin}</span>
                      <small>{item.time}</small>
                    </div>
                    <b>{item.score}</b>
                    <ChevronRight size={18} />
                  </article>
                ))}
              </div>
              <a className="aqua-map-analysis-link" href="/platform/analyze">
                Detaylı Analize Git
                <ChevronRight size={18} />
              </a>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}

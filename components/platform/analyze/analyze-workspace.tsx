"use client";

import type { ElementType } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bot,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  Download,
  Droplets,
  FileText,
  Fish,
  MapPin,
  Maximize2,
  MoreVertical,
  Ruler,
  Share2,
  Sparkles,
  Target,
  Upload,
  Waves,
} from "lucide-react";

const thumbnails = [
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=220&q=80",
  "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=220&q=80",
  "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=220&q=80",
  "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=220&q=80",
];

const scoreRows = [
  { label: "Saglik Durumu", value: 96, icon: Droplets, tone: "green" },
  { label: "Habitat Uygunlugu", value: 94, icon: MapPin, tone: "green" },
  { label: "Gorsel Kalite", value: 93, icon: Camera, tone: "purple" },
  { label: "Tur Dogruluk Skoru", value: 97, icon: Target, tone: "blue" },
];

const measurements = [
  ["A", "Toplam Boy", "42.3 cm"],
  ["B", "Standart Boy", "37.8 cm"],
  ["C", "Catal Boy", "41.1 cm"],
  ["D", "Vucut Yuksekligi", "11.2 cm"],
  ["E", "Bas Uzunlugu", "9.8 cm"],
  ["F", "Goz Capi", "1.8 cm"],
];

const alternatives = [
  ["Cupra", "Sparus aurata", "%3.2"],
  ["Palamut", "Sarda sarda", "%1.1"],
  ["Kefal", "Mugil cephalus", "%0.3"],
];

const reportItems = [
  "Su sicakligi ideal aralikta.",
  "Besin kaynaklari yeterli.",
  "Kirlilik seviyesi dusuk.",
  "Populasyon durumu stabil.",
];

export default function AnalyzeWorkspace() {
  return (
    <section className="fish-analyze-page">
      <header className="fish-analyze-topbar">
        <div>
          <h1>Balik Analizi</h1>
          <p>Gorsel yukleyin, analiz edin ve detayli sonuclari kesfedin.</p>
        </div>

        <div className="fish-analyze-actions">
          <button type="button" className="fish-action-primary">
            <Upload size={17} />
            Yeni Analiz
          </button>
          <button type="button">
            <FileText size={17} />
            Rapor Olustur
          </button>
          <button type="button" aria-label="Paylas">
            <Share2 size={17} />
          </button>
          <button type="button" aria-label="Indir">
            <Download size={17} />
          </button>
          <button type="button" aria-label="Daha fazla">
            <MoreVertical size={17} />
          </button>
        </div>
      </header>

      <div className="fish-analyze-flow">
        {["Gorsel Yukleme", "AI Analiz", "Sonuclar"].map((step, index) => (
          <div className="fish-flow-step" key={step}>
            <span>{index + 1}</span>
            <div>
              <strong>{step}</strong>
              <small>Tamamlandi <CheckCircle2 size={13} /></small>
            </div>
          </div>
        ))}
      </div>

      <main className="fish-analyze-layout">
        <section className="fish-analyze-main">
          <div className="fish-hero-card">
            <article className="fish-image-stage">
              <span className="fish-stage-chip">Orijinal</span>
              <img src="/login-fish-scene.png" alt="Analiz edilen balik" />
              <button type="button" className="fish-stage-nav fish-stage-nav--left" aria-label="Onceki">
                <ArrowLeft size={18} />
              </button>
              <button type="button" className="fish-stage-nav fish-stage-nav--right" aria-label="Sonraki">
                <ArrowRight size={18} />
              </button>
              <button type="button" className="fish-stage-expand" aria-label="Gorseli genislet">
                <Maximize2 size={17} />
              </button>
              <div className="fish-thumbs">
                {thumbnails.map((image, index) => (
                  <button className={index === 0 ? "fish-thumb fish-thumb--active" : "fish-thumb"} type="button" key={image}>
                    <img src={image} alt="" />
                  </button>
                ))}
                <button className="fish-thumb fish-thumb-more" type="button">+3</button>
              </div>
            </article>

            <article className="fish-score-card">
              <div className="fish-score-head">
                <h2>Genel Analiz Skoru</h2>
                <span>i</span>
              </div>
              <div className="fish-score-body">
                <div className="fish-score-gauge">
                  <div>
                    <strong>95.4</strong>
                    <span>Cok Yuksek</span>
                  </div>
                </div>
                <div className="fish-score-copy">
                  <p>Bu baligin saglik, habitat ve tur ozellikleri cok iyi durumda.</p>
                  <div className="fish-score-list">
                    {scoreRows.map((row) => {
                      const Icon = row.icon;
                      return (
                        <div className="fish-score-row" key={row.label}>
                          <Icon size={16} />
                          <span>{row.label}</span>
                          <strong>{row.value} / 100</strong>
                          <i><b style={{ width: `${row.value}%` }} /></i>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="fish-meta-grid">
                <Metric icon={Target} label="Analiz ID" value="AAS-2024-0518-1247" />
                <Metric icon={CalendarDays} label="Analiz Tarihi" value="18 Mayis 2024 - 14:32" />
                <Metric icon={BarChart3} label="Analiz Suresi" value="2.34 saniye" />
                <Metric icon={Sparkles} label="Model" value="AquaScope AI v2.4" />
              </div>
            </article>
          </div>

          <nav className="fish-tabs" aria-label="Analiz detaylari">
            {["Detayli Analiz", "Olcumler", "Habitat & Cevre", "Saglik Raporu"].map((tab, index) => (
              <button className={index === 0 ? "fish-tab fish-tab--active" : "fish-tab"} type="button" key={tab}>{tab}</button>
            ))}
          </nav>

          <section className="fish-detail-grid">
            <article className="fish-panel fish-measure-panel">
              <h2>Morfometrik Olcumler</h2>
              <div className="fish-measure-body">
                <div className="fish-silhouette">
                  <Fish size={210} />
                  {["A", "B", "C", "D", "E", "F"].map((label, index) => (
                    <span className={`fish-measure-dot fish-measure-dot--${index}`} key={label}>{label}</span>
                  ))}
                </div>
                <ul>
                  {measurements.map(([key, label, value]) => (
                    <li key={key}><b>{key}</b><span>{label}</span><strong>{value}</strong></li>
                  ))}
                </ul>
              </div>
              <p className="fish-panel-note">Olcumler tahmini degerlerdir ve +- %3 hata payi icerebilir.</p>
            </article>

            <article className="fish-panel fish-color-panel">
              <h2>Renk Analizi</h2>
              <div className="fish-color-body">
                <div className="fish-donut" />
                <ul>
                  {["Gumus %48", "Mavi-Gri %26", "Beyaz %15", "Koyu Gri %8", "Diger %3"].map((item) => (
                    <li key={item}><span />{item}</li>
                  ))}
                </ul>
              </div>
            </article>

            <article className="fish-panel fish-bars-panel">
              <h2>Boy Dagilimi</h2>
              <div className="fish-bars">
                {[12, 28, 52, 82, 61, 34, 18].map((height, index) => (
                  <span className={index === 3 ? "fish-bar fish-bar--active" : "fish-bar"} style={{ height: `${height}%` }} key={index} />
                ))}
              </div>
              <div className="fish-bar-labels">
                {["0-10", "10-20", "20-30", "30-40", "40-50", "50-60", "60+"].map((label) => <span key={label}>{label}</span>)}
              </div>
              <p>Ortalama Boy: 38.7 cm</p>
            </article>

            <article className="fish-panel fish-location-panel">
              <h2>Konum Bilgisi</h2>
              <div className="fish-location-map">
                <div className="fish-location-pin">
                  <MapPin size={18} />
                  <strong>Karadeniz, Sinop Aciklari</strong>
                  <span>41.887 N, 34.868 E</span>
                </div>
              </div>
              <div className="fish-env-grid">
                <Env icon={Droplets} label="Su Sicakligi" value="16.8 C" />
                <Env icon={Waves} label="Tuzluluk" value="18.6 PSU" />
                <Env icon={Ruler} label="pH Degeri" value="8.1" />
                <Env icon={Droplets} label="Oksijen" value="8.2 mg/L" />
                <div className="fish-habitat-score">
                  <span>Habitat Uygunlugu</span>
                  <strong>Cok Uygun</strong>
                  <i><b /></i>
                  <small>94 / 100</small>
                </div>
              </div>
            </article>
          </section>
        </section>

        <aside className="fish-analyze-rail">
          <article className="fish-panel fish-species-card">
            <div className="fish-rail-head">
              <h2>Tespit Edilen Tur</h2>
              <span>Birincil Eslesme</span>
            </div>
            <div className="fish-species-main">
              <img src={thumbnails[0]} alt="" />
              <div>
                <strong>Levrek</strong>
                <small>Dicentrarchus labrax</small>
                <em>%95.4 Guven</em>
              </div>
            </div>
            <p>Akdeniz ve Karadeniz'de yaygin olarak gorulen bir balik turudur.</p>
            <button type="button">Tur Detayina Git <ChevronRight size={17} /></button>

            <h3>Alternatif Eslesmeler</h3>
            <div className="fish-alt-list">
              {alternatives.map(([name, latin, score], index) => (
                <div className="fish-alt-row" key={name}>
                  <img src={thumbnails[index + 1]} alt="" />
                  <span><strong>{name}</strong><small>{latin}</small></span>
                  <b>{score}</b>
                </div>
              ))}
            </div>
            <button type="button">Tum Turleri Gor <ChevronRight size={17} /></button>
          </article>

          <article className="fish-panel fish-ai-card">
            <div className="fish-ai-title">
              <Bot size={22} />
              <h2>AI Yorum & Oneriler</h2>
            </div>
            <p>Bu balik saglikli gorunuyor ve yasadigi ortam uygun.</p>
            <ul>
              {reportItems.map((item) => (
                <li key={item}><CheckCircle2 size={16} />{item}</li>
              ))}
            </ul>
            <button type="button">Daha Fazla Oneri Gor <ChevronRight size={17} /></button>
          </article>
        </aside>
      </main>
    </section>
  );
}

function Metric({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return (
    <div className="fish-meta-item">
      <Icon size={16} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Env({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return (
    <div className="fish-env-item">
      <Icon size={16} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

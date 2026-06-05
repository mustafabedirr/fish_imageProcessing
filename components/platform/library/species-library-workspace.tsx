"use client";

import type { ReactNode } from "react";
import {
  AlertTriangle,
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Fish,
  Grid2X2,
  Hash,
  Heart,
  Layers,
  List,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  TrendingUp,
  Waves,
} from "lucide-react";
import PlatformUtilityBar from "../shell/platform-utility-bar";

const speciesCards = [
  {
    name: "Levrek",
    latin: "Dicentrarchus labrax",
    tags: ["Deniz", "Etçil"],
    score: "%95.4",
    records: "1,254 kayıt",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80",
    favorite: false,
  },
  {
    name: "Çipura",
    latin: "Sparus aurata",
    tags: ["Deniz", "Otçul"],
    score: "%92.1",
    records: "1,032 kayıt",
    image: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=900&q=80",
    favorite: true,
  },
  {
    name: "Palamut",
    latin: "Sarda sarda",
    tags: ["Deniz", "Etçil"],
    score: "%91.3",
    records: "876 kayıt",
    image: "https://images.unsplash.com/photo-1560275619-4662e36fa65c?auto=format&fit=crop&w=900&q=80",
    favorite: true,
  },
  {
    name: "Kefal",
    latin: "Mugil cephalus",
    tags: ["Deniz / Acısu", "Otçul"],
    score: "%90.3",
    records: "754 kayıt",
    image: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=900&q=80",
    favorite: true,
  },
  {
    name: "Sardalya",
    latin: "Sardina pilchardus",
    tags: ["Deniz", "Otçul"],
    score: "%89.7",
    records: "689 kayıt",
    image: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=900&q=80",
    favorite: false,
  },
  {
    name: "Kalkan",
    latin: "Scophthalmus maximus",
    tags: ["Deniz", "Dip Balığı"],
    score: "%88.6",
    records: "612 kayıt",
    image: "https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=900&q=80",
    favorite: true,
  },
];

const popularSpecies = [
  { name: "Levrek", score: "%95.4", image: speciesCards[0].image },
  { name: "Çipura", score: "%92.1", image: speciesCards[1].image },
  { name: "Palamut", score: "%91.3", image: speciesCards[2].image },
  { name: "Kefal", score: "%90.3", image: speciesCards[3].image },
  { name: "Sardalya", score: "%89.7", image: speciesCards[4].image },
];

const summaryItems = [
  { label: "Toplam Tür", value: "128", icon: Fish, tone: "cyan" },
  { label: "Aile", value: "45", icon: Layers, tone: "blue" },
  { label: "Yaşam Alanı", value: "8", icon: Waves, tone: "white" },
  { label: "Tehlike Altında", value: "4", icon: AlertTriangle, tone: "yellow" },
];

const tags = ["Deniz", "Tatlı Su", "Acı Su", "Etçil", "Otçul", "Dip Balığı", "Sürünen", "Pelajik", "Nesli Tehlikede", "Koruma Altında"];

export default function SpeciesLibraryWorkspace() {
  return (
    <section className="fish-library-page">
      <PlatformUtilityBar />

      <div className="fish-library-shell">
        <header className="fish-library-header">
          <div className="fish-library-title">
            <h1>Tür Kütüphanesi</h1>
            <p>Çeşitli balık türlerinin detaylarını görüntüleyin ve yönetin.</p>
          </div>

          <div className="fish-library-actions">
            <label className="fish-library-search">
              <Search size={18} />
              <input type="search" placeholder="Tür, bilimsel ad veya anahtar kelime ara..." />
              <span>⌘ K</span>
            </label>
            <button type="button" className="fish-library-action">
              <SlidersHorizontal size={18} />
              Filtreleri Gizle
            </button>
            <div className="fish-library-view-toggle" aria-label="Görünüm seçimi">
              <button type="button" className="is-active" aria-label="Grid görünümü">
                <Grid2X2 size={18} />
              </button>
              <button type="button" aria-label="Liste görünümü">
                <List size={18} />
              </button>
            </div>
            <button type="button" className="fish-library-primary">
              <Plus size={18} />
              Yeni Tür Ekle
            </button>
          </div>
        </header>

        <div className="fish-library-layout">
          <main className="fish-library-main">
            <section className="fish-library-filter-panel" aria-label="Tür filtreleri">
              <LibrarySelect label="Tür Grubu" value="Tümü" />
              <LibrarySelect label="Yaşam Alanı" value="Tümü" />
              <LibrarySelect label="Dağılım Bölgesi" value="Tümü" />
              <LibrarySelect label="Koruma Durumu" value="Tümü" />
              <LibrarySelect label="Sırala" value="Popülerlik" icon={<SlidersHorizontal size={16} />} />
            </section>

            <div className="fish-library-result-row">
              <span>128 tür bulundu</span>
              <button type="button">Temizle</button>
            </div>

            <section className="fish-library-grid" aria-label="Balık türleri">
              {speciesCards.map((fish) => (
                <article className="fish-library-card" key={fish.name}>
                  <img src={fish.image} alt="" />
                  <button type="button" className="fish-library-favorite" aria-label={`${fish.name} favori`}>
                    <Star size={18} fill={fish.favorite ? "currentColor" : "none"} />
                  </button>
                  <div className="fish-library-card-shade" />
                  <div className="fish-library-card-copy">
                    <h2>{fish.name}</h2>
                    <p>{fish.latin}</p>
                    <div className="fish-library-card-tags">
                      {fish.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <footer>
                    <strong>
                      {fish.score} Uygunluk
                      <TrendingUp size={14} />
                    </strong>
                    <span>{fish.records}</span>
                  </footer>
                </article>
              ))}
            </section>

            <nav className="fish-library-pagination" aria-label="Sayfalama">
              <button type="button" aria-label="Önceki sayfa">
                <ChevronLeft size={18} />
              </button>
              {[1, 2, 3, 4, 5].map((page) => (
                <button key={page} type="button" className={page === 1 ? "is-active" : ""}>
                  {page}
                </button>
              ))}
              <span>...</span>
              <button type="button">13</button>
              <button type="button" aria-label="Sonraki sayfa">
                <ChevronRight size={18} />
              </button>
            </nav>
          </main>

          <aside className="fish-library-side">
            <section className="fish-library-panel">
              <div className="fish-library-panel-head">
                <h2>Kütüphane Özeti</h2>
                <a href="/platform/analyze">Detaylı Rapor</a>
              </div>
              <div className="fish-library-summary">
                {summaryItems.map(({ icon: Icon, label, value, tone }) => (
                  <article key={label}>
                    <span className={`fish-library-summary-icon fish-library-summary-icon--${tone}`}>
                      <Icon size={19} />
                    </span>
                    <div>
                      <strong>{value}</strong>
                      <small>{label}</small>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="fish-library-panel">
              <div className="fish-library-panel-head">
                <h2>Popüler Türler</h2>
                <a href="/platform/library">Tümünü Gör</a>
              </div>
              <div className="fish-library-popular">
                {popularSpecies.map((item, index) => (
                  <article key={item.name}>
                    <img src={item.image} alt="" />
                    <b>{index + 1}</b>
                    <strong>{item.name}</strong>
                    <span>{item.score}</span>
                    <TrendingUp size={15} />
                  </article>
                ))}
              </div>
            </section>

            <section className="fish-library-panel">
              <h2>Tür Etiketleri</h2>
              <div className="fish-library-tags">
                {tags.map((tag) => (
                  <button type="button" key={tag}>
                    {tag}
                  </button>
                ))}
              </div>
            </section>

            <section className="fish-library-panel">
              <h2>Hızlı Erişim</h2>
              <div className="fish-library-shortcuts">
                <a href="/platform/library">
                  <Star size={17} />
                  Favori Türlerim
                </a>
                <a href="/platform/library">
                  <Hash size={17} />
                  Son Görüntülenenler
                </a>
                <a href="/platform/analyze">
                  <BarChart3 size={17} />
                  Karşılaştırma Aracı
                </a>
                <a href="/platform/library">
                  <Heart size={17} />
                  Tür Ekle / Düzenle
                </a>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}

function LibrarySelect({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <label className="fish-library-select">
      <span>{label}</span>
      <button type="button">
        {value}
        {icon ?? <ChevronDown size={16} />}
      </button>
    </label>
  );
}

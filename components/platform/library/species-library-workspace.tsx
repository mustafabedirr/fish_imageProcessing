"use client";

import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Fish,
  Grid2X2,
  List,
  Plus,
  Search,
  Shield,
  SlidersHorizontal,
  Star,
  TrendingUp,
  Waves,
  X,
} from "lucide-react";

type FishSpecies = {
  id: string;
  name: string;
  latin: string;
  group: string;
  habitat: string;
  region: string;
  protection: string;
  tags: string[];
  score: number;
  records: number;
  image: string;
  favorite: boolean;
};

const initialSpeciesCards: FishSpecies[] = [
  {
    id: "levrek",
    name: "Levrek",
    latin: "Dicentrarchus labrax",
    group: "Etcil",
    habitat: "Deniz",
    region: "Akdeniz",
    protection: "Guvenli",
    tags: ["Deniz", "Etcil"],
    score: 95.4,
    records: 1254,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80",
    favorite: false,
  },
  {
    id: "cipura",
    name: "Cipura",
    latin: "Sparus aurata",
    group: "Otcul",
    habitat: "Deniz",
    region: "Ege",
    protection: "Guvenli",
    tags: ["Deniz", "Otcul"],
    score: 92.1,
    records: 1032,
    image: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=900&q=80",
    favorite: true,
  },
  {
    id: "palamut",
    name: "Palamut",
    latin: "Sarda sarda",
    group: "Etçil",
    habitat: "Deniz",
    region: "Karadeniz",
    protection: "Güvenli",
    tags: ["Deniz", "Etçil", "Pelajik"],
    score: 91.3,
    records: 876,
    image: "https://images.unsplash.com/photo-1560275619-4662e36fa65c?auto=format&fit=crop&w=900&q=80",
    favorite: true,
  },
  {
    id: "kefal",
    name: "Kefal",
    latin: "Mugil cephalus",
    group: "Otçul",
    habitat: "Acı Su",
    region: "Ege",
    protection: "Güvenli",
    tags: ["Deniz / Acı su", "OtÇul"],
    score: 90.3,
    records: 754,
    image: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=900&q=80",
    favorite: true,
  },
  {
    id: "sardalya",
    name: "Sardalya",
    latin: "Sardina pilchardus",
    group: "OtÇul",
    habitat: "Deniz",
    region: "Akdeniz",
    protection: "GÜvenli",
    tags: ["Deniz", "Otçul", "Pelajik"],
    score: 89.7,
    records: 689,
    image: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=900&q=80",
    favorite: false,
  },
  {
    id: "kalkan",
    name: "Kalkan",
    latin: "Scophthalmus maximus",
    group: "Dip Balığı",
    habitat: "Deniz",
    region: "Karadeniz",
    protection: "Koruma Altında",
    tags: ["Deniz", "Dip Balığı", "Koruma Altında"],
    score: 88.6,
    records: 612,
    image: "https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=900&q=80",
    favorite: true,
  },
  {
    id: "barbun",
    name: "Barbun",
    latin: "Mullus barbatus",
    group: "Etçil",
    habitat: "Deniz",
    region: "Ege",
    protection: "Güvenli",
    tags: ["Deniz", "Etçil"],
    score: 88.1,
    records: 574,
    image: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=900&q=80",
    favorite: false,
  },
  {
    id: "mersin",
    name: "Lufer",
    latin: "Pomatomus saltatrix",
    group: "Etçil",
    habitat: "Deniz",
    region: "Karadeniz",
    protection: "Güvenli",
    tags: ["Deniz", "Etçil", "Pelajik"],
    score: 87.6,
    records: 543,
    image: "https://images.unsplash.com/photo-1560275619-4662e36fa65c?auto=format&fit=crop&w=900&q=80",
    favorite: false,
  },
  {
    id: "istavrit",
    name: "Istavrit",
    latin: "Trachurus trachurus",
    group: "Etçil",
    habitat: "Deniz",
    region: "Karadeniz",
    protection: "Güvenli",
    tags: ["Deniz", "Pelajik"],
    score: 86.9,
    records: 498,
    image: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=900&q=80",
    favorite: false,
  },
  {
    id: "turna",
    name: "Turna",
    latin: "Esox lucius",
    group: "Etçil",
    habitat: "Tatlı Su",
    region: "İç Anadolu",
    protection: "Güvenli",
    tags: ["Tatlı Su", "Etçil"],
    score: 84.8,
    records: 421,
    image: "https://images.unsplash.com/photo-1573925788206-7f8f0df1987e?auto=format&fit=crop&w=900&q=80",
    favorite: false,
  },
  {
    id: "mersin-baligi",
    name: "Mersin Balığı",
    latin: "Acipenser sturio",
    group: "Dip Balığı",
    habitat: "Acı Su",
    region: "Karadeniz",
    protection: "Nesli Tehlikede",
    tags: ["Acı su", "Dip Balığı", "Nesli Tehlikede"],
    score: 83.4,
    records: 288,
    image: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=900&q=80",
    favorite: false,
  },
  {
    id: "minekop",
    name: "Minekop",
    latin: "Umbrina cirrosa",
    group: "Dip Balığı",
    habitat: "Deniz",
    region: "Akdeniz",
    protection: "Güvenli",
    tags: ["Deniz", "Dip Balığı"],
    score: 82.6,
    records: 251,
    image: "https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=900&q=80",
    favorite: false,
  },
  {
    id: "uskumru",
    name: "Uskumru",
    latin: "Scomber scombrus",
    group: "Etçil",
    habitat: "Deniz",
    region: "Karadeniz",
    protection: "Güvenli",
    tags: ["Deniz", "Pelajik"],
    score: 81.8,
    records: 238,
    image: "https://images.unsplash.com/photo-1560275619-4662e36fa65c?auto=format&fit=crop&w=900&q=80",
    favorite: false,
  },
  {
    id: "sazan",
    name: "Sazan",
    latin: "Cyprinus carpio",
    group: "Otçul",
    habitat: "Tatlı Su",
    region: "İç Anadolu",
    protection: "Güvenli",
    tags: ["Tatlı Su", "Otçul"],
    score: 80.9,
    records: 214,
    image: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=900&q=80",
    favorite: false,
  },
  {
    id: "hamsi",
    name: "Hamsi",
    latin: "Engraulis encrasicolus",
    group: "Otçul",
    habitat: "Deniz",
    region: "Karadeniz",
    protection: "Güvenli",
    tags: ["Deniz", "Pelajik"],
    score: 80.1,
    records: 196,
    image: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=900&q=80",
    favorite: false,
  },
  {
    id: "alabalik",
    name: "Alabalik",
    latin: "Oncorhynchus mykiss",
    group: "Etçil",
    habitat: "Tatlı Su",
    region: "İç Anadolu",
    protection: "Güvenli",
    tags: ["Tatlı Su", "Etçil"],
    score: 79.6,
    records: 183,
    image: "https://images.unsplash.com/photo-1573925788206-7f8f0df1987e?auto=format&fit=crop&w=900&q=80",
    favorite: false,
  },
  {
    id: "mercan",
    name: "Mercan",
    latin: "Pagellus erythrinus",
    group: "Etcil",
    habitat: "Deniz",
    region: "Ege",
    protection: "Guvenli",
    tags: ["Deniz", "Orta Boy"],
    score: 88.4,
    records: 452,
    image: "https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=900&q=80",
    favorite: false,
  },
  {
    id: "dil-baligi",
    name: "Dil Baligi",
    latin: "Solea solea",
    group: "Dip Baligi",
    habitat: "Deniz",
    region: "Akdeniz",
    protection: "Guvenli",
    tags: ["Deniz", "Dip Baligi"],
    score: 86.7,
    records: 336,
    image: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=900&q=80",
    favorite: false,
  },
  {
    id: "mezgit",
    name: "Mezgit",
    latin: "Merlangius merlangus",
    group: "Etcil",
    habitat: "Deniz",
    region: "Karadeniz",
    protection: "Guvenli",
    tags: ["Deniz", "Kucuk Boy"],
    score: 85.9,
    records: 389,
    image: "https://images.unsplash.com/photo-1560275619-4662e36fa65c?auto=format&fit=crop&w=900&q=80",
    favorite: false,
  },
  {
    id: "karagoz",
    name: "Karagoz",
    latin: "Diplodus vulgaris",
    group: "Etcil",
    habitat: "Deniz",
    region: "Ege",
    protection: "Guvenli",
    tags: ["Deniz", "Kayalik"],
    score: 84.5,
    records: 302,
    image: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=900&q=80",
    favorite: false,
  },
  {
    id: "lagos",
    name: "Lagos",
    latin: "Epinephelus aeneus",
    group: "Etcil",
    habitat: "Deniz",
    region: "Akdeniz",
    protection: "Koruma Altinda",
    tags: ["Deniz", "Buyuk Boy"],
    score: 83.8,
    records: 276,
    image: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=900&q=80",
    favorite: false,
  },  {
    id: "orkinos",
    name: "Orkinos",
    latin: "Thunnus thynnus",
    group: "Etçil",
    habitat: "Deniz",
    region: "Akdeniz",
    protection: "Koruma Altında",
    tags: ["Deniz", "Etçil", "Pelajik"],
    score: 78.8,
    records: 162,
    image: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=900&q=80",
    favorite: false,
  },
];

const pageSize = 6;

export default function SpeciesLibraryWorkspace() {
  const [speciesList, setSpeciesList] = useState<FishSpecies[]>(initialSpeciesCards);
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newSpecies, setNewSpecies] = useState({
    name: "",
    latin: "",
    group: "Etçil",
    habitat: "Deniz",
    region: "Akdeniz",
    protection: "Güvenli",
    tags: "Deniz, Etçil",
  });
  const [group, setGroup] = useState("Tümü");
  const [habitat, setHabitat] = useState("Tümü");
  const [region, setRegion] = useState("Tümü");
  const [protection, setProtection] = useState("Tümü");
  const [sortBy, setSortBy] = useState("Popülerlik");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [favorites, setFavorites] = useState(() => new Set(initialSpeciesCards.filter((fish) => fish.favorite).map((fish) => fish.id)));
  const [page, setPage] = useState(1);

  const filteredSpecies = useMemo(() => {
    const normalizedQuery = normalize(query);
    const result = speciesList.filter((fish) => {
      const haystack = normalize([fish.name, fish.latin, fish.group, fish.habitat, fish.region, fish.protection, ...fish.tags].join(" "));
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      const matchesGroup = group === "Tümü" || fish.group === group;
      const matchesHabitat = habitat === "Tümü" || fish.habitat === habitat;
      const matchesRegion = region === "Tümü" || fish.region === region;
      const matchesProtection = protection === "Tümü" || fish.protection === protection;
      const matchesTag = !activeTag || fish.tags.some((tag) => normalize(tag) === normalize(activeTag));
      const matchesFavorite = !favoriteOnly || favorites.has(fish.id);

      return matchesQuery && matchesGroup && matchesHabitat && matchesRegion && matchesProtection && matchesTag && matchesFavorite;
    });

    return result.sort((a, b) => {
      if (sortBy === "Ada Göre") return a.name.localeCompare(b.name, "tr");
      if (sortBy === "Kayıt Sayısı") return b.records - a.records;
      if (sortBy === "Uygunluk") return b.score - a.score;
      return b.score + b.records / 1000 - (a.score + a.records / 1000);
    });
  }, [activeTag, favoriteOnly, favorites, group, habitat, protection, query, region, sortBy, speciesList]);

  const pageCount = Math.max(1, Math.ceil(filteredSpecies.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pagedSpecies = filteredSpecies.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const favoriteCount = favorites.size;
  const popularSpecies = [...speciesList].sort((a, b) => b.score - a.score).slice(0, 5);

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function updateFilter(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  function submitNewSpecies(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newSpecies.name.trim();
    const latin = newSpecies.latin.trim();

    if (!name || !latin) return;

    const id = normalize(name).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `tur-${Date.now()}`;
    const created: FishSpecies = {
      id: `${id}-${Date.now().toString(36)}`,
      name,
      latin,
      group: newSpecies.group,
      habitat: newSpecies.habitat,
      region: newSpecies.region,
      protection: newSpecies.protection,
      tags: newSpecies.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      score: 82.5,
      records: 1,
      image: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=900&q=80",
      favorite: false,
    };

    setSpeciesList((current) => [created, ...current]);
    setQuery(name);
    setFavoriteOnly(false);
    setActiveTag(null);
    setPage(1);
    setAddModalOpen(false);
    setNewSpecies({
      name: "",
      latin: "",
      group: "Etçil",
      habitat: "Deniz",
      region: "Akdeniz",
      protection: "Güvenli",
      tags: "Deniz, Etçil",
    });
  }

  const summaryItems = [
    { label: "Toplam Tür", value: "128", icon: Fish, tone: "cyan" },
    { label: "Deniz Türü", value: "45", icon: Waves, tone: "blue" },
    { label: "Tatlı Su Türü", value: "38", icon: Waves, tone: "teal" },
    { label: "Koruma Altında", value: "45", icon: Shield, tone: "orange" },
  ];
  const groupDistribution = [
    { label: "Balık", value: 96, percent: 72, color: "#168fff" },
    { label: "Köpek Balığı", value: 8, percent: 6, color: "#7c5cff" },
    { label: "Vatoz", value: 8, percent: 6, color: "#dc8b8b" },
    { label: "Diğer", value: 16, percent: 13, color: "#f39c28" },
  ];

  return (
    <section className="fish-library-page">
      <div className="fish-library-shell">
        <header className="fish-library-header">
          <div className="fish-library-title">
            <h1>Tür Kütüphanesi</h1>
          </div>

          <div className="fish-library-actions">
            <label className="fish-library-search">
              <Search size={18} />
              <input
                type="search"
                value={query}
                placeholder="Tür, bilimsel ad veya anahtar kelime ara..."
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
              <span>Ctrl K</span>
            </label>
            <div className={`fish-library-view-toggle fish-library-view-toggle--${viewMode}`} aria-label="Gorunum secimi">
              <button type="button" className={viewMode === "grid" ? "is-active" : ""} aria-label="Grid görünümü" onClick={() => setViewMode("grid")}>
                <Grid2X2 size={18} />
              </button>
              <button type="button" className={viewMode === "list" ? "is-active" : ""} aria-label="Liste görünümü" onClick={() => setViewMode("list")}>
                <List size={18} />
              </button>
            </div>
            <button type="button" className="fish-library-primary" onClick={() => setAddModalOpen(true)}>
              <Plus size={18} />
              Yeni Tür Ekle
            </button>
          </div>
        </header>

        <div className="fish-library-layout">
          <main className="fish-library-main">
            <section className="fish-library-filter-panel" aria-label="Tür filtreleri">
              <LibrarySelect label="Tür Grubu" value={group} options={["Tümü", "Etçil", "Otçul", "Dip Balığı"]} onChange={(value) => updateFilter(setGroup, value)} />
              <LibrarySelect label="Yaşam Alanı" value={habitat} options={["Tümü", "Deniz", "Tatlı Su", "Acı Su"]} onChange={(value) => updateFilter(setHabitat, value)} />
              <LibrarySelect label="Dağılım Bölgesi" value={region} options={["Tümü", "Akdeniz", "Ege", "Karadeniz", "İc Anadolu"]} onChange={(value) => updateFilter(setRegion, value)} />
              <LibrarySelect label="Koruma Durumu" value={protection} options={["Tümü", "Güvenli", "Koruma Altında", "Nesli Tehlikede"]} onChange={(value) => updateFilter(setProtection, value)} />
              <LibrarySelect label="Sırala" value={sortBy} options={["Popülerlik", "Uygunluk", "Kayit Sayısı", "Ada Göre"]} onChange={(value) => updateFilter(setSortBy, value)} icon={<SlidersHorizontal size={16} />} />
            </section>

            <section className={viewMode === "grid" ? "fish-library-grid" : "fish-library-grid fish-library-grid--list"} aria-label="Balik turleri">
              {pagedSpecies.length ? (
                pagedSpecies.map((fish) => (
                  <article className="fish-library-card" key={fish.id}>
                    <img src={fish.image} alt={fish.name} />
                    <button type="button" className={`fish-library-favorite${favorites.has(fish.id) ? " is-active" : ""}`} aria-label={`${fish.name} favori`} onClick={() => toggleFavorite(fish.id)}>
                      <Star size={18} fill={favorites.has(fish.id) ? "currentColor" : "none"} />
                    </button>
                    <div className="fish-library-card-shade" />
                    <div className="fish-library-card-copy">
                      <h3>{fish.name}</h3>
                      <p>{fish.latin}</p>
                    </div>
                    <footer>
                      <strong>
                        %{fish.score.toFixed(1)} Uygunluk
                        <TrendingUp size={14} />
                      </strong>
                      <span>{fish.records.toLocaleString("tr-TR")} kayit</span>
                    </footer>
                  </article>
                ))
              ) : (
                <div className="fish-library-empty">
                  <Search size={24} />
                  <strong>Sonuç bulunamadı</strong>
                  <span>Arama veya filtreleri değiştirerek tekrar deneyin.</span>
                </div>
              )}
            </section>

            <nav className="fish-library-pagination fish-library-pagination--sm" aria-label="Sayfalama">
              <button
                  className="fish-library-pagination-control"
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={`fish-library-pagination-link${pageNumber === currentPage ? " is-active" : ""}`}
                    onClick={() => setPage(pageNumber)}
                    aria-current={pageNumber === currentPage ? "page" : undefined}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  className="fish-library-pagination-control"
                  type="button"
                  disabled={currentPage === pageCount}
                  onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
            </nav>
          </main>

          <aside className="fish-library-side">
            <section className="fish-library-panel">
              <div className="fish-library-panel-head">
                <h2>Kütüphane Ozeti</h2>
                <a href="/platform/analyze">Detaylı Rapor <ChevronRight size={14} /></a>
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
                <h2>Tür Grubuna Göre Dağılım</h2>
                <a href="/platform/library" onClick={(event) => event.preventDefault()}>Tümünü Gör <ChevronRight size={14} /></a>
              </div>
              <div className="fish-library-distribution">
                <div className="fish-library-donut" aria-hidden="true" />
                <div className="fish-library-distribution-list">
                  {groupDistribution.map((item) => (
                    <div key={item.label}>
                      <span style={{ backgroundColor: item.color }} />
                      <strong>{item.label}</strong>
                      <b>{item.value}</b>
                      <small>(%{item.percent})</small>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="fish-library-panel">
              <div className="fish-library-panel-head">
                <h2>Popüler Türler</h2>
                <a href="/platform/library" onClick={(event) => event.preventDefault()}>Tümünü Gör <ChevronRight size={14} /></a>
              </div>
              <div className="fish-library-popular">
                {popularSpecies.map((item, index) => (
                  <article key={item.id}>
                    <img src={item.image} alt={item.name} />
                    <b>{index + 1}</b>
                    <strong>{item.name}</strong>
                    <span>%{item.score.toFixed(1)}</span>
                    <TrendingUp size={15} />
                  </article>
                ))}
              </div>
            </section>

            <section className="fish-library-panel">
              <h2>Hızlı Erişim</h2>
              <div className="fish-library-shortcuts">
                <a href="/platform/library" onClick={(event) => { event.preventDefault(); setFavoriteOnly(true); setActiveTag(null); setPage(1); }}>
                  <Star size={17} />
                  Favori Turlerim ({favoriteCount})
                </a>
                <a href="/platform/analyze">
                  <Search size={17} />
                  Yakın Bölgemdeki Türler
                </a>
              </div>
            </section>
          </aside>
        </div>
      </div>
      {addModalOpen ? (
        <div className="fish-library-modal-backdrop" role="presentation" onMouseDown={() => setAddModalOpen(false)}>
          <section className="fish-library-modal" role="dialog" aria-modal="true" aria-labelledby="new-species-title" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div>
                <h2 id="new-species-title">Yeni Tür Ekle</h2>
                <p>Kütüphaneye yeni bir balık türü kaydı oluşturun.</p>
              </div>
              <button type="button" aria-label="Kapat" onClick={() => setAddModalOpen(false)}>
                <X size={18} />
              </button>
            </header>

            <form onSubmit={submitNewSpecies}>
              <label>
                <span>Tür Adı</span>
                <input
                  required
                  value={newSpecies.name}
                  placeholder="Orn. Minekop"
                  onChange={(event) => setNewSpecies((current) => ({ ...current, name: event.target.value }))}
                />
              </label>
              <label>
                <span>Bilimsel Ad</span>
                <input
                  required
                  value={newSpecies.latin}
                  placeholder="Orn. Umbrina cirrosa"
                  onChange={(event) => setNewSpecies((current) => ({ ...current, latin: event.target.value }))}
                />
              </label>
              <LibrarySelect label="Tur Grubu" value={newSpecies.group} options={["Etcil", "Otcul", "Dip Baligi"]} onChange={(value) => setNewSpecies((current) => ({ ...current, group: value }))} />
              <LibrarySelect label="Yasam Alani" value={newSpecies.habitat} options={["Deniz", "Tatli Su", "Aci Su"]} onChange={(value) => setNewSpecies((current) => ({ ...current, habitat: value }))} />
              <LibrarySelect label="Dagilim Bolgesi" value={newSpecies.region} options={["Akdeniz", "Ege", "Karadeniz", "Ic Anadolu"]} onChange={(value) => setNewSpecies((current) => ({ ...current, region: value }))} />
              <LibrarySelect label="Koruma Durumu" value={newSpecies.protection} options={["Guvenli", "Koruma Altinda", "Nesli Tehlikede"]} onChange={(value) => setNewSpecies((current) => ({ ...current, protection: value }))} />
              <label className="fish-library-modal-wide">
                <span>Etiketler</span>
                <input
                  value={newSpecies.tags}
                  placeholder="Deniz, Etcil"
                  onChange={(event) => setNewSpecies((current) => ({ ...current, tags: event.target.value }))}
                />
              </label>
              <footer>
                <button type="button" onClick={() => setAddModalOpen(false)}>Vazgeç</button>
                <button type="submit">
                  <Check size={17} />
                  Türü Ekle
                </button>
              </footer>
            </form>
          </section>
        </div>
      ) : null}
    </section>
  );
}

function LibrarySelect({
  label,
  value,
  options,
  onChange,
  icon,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  icon?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(options.findIndex((option) => option === value), 0);

  return (
    <div
      className={`fish-library-select ${open ? "is-open" : ""}`}
      onMouseLeave={() => setOpen(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
        }
      }}
    >
      <span>{label}</span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{value}</span>
        <i aria-hidden="true">{icon ?? <ChevronDown size={16} />}</i>
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            className="fish-library-dropdown"
            role="listbox"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <span className="fish-library-dropdown-bridge" aria-hidden="true" />
            <motion.span
              className="fish-library-dropdown-nub"
              aria-hidden="true"
              layout
              transition={{ duration: 0.22, ease: "easeInOut" }}
            />
            {options.map((option, index) => {
              const selected = option === value;

              return (
                <motion.button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={selected ? "is-selected" : ""}
                  value={option}
                  key={option}
                  initial={{ opacity: 0, x: index < selectedIndex ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18, delay: index * 0.025, ease: "easeOut" }}
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                >
                  <span>
                    <strong>{option}</strong>
                    <small>{getLibraryOptionMeta(label, option)}</small>
                  </span>
                  {selected ? <Check size={15} /> : null}
                </motion.button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function getLibraryOptionMeta(label: string, option: string) {
  const meta: Record<string, Record<string, string>> = {
    "Tür Grubu": {
      Tümü: "Tüm beslenme grupları",
      Etçil: "Avcı ve protein agırlıklı turler",
      Otçul: "Bitkisel kaynaklarla beslenen türler",
      "Dip Balığı": "Taban habitatına yakın yaşayanlar",
    },
    "Yasam Alanı": {
      Tümü: "Tüm sucul habitatlar",
      Deniz: "Tuzlu su ve kıyı ekosistemleri",
      "Tatlı Su": "Göl, nehir ve iç sular",
      "Acı Su": "Nehir ağzı ve lagün geçişleri",
    },
    "Dagılım Bölgesi": {
      Tümü: "Tüm izleme bölgeleri",
      Akdeniz: "Sıcak deniz kuşağı",
      Ege: "Kıyısal ve ada ekosistemi",
      Karadeniz: "Kuzey kıyıları ve serin sular",
      "İç Anadolu": "İç su kaynakları",
    },
    "Koruma Durumu": {
      Tümü: "Tüm koruma sınıfları",
      Guvenli: "Popülasyon riski düşük",
      "Koruma Altında": "İzlemeye ve korumaya tabi",
      "Nesli Tehlikede": "Hassas tür grubu",
    },
    Sirala: {
      Populerlik: "En çok incelenen türler",
      Uygunluk: "Analiz uyum skoruna göre",
      "Kayıt Sayısı": "Veri havuzu büyüklüğüne göre",
      "Ada Göre": "Alfabetik listeleme",
    },
  };

  return meta[label]?.[option] ?? "Seçimi uygula";
}

function normalize(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ç", "c")
    .replaceAll("ğ", "g")
    .replaceAll("ı", "i")
    .replaceAll("ö", "o")
    .replaceAll("ş", "s")
    .replaceAll("ü", "u");
}

"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
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

const speciesCards: FishSpecies[] = [
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
    group: "Etcil",
    habitat: "Deniz",
    region: "Karadeniz",
    protection: "Guvenli",
    tags: ["Deniz", "Etcil", "Pelajik"],
    score: 91.3,
    records: 876,
    image: "https://images.unsplash.com/photo-1560275619-4662e36fa65c?auto=format&fit=crop&w=900&q=80",
    favorite: true,
  },
  {
    id: "kefal",
    name: "Kefal",
    latin: "Mugil cephalus",
    group: "Otcul",
    habitat: "Aci Su",
    region: "Ege",
    protection: "Guvenli",
    tags: ["Deniz / Acisu", "Otcul"],
    score: 90.3,
    records: 754,
    image: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=900&q=80",
    favorite: true,
  },
  {
    id: "sardalya",
    name: "Sardalya",
    latin: "Sardina pilchardus",
    group: "Otcul",
    habitat: "Deniz",
    region: "Akdeniz",
    protection: "Guvenli",
    tags: ["Deniz", "Otcul", "Pelajik"],
    score: 89.7,
    records: 689,
    image: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=900&q=80",
    favorite: false,
  },
  {
    id: "kalkan",
    name: "Kalkan",
    latin: "Scophthalmus maximus",
    group: "Dip Baligi",
    habitat: "Deniz",
    region: "Karadeniz",
    protection: "Koruma Altinda",
    tags: ["Deniz", "Dip Baligi", "Koruma Altinda"],
    score: 88.6,
    records: 612,
    image: "https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=900&q=80",
    favorite: true,
  },
  {
    id: "turna",
    name: "Turna",
    latin: "Esox lucius",
    group: "Etcil",
    habitat: "Tatli Su",
    region: "Ic Anadolu",
    protection: "Guvenli",
    tags: ["Tatli Su", "Etcil"],
    score: 87.9,
    records: 531,
    image: "https://images.unsplash.com/photo-1573925788206-7f8f0df1987e?auto=format&fit=crop&w=900&q=80",
    favorite: false,
  },
  {
    id: "mersin",
    name: "Mersin Baligi",
    latin: "Acipenser sturio",
    group: "Dip Baligi",
    habitat: "Aci Su",
    region: "Karadeniz",
    protection: "Nesli Tehlikede",
    tags: ["Acisu", "Dip Baligi", "Nesli Tehlikede"],
    score: 84.2,
    records: 288,
    image: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=900&q=80",
    favorite: false,
  },
];

const tags = ["Deniz", "Tatli Su", "Aci Su", "Etcil", "Otcul", "Dip Baligi", "Pelajik", "Nesli Tehlikede", "Koruma Altinda"];
const pageSize = 6;

export default function SpeciesLibraryWorkspace() {
  const [query, setQuery] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [group, setGroup] = useState("Tumu");
  const [habitat, setHabitat] = useState("Tumu");
  const [region, setRegion] = useState("Tumu");
  const [protection, setProtection] = useState("Tumu");
  const [sortBy, setSortBy] = useState("Populerlik");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [favorites, setFavorites] = useState(() => new Set(speciesCards.filter((fish) => fish.favorite).map((fish) => fish.id)));
  const [page, setPage] = useState(1);

  const filteredSpecies = useMemo(() => {
    const normalizedQuery = normalize(query);
    const result = speciesCards.filter((fish) => {
      const haystack = normalize([fish.name, fish.latin, fish.group, fish.habitat, fish.region, fish.protection, ...fish.tags].join(" "));
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      const matchesGroup = group === "Tumu" || fish.group === group;
      const matchesHabitat = habitat === "Tumu" || fish.habitat === habitat;
      const matchesRegion = region === "Tumu" || fish.region === region;
      const matchesProtection = protection === "Tumu" || fish.protection === protection;
      const matchesTag = !activeTag || fish.tags.some((tag) => normalize(tag) === normalize(activeTag));
      const matchesFavorite = !favoriteOnly || favorites.has(fish.id);

      return matchesQuery && matchesGroup && matchesHabitat && matchesRegion && matchesProtection && matchesTag && matchesFavorite;
    });

    return result.sort((a, b) => {
      if (sortBy === "Ada Gore") return a.name.localeCompare(b.name, "tr");
      if (sortBy === "Kayit Sayisi") return b.records - a.records;
      if (sortBy === "Uygunluk") return b.score - a.score;
      return b.score + b.records / 1000 - (a.score + a.records / 1000);
    });
  }, [activeTag, favoriteOnly, favorites, group, habitat, protection, query, region, sortBy]);

  const pageCount = Math.max(1, Math.ceil(filteredSpecies.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pagedSpecies = filteredSpecies.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const favoriteCount = favorites.size;
  const endangeredCount = speciesCards.filter((fish) => fish.protection === "Nesli Tehlikede").length;
  const familyCount = new Set(speciesCards.map((fish) => fish.group)).size;
  const habitatCount = new Set(speciesCards.map((fish) => fish.habitat)).size;
  const popularSpecies = [...speciesCards].sort((a, b) => b.score - a.score).slice(0, 5);

  function resetFilters() {
    setQuery("");
    setGroup("Tumu");
    setHabitat("Tumu");
    setRegion("Tumu");
    setProtection("Tumu");
    setSortBy("Populerlik");
    setActiveTag(null);
    setFavoriteOnly(false);
    setPage(1);
  }

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectTag(tag: string) {
    setActiveTag((current) => (current === tag ? null : tag));
    setFavoriteOnly(false);
    setPage(1);
  }

  function updateFilter(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  const summaryItems = [
    { label: "Toplam Tur", value: speciesCards.length.toString(), icon: Fish, tone: "cyan" },
    { label: "Aile", value: familyCount.toString(), icon: Layers, tone: "blue" },
    { label: "Yasam Alani", value: habitatCount.toString(), icon: Waves, tone: "white" },
    { label: "Tehlike Altinda", value: endangeredCount.toString(), icon: AlertTriangle, tone: "yellow" },
  ];

  return (
    <section className="fish-library-page">
      <div className="fish-library-shell">
        <header className="fish-library-header">
          <div className="fish-library-title">
            <h1>Tur Kutuphanesi</h1>
            <p>Balik turlerini arayin, filtreleyin, favorileyin ve kayitlari yonetin.</p>
          </div>

          <div className="fish-library-actions">
            <label className="fish-library-search">
              <Search size={18} />
              <input
                type="search"
                value={query}
                placeholder="Tur, bilimsel ad veya anahtar kelime ara..."
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
              <span>Ctrl K</span>
            </label>
            <button type="button" className="fish-library-action" onClick={() => setFiltersVisible((visible) => !visible)}>
              <SlidersHorizontal size={18} />
              {filtersVisible ? "Filtreleri Gizle" : "Filtreleri Goster"}
            </button>
            <div className="fish-library-view-toggle" aria-label="Gorunum secimi">
              <button type="button" className={viewMode === "grid" ? "is-active" : ""} aria-label="Grid gorunumu" onClick={() => setViewMode("grid")}>
                <Grid2X2 size={18} />
              </button>
              <button type="button" className={viewMode === "list" ? "is-active" : ""} aria-label="Liste gorunumu" onClick={() => setViewMode("list")}>
                <List size={18} />
              </button>
            </div>
            <button type="button" className="fish-library-primary" onClick={() => alert("Yeni tur ekleme akisi yakinda aktif olacak.")}>
              <Plus size={18} />
              Yeni Tur Ekle
            </button>
          </div>
        </header>

        <div className="fish-library-layout">
          <main className="fish-library-main">
            {filtersVisible ? (
              <section className="fish-library-filter-panel" aria-label="Tur filtreleri">
                <LibrarySelect label="Tur Grubu" value={group} options={["Tumu", "Etcil", "Otcul", "Dip Baligi"]} onChange={(value) => updateFilter(setGroup, value)} />
                <LibrarySelect label="Yasam Alani" value={habitat} options={["Tumu", "Deniz", "Tatli Su", "Aci Su"]} onChange={(value) => updateFilter(setHabitat, value)} />
                <LibrarySelect label="Dagilim Bolgesi" value={region} options={["Tumu", "Akdeniz", "Ege", "Karadeniz", "Ic Anadolu"]} onChange={(value) => updateFilter(setRegion, value)} />
                <LibrarySelect label="Koruma Durumu" value={protection} options={["Tumu", "Guvenli", "Koruma Altinda", "Nesli Tehlikede"]} onChange={(value) => updateFilter(setProtection, value)} />
                <LibrarySelect label="Sirala" value={sortBy} options={["Populerlik", "Uygunluk", "Kayit Sayisi", "Ada Gore"]} onChange={(value) => updateFilter(setSortBy, value)} icon={<SlidersHorizontal size={16} />} />
              </section>
            ) : null}

            <div className="fish-library-result-row">
              <span>
                {filteredSpecies.length} tur bulundu
                {activeTag ? ` - ${activeTag} etiketi aktif` : ""}
                {favoriteOnly ? " - favoriler" : ""}
              </span>
              <button type="button" onClick={resetFilters}>Temizle</button>
            </div>

            <section className={viewMode === "grid" ? "fish-library-grid" : "fish-library-grid fish-library-grid--list"} aria-label="Balik turleri">
              {pagedSpecies.length ? (
                pagedSpecies.map((fish) => (
                  <article className="fish-library-card" key={fish.id}>
                    <img src={fish.image} alt={fish.name} />
                    <button type="button" className="fish-library-favorite" aria-label={`${fish.name} favori`} onClick={() => toggleFavorite(fish.id)}>
                      <Star size={18} fill={favorites.has(fish.id) ? "currentColor" : "none"} />
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
                  <strong>Sonuc bulunamadi</strong>
                  <span>Arama veya filtreleri degistirerek tekrar deneyin.</span>
                </div>
              )}
            </section>

            <nav className="fish-library-pagination" aria-label="Sayfalama">
              <button type="button" aria-label="Onceki sayfa" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
                <button key={pageNumber} type="button" className={pageNumber === currentPage ? "is-active" : ""} onClick={() => setPage(pageNumber)}>
                  {pageNumber}
                </button>
              ))}
              <button type="button" aria-label="Sonraki sayfa" disabled={currentPage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>
                <ChevronRight size={18} />
              </button>
            </nav>
          </main>

          <aside className="fish-library-side">
            <section className="fish-library-panel">
              <div className="fish-library-panel-head">
                <h2>Kutuphane Ozeti</h2>
                <a href="/platform/analyze">Detayli Rapor</a>
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
                <h2>Populer Turler</h2>
                <a href="/platform/library" onClick={(event) => event.preventDefault()}>Tumunu Gor</a>
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
              <h2>Tur Etiketleri</h2>
              <div className="fish-library-tags">
                {tags.map((tag) => (
                  <button type="button" className={activeTag === tag ? "is-active" : ""} key={tag} onClick={() => selectTag(tag)}>
                    {tag}
                  </button>
                ))}
              </div>
            </section>

            <section className="fish-library-panel">
              <h2>Hizli Erisim</h2>
              <div className="fish-library-shortcuts">
                <a href="/platform/library" onClick={(event) => { event.preventDefault(); setFavoriteOnly(true); setActiveTag(null); setPage(1); }}>
                  <Star size={17} />
                  Favori Turlerim ({favoriteCount})
                </a>
                <a href="/platform/library" onClick={(event) => event.preventDefault()}>
                  <Hash size={17} />
                  Son Goruntulenenler
                </a>
                <a href="/platform/analyze">
                  <BarChart3 size={17} />
                  Karsilastirma Araci
                </a>
                <a href="/platform/library" onClick={(event) => event.preventDefault()}>
                  <Heart size={17} />
                  Tur Ekle / Duzenle
                </a>
              </div>
            </section>
          </aside>
        </div>
      </div>
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
  return (
    <label className="fish-library-select">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      >
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
      <i aria-hidden="true">{icon ?? <ChevronDown size={16} />}</i>
    </label>
  );
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

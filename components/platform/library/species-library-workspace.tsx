"use client";

import type { CSSProperties, FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Fish,
  Grid2X2,
  Layers,
  List,
  Maximize2,
  Plus,
  Search,
  Shield,
  SlidersHorizontal,
  Star,
  TrendingUp,
  Waves,
  X,
} from "lucide-react";
import { useCurrentUser } from "../../../hooks/use-current-user";
import { Carousel } from "@/components/application/carousel/carousel-base";

type ArchivedSpeciesItem = {
  id: string;
  species: string;
  latin: string;
  score: number;
  records: number;
  photos: string[];
  tags: string[];
};
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
  photos?: string[];
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
  const { user } = useCurrentUser();
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
  const [galleryFish, setGalleryFish] = useState<FishSpecies | null>(null);
  const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState(0);


  useEffect(() => {
    let alive = true;
    fetch("/api/library/archive")
      .then((response) => response.json())
      .then((data) => {
        if (!alive || !Array.isArray(data?.items)) return;
        setSpeciesList((current) => mergeArchivedSpecies(current, data.items));
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!galleryFish) return;
    setSelectedGalleryPhoto(0);
  }, [galleryFish]);

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
  const userLibraryRegion = getLibraryRegionForUser(user?.region);
  const nearbySpeciesCount = userLibraryRegion ? speciesList.filter((fish) => fish.region === userLibraryRegion).length : 0;

  const summaryItems = useMemo(() => {
    const totalSpecies = speciesList.length;
    const seaSpecies = speciesList.filter(isSeaSpecies).length;
    const freshWaterSpecies = speciesList.filter(isFreshWaterSpecies).length;
    const protectedSpecies = speciesList.filter(isProtectedSpecies).length;

    return [
      { label: "Toplam Tur", value: formatCount(totalSpecies), icon: Fish, tone: "cyan" },
      { label: "Deniz Turu", value: formatCount(seaSpecies), icon: Waves, tone: "blue" },
      { label: "Tatli Su Turu", value: formatCount(freshWaterSpecies), icon: Waves, tone: "teal" },
      { label: "Koruma Altında", value: formatCount(protectedSpecies), icon: Shield, tone: "orange" },
    ];
  }, [speciesList]);

  const groupDistribution = useMemo(() => buildGroupDistribution(speciesList), [speciesList]);
  const distributionBackground = useMemo(() => buildDistributionGradient(groupDistribution), [groupDistribution]);
  const galleryPhotos = useMemo(() => (galleryFish ? buildGalleryPhotos(galleryFish) : []), [galleryFish]);
  const activeCarouselIndex = Math.max(galleryPhotos.findIndex((photo) => photo.index === selectedGalleryPhoto), 0);

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

            <section key={`${viewMode}-${currentPage}-${filteredSpecies.length}`} className={viewMode === "grid" ? "fish-library-grid fish-library-grid--page-transition" : "fish-library-grid fish-library-grid--list fish-library-grid--page-transition"} aria-label="Balik turleri">
              {pagedSpecies.length ? (
                pagedSpecies.map((fish) => (
                  <article className="fish-library-card" key={fish.id} role="button" tabIndex={0} onClick={() => setGalleryFish(fish)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setGalleryFish(fish); }}>
                    <img src={fish.image} alt={fish.name} />
                    {fish.photos?.length ? <span className="fish-library-photo-count">+{fish.photos.length}</span> : null}
                    <button type="button" className={`fish-library-favorite${favorites.has(fish.id) ? " is-active" : ""}`} aria-label={`${fish.name} favori`} onClick={(event) => { event.stopPropagation(); toggleFavorite(fish.id); }}>
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
                <div className="fish-library-donut" aria-hidden="true" style={{ background: distributionBackground }} />
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
                <a href="/platform/library" onClick={(event) => { event.preventDefault(); if (userLibraryRegion) { setRegion(userLibraryRegion); setFavoriteOnly(false); setActiveTag(null); setPage(1); } }}>
                  <Search size={17} />
                  Yakin Bolgemdeki Turler ({nearbySpeciesCount})
                </a>
              </div>
            </section>
          </aside>
        </div>
      </div>
      {galleryFish ? createPortal((
        <div className="fish-library-gallery-backdrop" role="presentation" onMouseDown={() => setGalleryFish(null)}>
          <section
            className="fish-library-gallery fish-library-gallery--minimal"
            role="dialog"
            aria-modal="true"
            aria-label={`${galleryFish.name} foto galeri`}
            onMouseDown={(event) => event.stopPropagation()}
          >

            <div className="fish-library-gallery-carousel" aria-live="polite">
              {galleryPhotos.length ? (
                <Carousel.Root
                  activeIndex={activeCarouselIndex}
                  className="fish-library-carousel-root"
                  itemCount={galleryPhotos.length}
                  onActiveIndexChange={(index) => setSelectedGalleryPhoto(galleryPhotos[index]?.index ?? 0)}
                >
                  <Carousel.PrevTrigger className="fish-library-carousel-trigger fish-library-carousel-trigger--prev" aria-label="Onceki gorsel">
                    <ChevronLeft size={22} />
                  </Carousel.PrevTrigger>
                  <Carousel.NextTrigger className="fish-library-carousel-trigger fish-library-carousel-trigger--next" aria-label="Sonraki gorsel">
                    <ChevronRight size={22} />
                  </Carousel.NextTrigger>

                  <div className="fish-library-carousel-indicator" aria-label="Galeri gostergeci">
                    {galleryPhotos.map((photo, index) => (
                      <button
                        type="button"
                        className={index === activeCarouselIndex ? "is-active" : ""}
                        key={photo.id}
                        aria-label={`${galleryFish.name} gorsel ${index + 1}`}
                        aria-current={index === activeCarouselIndex ? "true" : undefined}
                        onClick={() => setSelectedGalleryPhoto(photo.index)}
                      />
                    ))}
                  </div>

                  <Carousel.Content className="fish-library-carousel-content">
                    {galleryPhotos.map((photo) => (
                      <Carousel.Item className="fish-library-carousel-item" key={photo.id}>
                        <img src={photo.src} alt={`${galleryFish.name} arsiv ${photo.index + 1}`} />
                      </Carousel.Item>
                    ))}
                  </Carousel.Content>
                </Carousel.Root>
              ) : (
                <div className="fish-library-gallery-empty">
                  <Search size={22} />
                  <strong>Gorsel bulunamadi</strong>
                </div>
              )}
            </div>
          </section>
        </div>
      ), document.body) : null}
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

type GroupDistributionItem = {
  label: string;
  value: number;
  percent: number;
  color: string;
};

const distributionColors = ["#168fff", "#7c5cff", "#dc8b8b", "#f39c28"];

type GalleryPhoto = {
  id: string;
  src: string;
  index: number;
  label: string;
  source: string;
  quality: number;
};

function buildGalleryPhotos(fish: FishSpecies): GalleryPhoto[] {
  const source = [...(fish.photos ?? []), fish.image].filter(Boolean);
  const photos = source.length ? source : [fish.image];
  const targetLength = Math.max(12, photos.length);

  return Array.from({ length: targetLength }, (_, index) => ({
    id: `${fish.id}-gallery-${index}`,
    src: photos[index % photos.length],
    index,
    label: `${fish.name} ${fish.latin} gorsel ${index + 1}`,
    source: index % 3 === 0 ? "Analiz" : "Arsiv",
    quality: Math.max(82, Math.round(fish.score - (index % 4) * 2)),
  }));
}
function buildGroupDistribution(species: FishSpecies[]): GroupDistributionItem[] {
  const total = species.length;
  if (!total) {
    return [{ label: "Veri yok", value: 0, percent: 0, color: distributionColors[0] }];
  }

  const counts = new Map<string, number>();
  for (const fish of species) {
    counts.set(fish.group, (counts.get(fish.group) ?? 0) + 1);
  }

  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  const primary = sorted.slice(0, 3);
  const otherTotal = sorted.slice(3).reduce((sum, [, value]) => sum + value, 0);
  const rows = otherTotal > 0 ? [...primary, ["Diger", otherTotal] as [string, number]] : primary;

  return rows.map(([label, value], index) => ({
    label,
    value,
    percent: Math.round((value / total) * 100),
    color: distributionColors[index % distributionColors.length],
  }));
}

function buildDistributionGradient(distribution: GroupDistributionItem[]): CSSProperties["background"] {
  const total = distribution.reduce((sum, item) => sum + item.value, 0);
  if (!total) return "conic-gradient(#168fff 0deg 360deg)";

  let start = 0;
  const stops = distribution.map((item) => {
    const end = start + (item.value / total) * 360;
    const segment = `${item.color} ${start.toFixed(1)}deg ${end.toFixed(1)}deg`;
    start = end;
    return segment;
  });

  return `conic-gradient(${stops.join(", ")})`;
}

function isSeaSpecies(fish: FishSpecies) {
  const value = normalize([fish.habitat, ...fish.tags].join(" "));
  return value.includes("deniz");
}

function isFreshWaterSpecies(fish: FishSpecies) {
  const value = normalize([fish.habitat, ...fish.tags].join(" "));
  const rawValue = [fish.habitat, ...fish.tags].join(" ").toLocaleLowerCase("tr-TR");
  return value.includes("tatli") || rawValue.includes("tatlı") || value.includes("fresh");
}

function isProtectedSpecies(fish: FishSpecies) {
  const protection = normalize(fish.protection);
  const rawProtection = fish.protection.toLocaleLowerCase("tr-TR");
  const safeLabels = ["guvenli", "güvenli", "gÃ¼venli", "gÃœvenli"];
  return !safeLabels.some((label) => protection.includes(normalize(label)) || rawProtection.includes(label.toLocaleLowerCase("tr-TR")));
}

function getLibraryRegionForUser(region?: string) {
  if (!region) return null;
  const normalizedRegion = normalize(region);
  if (normalizedRegion.includes("ege") || normalizedRegion.includes("izmir") || normalizedRegion.includes("aydin") || normalizedRegion.includes("mugla")) return "Ege";
  if (normalizedRegion.includes("akdeniz") || normalizedRegion.includes("antalya") || normalizedRegion.includes("mersin")) return "Akdeniz";
  if (normalizedRegion.includes("karadeniz") || normalizedRegion.includes("trabzon") || normalizedRegion.includes("samsun")) return "Karadeniz";
  if (normalizedRegion.includes("anadolu") || normalizedRegion.includes("ankara") || normalizedRegion.includes("konya")) return "İc Anadolu";
  return null;
}

function formatCount(value: number) {
  return new Intl.NumberFormat("tr-TR").format(value);
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

function mergeArchivedSpecies(current: FishSpecies[], archiveItems: ArchivedSpeciesItem[]) {
  const next = [...current];

  for (const item of archiveItems) {
    const speciesName = item.species?.trim();
    if (!speciesName) continue;

    const index = next.findIndex((fish) => normalize(fish.name) === normalize(speciesName));
    const photos = item.photos?.length ? item.photos : [];

    if (index >= 0) {
      const existing = next[index];
      const mergedPhotos = Array.from(new Set([...(photos ?? []), ...(existing.photos ?? [])]));
      next[index] = {
        ...existing,
        latin: item.latin || existing.latin,
        score: item.score > 0 ? Math.max(existing.score, item.score) : existing.score,
        records: existing.records + Math.max(0, item.records),
        image: mergedPhotos[0] ?? existing.image,
        photos: mergedPhotos,
        tags: Array.from(new Set([...existing.tags, ...(item.tags ?? [])])),
      };
    } else {
      next.unshift({
        id: `archive-${item.id}`,
        name: speciesName,
        latin: item.latin || "Bilimsel ad bekleniyor",
        group: "Analiz",
        habitat: item.tags?.[0] ?? "Deniz",
        region: "AquaScope Arsivi",
        protection: "Guvenli",
        tags: item.tags?.length ? item.tags : ["Analiz"],
        score: item.score || 80,
        records: Math.max(1, item.records || 1),
        image: photos[0] ?? "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80",
        favorite: false,
        photos,
      });
    }
  }

  return next;
}

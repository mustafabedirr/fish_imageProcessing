"use client";

import type { ReactNode } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Fish,
  Globe2,
  Search,
  SlidersHorizontal,
  Star,
  Tags,
  TrendingDown,
  TrendingUp,
  Waves,
} from "lucide-react";
import PlatformUtilityBar from "../shell/platform-utility-bar";

const speciesCards = [
  {
    name: "Largemouth Bass",
    latin: "Micropterus salmoides",
    type: "Freshwater",
    identified: "1,254 identified",
    image: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Rainbow Trout",
    latin: "Oncorhynchus mykiss",
    type: "Freshwater",
    identified: "932 identified",
    image: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Perch",
    latin: "Perca fluviatilis",
    type: "Freshwater",
    identified: "817 identified",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Walleye",
    latin: "Sander vitreus",
    type: "Freshwater",
    identified: "589 identified",
    image: "https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Salmon",
    latin: "Salmo salar",
    type: "Freshwater / Saltwater",
    identified: "466 identified",
    image: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Bluefin Tuna",
    latin: "Thunnus thynnus",
    type: "Saltwater",
    identified: "413 identified",
    image: "https://images.unsplash.com/photo-1560275619-4662e36fa65c?auto=format&fit=crop&w=700&q=80",
  },
];

const trendingSpecies = [
  { name: "Clupeidae", value: "325", trend: "up", color: "orange" },
  { name: "Carangidae", value: "238", trend: "up", color: "amber" },
  { name: "Scombridae", value: "256", trend: "up", color: "green" },
  { name: "Serranidae", value: "214", trend: "down", color: "red" },
];

const popularTags = ["Freshwater", "Saltwater", "Bass", "Perch", "Tropical", "Deepwater", "Coastal"];

const overviewStats = [
  { label: "Total Species", value: "128", icon: Fish },
  { label: "Regions", value: "45", icon: Globe2 },
  { label: "Types", value: "8", icon: Tags },
];

export default function SpeciesLibraryWorkspace() {
  return (
    <section className="species-catalog-page">
      <PlatformUtilityBar />

      <div className="species-catalog-shell">
        <header className="dark-page-head">
          <div>
            <h1>Species Library</h1>
            <p>View and manage details for various fish species</p>
          </div>
        </header>

        <div className="species-catalog-layout">
          <div className="species-catalog-main">
            <div className="species-catalog-toolbar">
              <DarkLibraryFilter icon={<Fish size={16} />} label="Select Type" />
              <DarkLibraryFilter icon={<Waves size={16} />} label="Select Region" />
              <DarkLibraryFilter icon={<SlidersHorizontal size={16} />} label="Sort by: Popularity" />

              <label className="species-catalog-search">
                <Search size={18} />
                <input placeholder="Search species..." aria-label="Search species" />
              </label>
            </div>

            <div className="species-catalog-grid">
              {speciesCards.map((fish) => (
                <article className="species-catalog-card" key={fish.name}>
                  <button type="button" className="species-catalog-favorite" aria-label={`Save ${fish.name}`}>
                    <Star size={18} />
                  </button>

                  <img src={fish.image} alt={fish.name} />

                  <div className="species-catalog-copy">
                    <h2>{fish.name}</h2>
                    <p>{fish.latin}</p>
                  </div>

                  <div className="species-catalog-meta">
                    <span>{fish.type}</span>
                    <small>{fish.identified}</small>
                  </div>

                  <div className="species-catalog-sparkline" />
                </article>
              ))}
            </div>

            <footer className="species-catalog-pagination">
              <button type="button" aria-label="Previous page">
                <ChevronLeft size={18} />
              </button>
              <span>1-33 of 128 species</span>
              <button className="active" type="button">
                1
              </button>
              <button type="button">2</button>
              <button type="button">3</button>
              <button type="button" aria-label="Next page">
                <ChevronRight size={18} />
              </button>
            </footer>
          </div>

          <aside className="species-catalog-side">
            <section className="species-catalog-panel">
              <div className="species-catalog-panel-head">
                <h2>Trending Species</h2>
                <a href="/platform/analyze">View all</a>
              </div>

              <div className="species-catalog-trends">
                {trendingSpecies.map((item) => (
                  <article key={item.name}>
                    <span className={`species-catalog-badge species-catalog-badge--${item.color}`}>{item.name.slice(0, 1)}</span>
                    <strong>{item.name}</strong>
                    <small>{item.value}</small>
                    {item.trend === "up" ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  </article>
                ))}
              </div>
            </section>

            <section className="species-catalog-panel">
              <div className="species-catalog-panel-head">
                <h2>Popular Species Tags</h2>
              </div>

              <div className="species-catalog-tags">
                {popularTags.map((tag) => (
                  <button key={tag} type="button">
                    {tag}
                  </button>
                ))}
              </div>
            </section>

            <section className="species-catalog-panel species-catalog-panel--overview">
              <div className="species-catalog-panel-head">
                <h2>Library Overview</h2>
                <ChevronRight size={18} />
              </div>

              <div className="species-catalog-overview">
                {overviewStats.map(({ icon: Icon, label, value }) => (
                  <article key={label}>
                    <span><Icon size={18} /></span>
                    <strong>{value}</strong>
                    <small>{label}</small>
                  </article>
                ))}
              </div>

              <a className="species-catalog-report" href="/platform/analyze">
                View Full Report
              </a>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}

function DarkLibraryFilter({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button type="button" className="species-catalog-filter">
      {icon}
      <span>{label}</span>
      <ChevronDown size={16} />
    </button>
  );
}

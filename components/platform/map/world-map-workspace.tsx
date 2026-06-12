"use client";

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import Map, { type MapRef } from "react-map-gl/maplibre";
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
  Pause,
  Play,
  Plus,
  Search,
  Shield,
  Star,
  Thermometer,
  Waves,
  Wind,
  X,
} from "lucide-react";

const layerItems = [
  { id: "fish-density", icon: Fish, title: "Balik Yogunlugu", low: "Dusuk", high: "Yuksek", active: true, tone: "blue" },
  { id: "water-temperature", icon: Thermometer, title: "Su Sicakligi", low: "Soguk", high: "Sicak", active: true, tone: "heat" },
  { id: "chlorophyll", icon: Leaf, title: "Klorofil Seviyesi", low: "Dusuk", high: "Yuksek", active: false, tone: "green" },
  { id: "current-direction", icon: Waves, title: "Akinti Yonu", low: "Yon & Hiz", high: "", active: true, tone: "blue" },
  { id: "protected-areas", icon: Shield, title: "Koruma Alanlari", low: "Resmi Bolgeler", high: "", active: true, tone: "green" },
  { id: "ports", icon: Anchor, title: "Limanlar", low: "Liman & Iskele", high: "", active: true, tone: "blue" },
  { id: "weather", icon: CloudRain, title: "Hava Durumu", low: "Ruzgar & Yagis", high: "", active: false, tone: "muted" },
];

const observations = [
  {
    name: "Levrek",
    latin: "Dicentrarchus labrax",
    time: "Bugun 14:32",
    score: "%95.4",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=180&q=80",
  },
  {
    name: "Cipura",
    latin: "Sparus aurata",
    time: "Bugun 10:15",
    score: "%92.1",
    image: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=180&q=80",
  },
  {
    name: "Palamut",
    latin: "Sarda sarda",
    time: "Dun 18:45",
    score: "%91.3",
    image: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=180&q=80",
  },
];

const mapStyle = {
  version: 8,
  sources: {
    "carto-dark": {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "Carto",
    },
  },
  layers: [
    { id: "background", type: "background", paint: { "background-color": "#061426" } },
    {
      id: "carto-dark",
      type: "raster",
      source: "carto-dark",
      paint: {
        "raster-opacity": 0.92,
        "raster-saturation": -0.28,
        "raster-contrast": 0.06,
        "raster-brightness-min": 0.08,
        "raster-brightness-max": 0.96,
      },
    },
  ],
};

const demoHeatmapAreas = [
  { id: "north-aegean", className: "aqua-demo-heat aqua-demo-heat--north", label: "Kuzey Ege yogunlugu" },
  { id: "izmir", className: "aqua-demo-heat aqua-demo-heat--izmir", label: "Izmir Korfezi yogunlugu" },
  { id: "cyclades", className: "aqua-demo-heat aqua-demo-heat--cyclades", label: "Kiklad gecis yogunlugu" },
  { id: "bodrum", className: "aqua-demo-heat aqua-demo-heat--bodrum", label: "Bodrum resif yogunlugu" },
] as const;

const demoMarkers = [
  { name: "Kuzey Ege", label: "%78", regionIndex: 0, style: { left: "46%", top: "28%" } },
  { name: "Izmir Korfezi", label: "%62", regionIndex: 1, style: { left: "63%", top: "43%" } },
  { name: "Bodrum Resifi", label: "%74", regionIndex: 2, style: { left: "70%", top: "64%" } },
  { name: "Kiklad Gecisi", label: "%58", regionIndex: 0, style: { left: "38%", top: "58%" } },
] as const;

const demoPorts = [
  { name: "Izmir", style: { left: "68%", top: "39%" } },
  { name: "Kusadasi", style: { left: "66%", top: "50%" } },
  { name: "Bodrum", style: { left: "70%", top: "61%" } },
  { name: "Rhodes", style: { left: "77%", top: "73%" } },
] as const;

const days = ["12 May", "13 May", "14 May", "15 May", "16 May", "17 May", "18 May"];

const regionTabs = ["Ozet", "Canli Veriler", "Analiz", "Notlar"] as const;

const mapRegions = [
  {
    id: "north",
    name: "Kuzey Ege Bolgesi",
    coordinatesText: "39.2326 N, 26.4412 E",
    center: [26.4412, 39.2326],
    density: "Yuksek",
    densityScore: "%78",
    temperature: "18.6 C",
    chlorophyll: "Orta",
    current: "0.8 m/s",
    wave: "0.3 m",
    wind: "12 kn",
  },
  {
    id: "izmir",
    name: "Izmir Korfezi",
    coordinatesText: "38.4237 N, 27.1428 E",
    center: [27.1428, 38.4237],
    density: "Orta",
    densityScore: "%62",
    temperature: "19.1 C",
    chlorophyll: "Orta",
    current: "0.6 m/s",
    wave: "0.2 m",
    wind: "9 kn",
  },
  {
    id: "bodrum",
    name: "Bodrum Resif Bolgesi",
    coordinatesText: "37.0344 N, 27.4305 E",
    center: [27.4305, 37.0344],
    density: "Yuksek",
    densityScore: "%74",
    temperature: "20.2 C",
    chlorophyll: "Dusuk",
    current: "0.7 m/s",
    wave: "0.4 m",
    wind: "14 kn",
  },
] as const;

type MarineConditions = {
  source: "open-meteo" | "fallback";
  updatedAt: string;
  waveHeight: string;
  waveDirection: string;
  wavePeriod: string;
  windSpeed: string;
  windDirection: string;
  airTemperature: string;
  waterTemperature: string;
};

export default function WorldMapWorkspace() {
  const mapRef = useRef<MapRef | null>(null);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>(
    Object.fromEntries(layerItems.map((layer) => [layer.id, layer.active]))
  );
  const [selectedDay, setSelectedDay] = useState("16 May");
  const [mapView, setMapView] = useState("Standart");
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeRegionIndex, setActiveRegionIndex] = useState(0);
  const [activeRegionTab, setActiveRegionTab] = useState<(typeof regionTabs)[number]>("Ozet");
  const [favoriteRegion, setFavoriteRegion] = useState(false);
  const [selectedObservationIndex, setSelectedObservationIndex] = useState(0);
  const [marineConditions, setMarineConditions] = useState<MarineConditions | null>(null);
  const [marineStatus, setMarineStatus] = useState<"loading" | "ready" | "fallback">("loading");

  const selectedRegion = mapRegions[activeRegionIndex];
  const selectedObservation = observations[selectedObservationIndex];
  const selectedDayIndex = Math.max(days.indexOf(selectedDay), 0);
  const liveSourceLabel = marineStatus === "loading" ? "Veri aliniyor" : marineConditions?.source === "open-meteo" ? "Open-Meteo Marine" : "Demo fallback";
  const floatingMetrics = [
    { icon: Thermometer, label: "Su Sicakligi", value: marineConditions?.waterTemperature ?? selectedRegion.temperature },
    { icon: Wind, label: "Ruzgar", value: marineConditions?.windSpeed ?? selectedRegion.wind },
    { icon: Waves, label: "Dalga Yuksekligi", value: marineConditions?.waveHeight ?? selectedRegion.wave },
  ];

  const activeMapStyle = useMemo(() => {
    const rasterPaint =
      mapView === "Uydu"
        ? { "raster-opacity": 0.98, "raster-saturation": -0.1, "raster-contrast": 0.14, "raster-brightness-min": 0.12, "raster-brightness-max": 1 }
        : mapView === "Koyu"
        ? { "raster-opacity": 0.82, "raster-saturation": -0.5, "raster-contrast": 0.16, "raster-brightness-min": 0.02, "raster-brightness-max": 0.72 }
        : mapStyle.layers[1].paint;

    return {
      ...mapStyle,
      layers: [
        mapStyle.layers[0],
        {
          ...mapStyle.layers[1],
          paint: rasterPaint,
        },
      ],
    };
  }, [mapView]);

  const toggleLayer = (id: string) => {
    setActiveLayers((current) => ({ ...current, [id]: !current[id] }));
  };

  const focusRegion = (index: number) => {
    const region = mapRegions[index];
    setActiveRegionIndex(index);
    mapRef.current?.flyTo({ center: region.center as [number, number], zoom: 7.25, duration: 850 });
  };

  const runSearch = () => {
    const query = searchQuery.trim().toLocaleLowerCase("tr-TR");
    if (!query) return;

    const regionIndex = mapRegions.findIndex((region) => region.name.toLocaleLowerCase("tr-TR").includes(query));
    if (regionIndex >= 0) {
      focusRegion(regionIndex);
      return;
    }

    if (query.includes("izmir")) focusRegion(1);
    if (query.includes("bodrum")) focusRegion(2);
    if (query.includes("ege")) focusRegion(0);
  };

  const applyFilterPreset = (preset: "density" | "environment" | "navigation") => {
    setActiveLayers((current) => ({
      ...current,
      "fish-density": preset !== "navigation",
      "water-temperature": preset !== "navigation",
      chlorophyll: preset === "environment",
      "current-direction": preset !== "density",
      "protected-areas": preset !== "density",
      ports: preset === "navigation",
      weather: preset === "environment",
    }));
    setFiltersOpen(false);
    setIsLayerPanelOpen(true);
  };

  const enableAllLayers = () => {
    setActiveLayers(Object.fromEntries(layerItems.map((layer) => [layer.id, true])));
  };

  useEffect(() => {
    if (!isPlaying) return undefined;

    const timer = window.setInterval(() => {
      setSelectedDay((current) => {
        const nextIndex = (days.indexOf(current) + 1) % days.length;
        return days[nextIndex];
      });
    }, 900);

    return () => window.clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    const controller = new AbortController();
    const [longitude, latitude] = selectedRegion.center;

    setMarineStatus("loading");
    fetch(`/api/marine-conditions?lat=${latitude}&lon=${longitude}&region=${selectedRegion.id}`, {
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data: MarineConditions) => {
        setMarineConditions(data);
        setMarineStatus(data.source === "open-meteo" ? "ready" : "fallback");
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setMarineConditions(null);
        setMarineStatus("fallback");
      });

    return () => controller.abort();
  }, [selectedRegion]);

  return (
    <section className={isExpanded ? "aqua-map-workspace is-expanded" : "aqua-map-workspace"}>
      <div className="aqua-map-screen">
        <header className="aqua-map-header">
          <div>
            <h1>Harita</h1>
            <p>Bolgeleri kesfedin, verileri goruntuleyin ve analiz edin.</p>
          </div>

          <div className="aqua-map-actions">
            <label className="aqua-map-search">
              <Search size={18} />
              <input
                type="search"
                placeholder="Konum, bolge veya koordinat ara..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") runSearch();
                }}
              />
              <span>Ctrl K</span>
            </label>
            <button type="button" className={filtersOpen ? "is-selected" : ""} onClick={() => setFiltersOpen((current) => !current)}>
              <Filter size={18} />
              Filtreler
            </button>
            {filtersOpen ? (
              <div className="aqua-map-filter-menu">
                <button type="button" onClick={() => applyFilterPreset("density")}>Yogunluk odagi</button>
                <button type="button" onClick={() => applyFilterPreset("environment")}>Cevre verileri</button>
                <button type="button" onClick={() => applyFilterPreset("navigation")}>Navigasyon</button>
              </div>
            ) : null}
            <button type="button" className="aqua-map-icon-button" aria-label="Bildirimler">
              <Bell size={18} />
              <b>3</b>
            </button>
            <button
              type="button"
              className={isLayerPanelOpen ? "is-selected" : ""}
              aria-expanded={isLayerPanelOpen}
              onClick={() => setIsLayerPanelOpen((current) => !current)}
            >
              <Layers size={18} />
              Veri Katmanlari
            </button>
            <button type="button" className="aqua-map-icon-button" aria-label="Tam ekran" onClick={() => setIsExpanded((current) => !current)}>
              <Expand size={18} />
            </button>
          </div>
        </header>

        <div className={isLayerPanelOpen ? "aqua-map-content" : "aqua-map-content is-layer-panel-closed"}>
          {isLayerPanelOpen ? (
          <aside className="aqua-layer-panel">
            <div className="aqua-panel-title">
              <h2>Veri Katmanlari</h2>
              <button type="button" aria-label="Katman panelini kapat" onClick={() => setIsLayerPanelOpen(false)}>
                <X size={17} />
              </button>
            </div>

            <div className="aqua-layer-list">
              {layerItems.map((item) => {
                const Icon = item.icon;
                const active = Boolean(activeLayers[item.id]);

                return (
                  <article className={active ? "aqua-layer-row is-enabled" : "aqua-layer-row"} key={item.id}>
                    <button className="aqua-layer-row-head" type="button" onClick={() => toggleLayer(item.id)}>
                      <span className={`aqua-layer-icon aqua-layer-icon--${item.tone}`}>
                        <Icon size={17} />
                      </span>
                      <strong>{item.title}</strong>
                      <span className={active ? "aqua-layer-check is-active" : "aqua-layer-check"}>
                        {active ? <Check size={14} /> : null}
                      </span>
                    </button>
                    <div className={`aqua-layer-meter aqua-layer-meter--${item.tone}`} />
                    <div className="aqua-layer-scale">
                      <span>{item.low}</span>
                      <span>{item.high}</span>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="aqua-layer-footer">
              <div className="aqua-map-view-controls">
                <h3>Harita Gorunumu</h3>
                <div>
                  {["Standart", "Uydu", "Koyu"].map((view) => (
                    <button className={mapView === view ? "is-selected" : ""} type="button" onClick={() => setMapView(view)} key={view}>
                      {view}
                    </button>
                  ))}
                </div>
              </div>

              <label className="aqua-map-date">
                <span>Zaman Araligi</span>
                <button
                  type="button"
                  onClick={() => {
                    const nextIndex = (days.indexOf(selectedDay) + 1) % days.length;
                    setSelectedDay(days[nextIndex]);
                  }}
                >
                  {selectedDay} - 18 Mayis 2024
                  <CalendarDays size={16} />
                </button>
              </label>

              <button type="button" className="aqua-manage-layers" onClick={enableAllLayers}>
                Tumunu Isaretle
              </button>
            </div>
          </aside>
          ) : null}

          <main className="aqua-map-stage">
            <section className="aqua-map-viewport">
              <div className="aqua-map-floating-toolbar">
                <button
                  type="button"
                  className={isLayerPanelOpen ? "aqua-map-toolbar-layers is-active" : "aqua-map-toolbar-layers"}
                  onClick={() => setIsLayerPanelOpen((current) => !current)}
                >
                  <Layers size={18} />
                  Veri Katmanlari
                </button>
                {floatingMetrics.map((metric) => {
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

              <div className="aqua-map-canvas-v2" aria-label="Ege Denizi veri haritasi">
                <Map
                  ref={mapRef}
                  initialViewState={{ longitude: 26.35, latitude: 38.1, zoom: 6.15, pitch: 12 }}
                  mapStyle={activeMapStyle as any}
                  attributionControl={false}
                  style={{ width: "100%", height: "100%" }}
                  minZoom={4.4}
                  maxZoom={10}
                />

                <div className="aqua-demo-map-overlay" aria-label="Demo Ege deniz veri katmanlari">
                  {activeLayers["fish-density"] || activeLayers["water-temperature"]
                    ? demoHeatmapAreas.map((area) => <span className={area.className} aria-label={area.label} key={area.id} />)
                    : null}

                  {activeLayers["protected-areas"] ? (
                    <svg className="aqua-demo-protected" viewBox="0 0 1000 620" aria-hidden>
                      <polygon points="310,105 395,88 428,158 366,202 292,170" />
                      <polygon points="642,352 728,338 758,410 681,448 618,410" />
                      <polygon points="410,420 494,392 540,448 486,504 396,482" />
                    </svg>
                  ) : null}

                  {activeLayers["current-direction"] ? (
                    <svg className="aqua-demo-currents" viewBox="0 0 1000 620" aria-hidden>
                      <path d="M150 245 C250 190 352 244 454 201 S640 187 742 126" />
                      <path d="M164 338 C274 286 382 360 506 308 S676 292 824 230" />
                      <path d="M228 455 C338 410 452 462 580 402 S744 388 870 326" />
                      <path d="M126 516 C246 482 354 528 476 490 S626 474 764 434" />
                    </svg>
                  ) : null}

                  {activeLayers.ports
                    ? demoPorts.map((port) => (
                        <span className="aqua-demo-port" style={port.style as CSSProperties} title={port.name} key={port.name}>
                          <Anchor size={13} />
                        </span>
                      ))
                    : null}

                  {demoMarkers.map((marker) => (
                    <button
                      type="button"
                      className={activeRegionIndex === marker.regionIndex ? "aqua-demo-marker is-selected" : "aqua-demo-marker"}
                      style={marker.style as CSSProperties}
                      onClick={() => focusRegion(marker.regionIndex)}
                      key={marker.name}
                    >
                      <span />
                      <strong>{marker.name}</strong>
                      <small>{marker.label}</small>
                    </button>
                  ))}
                </div>

                <div className="aqua-map-data-overlay" aria-hidden />
              </div>

              <div className="aqua-map-context-label">
                <strong>{selectedRegion.name}</strong>
                <span>{selectedRegion.coordinatesText}</span>
                <small>{liveSourceLabel}</small>
              </div>

              <div className="aqua-map-zoom">
                <button type="button" aria-label="Yakinlastir" onClick={() => mapRef.current?.zoomIn()}>
                  <Plus size={18} />
                </button>
                <button type="button" aria-label="Uzaklastir" onClick={() => mapRef.current?.zoomOut()}>
                  <Minus size={18} />
                </button>
                <button
                  type="button"
                  aria-label="Konuma git"
                  onClick={() => mapRef.current?.flyTo({ center: [26.35, 38.1], zoom: 6.15, duration: 900 })}
                >
                  <MapPin size={18} />
                </button>
                <button type="button" aria-label="Katmanlar" onClick={() => setIsLayerPanelOpen((current) => !current)}>
                  <Layers size={18} />
                </button>
              </div>

              <div className="aqua-map-scale-v2">
                <span>50 km</span>
              </div>

              <div className="aqua-map-timeline">
                <button
                  type="button"
                  className={isPlaying ? "aqua-timeline-play is-active" : "aqua-timeline-play"}
                  aria-label={isPlaying ? "Zaman cizelgesini duraklat" : "Zaman cizelgesini oynat"}
                  onClick={() => setIsPlaying((current) => !current)}
                >
                  <span className="aqua-timeline-play-icon aqua-timeline-play-icon--play" aria-hidden>
                    <Play size={18} />
                  </span>
                  <span className="aqua-timeline-play-icon aqua-timeline-play-icon--pause" aria-hidden>
                    <Pause size={18} />
                  </span>
                </button>
                <div
                  className={isPlaying ? "aqua-timeline-slider is-playing" : "aqua-timeline-slider"}
                  style={{ "--timeline-progress": `${(selectedDayIndex / (days.length - 1)) * 100}%` } as CSSProperties}
                >
                  <span className="aqua-timeline-wave" aria-hidden />
                  <div className="aqua-timeline-track">
                    {days.map((day) => (
                      <button type="button" className={day === selectedDay ? "is-active" : ""} onClick={() => setSelectedDay(day)} key={day}>
                        {day === selectedDay ? <em>{day}</em> : null}
                        <span>
                          <strong>{day.split(" ")[0]}</strong>
                          <small>{day.split(" ")[1]}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  className="aqua-timeline-live"
                  aria-label="Canli veriyi yenile"
                  onClick={() => {
                    const nextIndex = (days.indexOf(selectedDay) + 1) % days.length;
                    setSelectedDay(days[nextIndex]);
                  }}
                >
                  <Waves size={17} />
                  <span>
                    <strong>Canli</strong>
                    <small>{marineStatus === "loading" ? "Yukleniyor" : liveSourceLabel}</small>
                  </span>
                </button>
              </div>
            </section>
          </main>

          <aside className="aqua-region-panel">
            <section className="aqua-region-card">
              <div className="aqua-region-title">
                <span>Secili Bolge</span>
                <button
                  type="button"
                  className={favoriteRegion ? "is-favorite" : ""}
                  aria-label="Bolgeyi favorilere ekle"
                  onClick={() => setFavoriteRegion((current) => !current)}
                >
                  <Star size={18} />
                </button>
              </div>
              <h2>{selectedRegion.name}</h2>
              <p>{selectedRegion.coordinatesText}</p>
              <div className="aqua-region-preview">
                <span />
              </div>

              <nav className="aqua-region-tabs" aria-label="Bolge detay sekmeleri">
                {regionTabs.map((tab) => (
                  <button type="button" className={activeRegionTab === tab ? "is-active" : ""} onClick={() => setActiveRegionTab(tab)} key={tab}>
                    {tab}
                  </button>
                ))}
              </nav>

              <div className="aqua-region-metrics">
                <article>
                  <span>Balik Yogunlugu</span>
                  <strong>{selectedRegion.density}</strong>
                  <small>{selectedRegion.densityScore}</small>
                </article>
                <article>
                  <span>Su Sicakligi</span>
                  <strong>{marineConditions?.waterTemperature ?? selectedRegion.temperature}</strong>
                </article>
                <article>
                  <span>Klorofil Seviyesi</span>
                  <strong>{selectedRegion.chlorophyll}</strong>
                  <small>3.2 mg/m3</small>
                </article>
                <article>
                  <span>Akinti Hizi</span>
                  <strong>{selectedRegion.current}</strong>
                </article>
                <article>
                  <span>Dalga Yuksekligi</span>
                  <strong>{marineConditions?.waveHeight ?? selectedRegion.wave}</strong>
                </article>
                <article>
                  <span>Ruzgar Hizi</span>
                  <strong>{marineConditions?.windSpeed ?? selectedRegion.wind}</strong>
                </article>
              </div>
              <div className="aqua-region-tab-detail">
                <strong>{activeRegionTab}</strong>
                <span>
                  {activeRegionTab === "Ozet"
                    ? `${selectedRegion.name} icin ${selectedDay} verileri ${liveSourceLabel} kaynagi ile izleniyor.`
                    : activeRegionTab === "Canli Veriler"
                    ? `Dalga ${marineConditions?.waveHeight ?? selectedRegion.wave}, yon ${marineConditions?.waveDirection ?? "-"}, periyot ${marineConditions?.wavePeriod ?? "-"}, ruzgar ${marineConditions?.windSpeed ?? selectedRegion.wind}.`
                    : activeRegionTab === "Analiz"
                    ? `${selectedRegion.density} balik yogunlugu ve ${selectedRegion.chlorophyll.toLocaleLowerCase("tr-TR")} klorofil seviyesi raporlandi.`
                    : "Bu bolge icin saha notu eklenmedi."}
                </span>
              </div>
            </section>

            <section className="aqua-observation-card">
              <div className="aqua-observation-head">
                <h2>Son Gozlemler</h2>
                <a href="/platform/analyze">Tumunu Gor</a>
              </div>
              <div className="aqua-observation-list">
                {observations.map((item, index) => (
                  <article
                    className={index === selectedObservationIndex ? "is-selected" : ""}
                    key={item.name}
                    onClick={() => {
                      setSelectedObservationIndex(index);
                      focusRegion(index % mapRegions.length);
                    }}
                  >
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
              <div className="aqua-selected-observation">
                <span>Secili gozlem</span>
                <strong>{selectedObservation.name}</strong>
                <small>{selectedObservation.score} guven skoru ile {selectedObservation.time.toLocaleLowerCase("tr-TR")} kaydedildi.</small>
              </div>
              <a className="aqua-map-analysis-link" href="/platform/analyze">
                Detayli Analize Git
                <ChevronRight size={18} />
              </a>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}

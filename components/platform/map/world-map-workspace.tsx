"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Map, { Layer, Marker, Source, type MapRef } from "react-map-gl/maplibre";
import { circle, featureCollection, lineString, point, polygon as turfPolygon } from "@turf/turf";
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

const mapMetrics = [
  { icon: Thermometer, label: "Su Sicakligi", value: "18.6 C" },
  { icon: Wind, label: "Ruzgar", value: "12 kn" },
  { icon: Waves, label: "Dalga Yuksekligi", value: "0.3 m" },
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

const fishDensityData = [
  { position: [26.4142, 39.2326], weight: 78 },
  { position: [27.1428, 38.4237], weight: 52 },
  { position: [25.8947, 37.9838], weight: 61 },
  { position: [26.72, 38.18], weight: 86 },
  { position: [25.42, 38.62], weight: 68 },
  { position: [27.55, 36.91], weight: 74 },
  { position: [24.92, 37.55], weight: 58 },
  { position: [26.02, 40.02], weight: 92 },
] as const;

const currentPaths = [
  { path: [[24.2, 38.9], [24.9, 39.1], [25.7, 39.08], [26.25, 39.28]], speed: 0.8 },
  { path: [[25.1, 37.85], [25.9, 38.0], [26.8, 37.82], [27.44, 38.12]], speed: 0.7 },
  { path: [[24.7, 36.72], [25.6, 37.05], [26.58, 37.0], [27.6, 37.28]], speed: 0.9 },
  { path: [[23.9, 37.32], [24.65, 37.58], [25.3, 37.52], [26.05, 37.76]], speed: 0.6 },
] as const;

const protectedAreas = [
  {
    name: "Kuzey Ege Koruma Alani",
    polygon: [[25.86, 39.12], [26.62, 39.04], [26.72, 39.42], [26.12, 39.62], [25.86, 39.12]],
  },
  {
    name: "Bodrum Resif Bolgesi",
    polygon: [[27.18, 37.1], [27.82, 37.0], [27.74, 37.42], [27.24, 37.5], [27.18, 37.1]],
  },
  {
    name: "Kiklad Gecis Alani",
    polygon: [[24.2, 37.0], [24.82, 36.86], [25.02, 37.22], [24.36, 37.44], [24.2, 37.0]],
  },
] as const;

const portMarkers = [
  { name: "Izmir", coordinates: [27.14, 38.42] },
  { name: "Kusadasi", coordinates: [27.26, 37.86] },
  { name: "Bodrum", coordinates: [27.43, 37.03] },
  { name: "Rhodes", coordinates: [28.22, 36.43] },
] as const;

const days = ["12 May", "13 May", "14 May", "15 May", "16 May", "17 May", "18 May"];

const regionTabs = ["Ozet", "Canli Veriler", "Analiz", "Notlar"] as const;

const mapRegions = [
  {
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

export default function WorldMapWorkspace() {
  const mapRef = useRef<MapRef | null>(null);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>(
    Object.fromEntries(layerItems.map((layer) => [layer.id, layer.active]))
  );
  const [selectedDay, setSelectedDay] = useState("16 May");
  const [mapView, setMapView] = useState("Standart");
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeRegionIndex, setActiveRegionIndex] = useState(0);
  const [activeRegionTab, setActiveRegionTab] = useState<(typeof regionTabs)[number]>("Ozet");
  const [favoriteRegion, setFavoriteRegion] = useState(false);
  const [selectedObservationIndex, setSelectedObservationIndex] = useState(0);

  const selectedRegion = mapRegions[activeRegionIndex];
  const selectedObservation = observations[selectedObservationIndex];

  const activeMapStyle = useMemo(() => {
    const rasterPaint =
      mapView === "Uydu"
        ? { "raster-opacity": 0.92, "raster-saturation": -0.22, "raster-contrast": 0.22, "raster-brightness-min": 0.02, "raster-brightness-max": 0.74 }
        : mapView === "Koyu"
        ? { "raster-opacity": 0.86, "raster-saturation": -0.48, "raster-contrast": 0.24, "raster-brightness-min": 0, "raster-brightness-max": 0.62 }
        : { "raster-opacity": 0.9, "raster-saturation": -0.24, "raster-contrast": 0.2, "raster-brightness-min": 0.02, "raster-brightness-max": 0.72 };

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

  const mapData = useMemo(() => {
    const densityPoints = featureCollection(
      fishDensityData.map((item) => point([item.position[0], item.position[1]], { weight: item.weight }))
    );

    const temperatureZones = featureCollection(
      fishDensityData.map((item) =>
        circle([item.position[0], item.position[1]], 18 + item.weight / 7, {
          steps: 48,
          units: "kilometers",
          properties: { weight: item.weight },
        })
      )
    );

    const currents = featureCollection(
      currentPaths.map((item) => lineString(item.path.map(([longitude, latitude]) => [longitude, latitude]), { speed: item.speed }))
    );

    const currentParticles = featureCollection(
      currentPaths.flatMap((item) =>
        item.path.map(([longitude, latitude], index) => point([longitude, latitude], { speed: item.speed, index }))
      )
    );

    const protectedPolygons = featureCollection(
      protectedAreas.map((item) => turfPolygon([item.polygon.map(([longitude, latitude]) => [longitude, latitude])], { name: item.name }))
    );

    return { densityPoints, temperatureZones, currents, currentParticles, protectedPolygons };
  }, []);

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
                Katmanlari Yonet
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

              <div className="aqua-map-canvas-v2" aria-label="Ege Denizi veri haritasi">
                <Map
                  ref={mapRef}
                  initialViewState={{ longitude: 26.35, latitude: 38.1, zoom: 6.15, pitch: 12 }}
                  mapStyle={activeMapStyle as any}
                  attributionControl={false}
                  style={{ width: "100%", height: "100%" }}
                  minZoom={4.4}
                  maxZoom={10}
                >
                  {activeLayers["water-temperature"] ? (
                    <Source id="aqua-temperature-zones" type="geojson" data={mapData.temperatureZones}>
                      <Layer
                        id="aqua-temperature-fill"
                        type="fill"
                        paint={{
                          "fill-color": [
                            "interpolate",
                            ["linear"],
                            ["get", "weight"],
                            50,
                            "#1e90ff",
                            70,
                            "#00c996",
                            84,
                            "#ffd152",
                            94,
                            "#ff553e",
                          ],
                          "fill-opacity": 0.2,
                        }}
                      />
                    </Source>
                  ) : null}

                  {activeLayers["fish-density"] ? (
                    <Source id="aqua-fish-density" type="geojson" data={mapData.densityPoints}>
                      <Layer
                        id="aqua-fish-density-heat"
                        type="heatmap"
                        paint={{
                          "heatmap-weight": ["interpolate", ["linear"], ["get", "weight"], 0, 0, 100, 1],
                          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 4, 1.15, 8, 1.9],
                          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 4, 34, 8, 68],
                          "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 4, 0.66, 8, 0.78],
                          "heatmap-color": [
                            "interpolate",
                            ["linear"],
                            ["heatmap-density"],
                            0,
                            "rgba(0,0,0,0)",
                            0.16,
                            "rgba(34,211,238,0.18)",
                            0.34,
                            "rgba(34,211,238,0.48)",
                            0.56,
                            "rgba(0,201,150,0.62)",
                            0.74,
                            "rgba(255,161,62,0.72)",
                            0.94,
                            "rgba(255,72,60,0.78)",
                          ],
                        }}
                      />
                      <Layer
                        id="aqua-fish-density-points"
                        type="circle"
                        paint={{
                          "circle-radius": ["interpolate", ["linear"], ["get", "weight"], 50, 10, 100, 22],
                          "circle-color": [
                            "interpolate",
                            ["linear"],
                            ["get", "weight"],
                            52,
                            "rgba(34,211,238,0.28)",
                            76,
                            "rgba(0,201,150,0.36)",
                            92,
                            "rgba(255,88,72,0.44)",
                          ],
                          "circle-opacity": 0.34,
                          "circle-blur": 0.86,
                        }}
                      />
                    </Source>
                  ) : null}

                  {activeLayers["current-direction"] ? (
                    <>
                      <Source id="aqua-current-paths" type="geojson" data={mapData.currents}>
                        <Layer
                          id="aqua-current-path-line"
                          type="line"
                          layout={{
                            "line-cap": "round",
                            "line-join": "round",
                          }}
                          paint={{
                            "line-color": "#22d3ee",
                            "line-width": ["interpolate", ["linear"], ["get", "speed"], 0.5, 1.35, 1, 2.2],
                            "line-opacity": 0.65,
                            "line-blur": 0.18,
                          }}
                        />
                      </Source>
                      <Source id="aqua-current-particles" type="geojson" data={mapData.currentParticles}>
                        <Layer
                          id="aqua-current-particle-dots"
                          type="circle"
                          paint={{
                            "circle-radius": 2,
                            "circle-color": "#22d3ee",
                            "circle-opacity": 0.56,
                            "circle-blur": 0.22,
                          }}
                        />
                      </Source>
                    </>
                  ) : null}

                  {activeLayers["protected-areas"] ? (
                    <Source id="aqua-protected-areas" type="geojson" data={mapData.protectedPolygons}>
                      <Layer
                        id="aqua-protected-fill"
                        type="fill"
                        paint={{ "fill-color": "#00c996", "fill-opacity": 0.1 }}
                      />
                      <Layer
                        id="aqua-protected-outline"
                        type="line"
                        paint={{ "line-color": "#00c996", "line-width": 1.35, "line-opacity": 0.85, "line-dasharray": [6, 4] }}
                      />
                    </Source>
                  ) : null}

                  {activeLayers.ports
                    ? portMarkers.map((marker) => (
                        <Marker longitude={marker.coordinates[0]} latitude={marker.coordinates[1]} anchor="center" key={marker.name}>
                          <span className="aqua-map-port-marker" title={marker.name}>
                            <Anchor size={14} />
                          </span>
                        </Marker>
                      ))
                    : null}
                </Map>

                <div className="aqua-map-data-overlay" aria-hidden />
              </div>

              <div className="aqua-map-context-label">
                <strong>{selectedRegion.name}</strong>
                <span>{selectedRegion.coordinatesText}</span>
                <small>Canli veri simulasyonu</small>
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
                  className={isPlaying ? "is-active" : ""}
                  aria-label="Zaman cizelgesini oynat"
                  onClick={() => setIsPlaying((current) => !current)}
                >
                  <Play size={18} />
                </button>
                <div className="aqua-timeline-track">
                  {days.map((day) => (
                    <button type="button" className={day === selectedDay ? "is-active" : ""} onClick={() => setSelectedDay(day)} key={day}>
                      <span>{day}</span>
                      {day === selectedDay ? <small>Yogunluk yuksek</small> : null}
                    </button>
                  ))}
                </div>
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
                  <strong>{selectedRegion.temperature}</strong>
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
                  <strong>{selectedRegion.wave}</strong>
                </article>
                <article>
                  <span>Ruzgar Hizi</span>
                  <strong>{selectedRegion.wind}</strong>
                </article>
              </div>
              <div className="aqua-region-tab-detail">
                <strong>{activeRegionTab}</strong>
                <span>
                  {activeRegionTab === "Ozet"
                    ? `${selectedRegion.name} icin ${selectedDay} verileri guncel olarak izleniyor.`
                    : activeRegionTab === "Canli Veriler"
                    ? `Anlik sicaklik ${selectedRegion.temperature}, akinti ${selectedRegion.current}, ruzgar ${selectedRegion.wind}.`
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

"use client";

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import Map, { Layer, Marker, Source, type MapRef } from "react-map-gl/maplibre";
import {
  Anchor,
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
  LayoutDashboard,
  Map as MapIcon,
  LineChart,
  FileText,
  BrainCircuit,
  User,
  Settings,
} from "lucide-react";
import NotificationPopover from "../shell/notification-popover";

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

const fishDensityData = [
  { position: [26.4142, 39.2326], weight: 78 },
  { position: [27.1428, 38.4237], weight: 62 },
  { position: [25.8947, 37.9838], weight: 58 },
  { position: [26.72, 38.18], weight: 73 },
  { position: [25.42, 38.62], weight: 66 },
  { position: [27.55, 36.91], weight: 74 },
  { position: [24.92, 37.55], weight: 54 },
  { position: [26.02, 40.02], weight: 88 },
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

const regionMarkers = [
  { name: "Kuzey Ege", label: "%78", regionIndex: 0, coordinates: [26.4412, 39.2326] },
  { name: "Izmir Korfezi", label: "%62", regionIndex: 1, coordinates: [27.1428, 38.4237] },
  { name: "Bodrum Resifi", label: "%74", regionIndex: 2, coordinates: [27.4305, 37.0344] },
  { name: "Kiklad Gecisi", label: "%58", regionIndex: 0, coordinates: [25.25, 37.35] },
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

type MarineMapRegion = {
  id: string;
  name: string;
  coordinatesText: string;
  center: [number, number];
  density: string;
  densityScore: string;
  temperature: string;
  chlorophyll: string;
  current: string;
  wave: string;
  wind: string;
};

type MarineMapMarker = {
  name: string;
  label: string;
  coordinates: [number, number];
  region: MarineMapRegion;
};

type MarineMapData = {
  source?: "open-meteo" | "fallback" | "static";
  densityPoints: unknown;
  temperaturePoints: unknown;
  currents: unknown;
  protectedPolygons: unknown;
  ports: Array<{ name: string; coordinates: [number, number] }>;
  regions: MarineMapMarker[];
  isDynamic: boolean;
};

const toPointCollection = (items: ReadonlyArray<{ position: readonly [number, number] | readonly number[]; weight: number }>) => ({
  type: "FeatureCollection",
  features: items.map((item) => ({
    type: "Feature",
    properties: { weight: item.weight },
    geometry: { type: "Point", coordinates: item.position },
  })),
});

const toLineCollection = (items: ReadonlyArray<{ path: readonly (readonly number[])[]; speed: number }>) => ({
  type: "FeatureCollection",
  features: items.map((item) => ({
    type: "Feature",
    properties: { speed: item.speed },
    geometry: { type: "LineString", coordinates: item.path },
  })),
});

const toPolygonCollection = (items: ReadonlyArray<{ name: string; polygon: readonly (readonly number[])[] }>) => ({
  type: "FeatureCollection",
  features: items.map((item) => ({
    type: "Feature",
    properties: { name: item.name },
    geometry: { type: "Polygon", coordinates: [item.polygon] },
  })),
});

const staticMarineMapData: MarineMapData = {
  source: "static",
  densityPoints: toPointCollection(fishDensityData),
  temperaturePoints: toPointCollection(fishDensityData),
  currents: toLineCollection(currentPaths),
  protectedPolygons: toPolygonCollection(protectedAreas),
  ports: [...portMarkers] as Array<{ name: string; coordinates: [number, number] }>,
  regions: regionMarkers.map((marker) => ({
    name: marker.name,
    label: marker.label,
    coordinates: marker.coordinates as [number, number],
    region: mapRegions[marker.regionIndex] as MarineMapRegion,
  })),
  isDynamic: false,
};

const MIN_DYNAMIC_MAP_ZOOM = 5.15;

const formatMapCoordinates = ([longitude, latitude]: [number, number]) =>
  `${Math.abs(latitude).toFixed(4)} ${latitude >= 0 ? "N" : "S"}, ${Math.abs(longitude).toFixed(4)} ${longitude >= 0 ? "E" : "W"}`;

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
  const mapDataControllerRef = useRef<AbortController | null>(null);
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
  const [marineMapData, setMarineMapData] = useState<MarineMapData>(staticMarineMapData);
  const [viewportRegion, setViewportRegion] = useState<MarineMapRegion | null>(null);
  const [viewportZoom, setViewportZoom] = useState(6.15);

  const selectedRegion = viewportRegion ?? (mapRegions[activeRegionIndex] as MarineMapRegion);
  const selectedObservation = observations[selectedObservationIndex];
  const selectedDayIndex = Math.max(days.indexOf(selectedDay), 0);
  const liveSourceLabel =
    marineStatus === "loading"
      ? "Veri aliniyor"
      : marineConditions?.source === "open-meteo"
      ? "Open-Meteo Marine"
      : marineMapData.source === "fallback"
      ? "Deniz maskeli fallback"
      : marineMapData.isDynamic
      ? "Viewport marine verisi"
      : "Demo fallback";
  const floatingMetrics = [
    { icon: Thermometer, label: "Su Sicakligi", value: marineConditions?.waterTemperature ?? selectedRegion.temperature },
    { icon: Wind, label: "Ruzgar", value: marineConditions?.windSpeed ?? selectedRegion.wind },
    { icon: Waves, label: "Dalga", value: marineConditions?.waveHeight ?? selectedRegion.wave },
    { icon: Waves, label: "Akinti", value: selectedRegion.current },
    { icon: Layers, label: "Tuzluluk", value: "36.1 PSU" },
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
    const region = mapRegions[index] as MarineMapRegion;
    setActiveRegionIndex(index);
    setViewportRegion(null);
    mapRef.current?.flyTo({ center: region.center as [number, number], zoom: 7.25, duration: 850 });
  };

  const focusMarineRegion = (region: MarineMapRegion) => {
    setViewportRegion(region);
    mapRef.current?.flyTo({ center: region.center, zoom: Math.max(viewportZoom, 6.2), duration: 750 });
  };

  const refreshViewportMarineData = () => {
    const map = mapRef.current;
    if (!map) return;

    const mapInstance = map.getMap();
    const zoom = mapInstance.getZoom();
    setViewportZoom(zoom);
    mapDataControllerRef.current?.abort();

    if (zoom < MIN_DYNAMIC_MAP_ZOOM) {
      setMarineMapData(staticMarineMapData);
      setViewportRegion(null);
      return;
    }

    const bounds = mapInstance.getBounds();
    const viewportBounds = {
      west: bounds.getWest(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      north: bounds.getNorth(),
    };

    const controller = new AbortController();
    mapDataControllerRef.current = controller;
    const bbox = [viewportBounds.west, viewportBounds.south, viewportBounds.east, viewportBounds.north].map((value) => value.toFixed(4)).join(",");

    fetch(`/api/marine-map-data?bbox=${bbox}&zoom=${zoom.toFixed(2)}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Marine map data request failed");
        return response.json();
      })
      .then((nextData: MarineMapData) => {
        setMarineMapData(nextData);
        setViewportRegion((current) => {
          if (!nextData.regions.length) {
            const center: [number, number] = [
              (viewportBounds.west + viewportBounds.east) / 2,
              (viewportBounds.south + viewportBounds.north) / 2,
            ];

            return {
              id: "no-marine-data",
              name: "Deniz verisi bulunamadi",
              coordinatesText: formatMapCoordinates(center),
              center,
              density: "Yok",
              densityScore: "%0",
              temperature: "-",
              chlorophyll: "-",
              current: "-",
              wave: "-",
              wind: "-",
            };
          }

          if (current) {
            const [longitude, latitude] = current.center;
            const isStillVisible =
              longitude >= Math.min(viewportBounds.west, viewportBounds.east) &&
              longitude <= Math.max(viewportBounds.west, viewportBounds.east) &&
              latitude >= Math.min(viewportBounds.south, viewportBounds.north) &&
              latitude <= Math.max(viewportBounds.south, viewportBounds.north);

            if (isStillVisible) return current;
          }

          return nextData.regions[0]?.region ?? current;
        });
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
      });
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
    if (query.includes("japon") || query.includes("japan") || query.includes("tokyo")) {
      const region: MarineMapRegion = {
        id: "search-japan",
        name: "Japonya Deniz Alani",
        coordinatesText: "35.5500 N, 139.7800 E",
        center: [139.78, 35.55],
        density: "Orta",
        densityScore: "%68",
        temperature: "20.4 C",
        chlorophyll: "Orta",
        current: "0.8 m/s",
        wave: "0.9 m",
        wind: "13 kn",
      };
      setViewportRegion(region);
      mapRef.current?.flyTo({ center: region.center, zoom: 6.7, duration: 950 });
    }
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

  useEffect(() => () => mapDataControllerRef.current?.abort(), []);

  return (
    <section className={isExpanded ? "aqua-map-workspace is-expanded" : "aqua-map-workspace"}>



      <div className="aqua-map-screen">
        <header className="aqua-map-header">
          <div>
            <h1>Harita</h1>
            <p>Deniz sartlarini ve balik populasyonlarini anlik takip edin.</p>
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
            <NotificationPopover buttonClassName="aqua-map-icon-button" iconSize={18} />
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
              <div className="aqua-map-floating-toolbar aqua-glass-panel">
                <div className="aqua-map-live-status">
                  <span className="aqua-live-dot" />
                  <strong>Canli Veri</strong>
                  <small>14:32 Guncellendi</small>
                </div>
                <div className="aqua-map-metrics-divider" />
                {floatingMetrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <article key={metric.label} className="aqua-metric-item">
                      <Icon size={16} className="aqua-metric-icon" />
                      <div>
                        <span>{metric.label}</span>
                        <strong>{metric.value}</strong>
                      </div>
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
                  onLoad={refreshViewportMarineData}
                  onMoveEnd={refreshViewportMarineData}
                >
                  {activeLayers["water-temperature"] ? (
                    <Source id="aqua-temperature-points" type="geojson" data={marineMapData.temperaturePoints as any}>
                      <Layer
                        id="aqua-temperature-circles"
                        type="circle"
                        paint={{
                          "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 22, 8, 70],
                          "circle-color": [
                            "interpolate",
                            ["linear"],
                            ["get", "weight"],
                            52,
                            "rgba(34,211,238,0.22)",
                            72,
                            "rgba(0,201,150,0.28)",
                            88,
                            "rgba(255,161,62,0.34)",
                          ],
                          "circle-opacity": 0.58,
                          "circle-blur": 0.82,
                        }}
                      />
                    </Source>
                  ) : null}

                  {activeLayers["fish-density"] ? (
                    <Source id="aqua-fish-density" type="geojson" data={marineMapData.densityPoints as any}>
                      <Layer
                        id="aqua-fish-density-heat"
                        type="heatmap"
                        paint={{
                          "heatmap-weight": ["interpolate", ["linear"], ["get", "weight"], 0, 0, 100, 1],
                          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 4, 1.1, 8, 1.75],
                          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 4, 28, 8, 62],
                          "heatmap-opacity": 0.72,
                          "heatmap-color": [
                            "interpolate",
                            ["linear"],
                            ["heatmap-density"],
                            0,
                            "rgba(0,0,0,0)",
                            0.18,
                            "rgba(34,211,238,0.22)",
                            0.42,
                            "rgba(0,201,150,0.48)",
                            0.68,
                            "rgba(255,161,62,0.64)",
                            0.94,
                            "rgba(255,72,60,0.74)",
                          ],
                        }}
                      />
                    </Source>
                  ) : null}

                  {activeLayers["current-direction"] ? (
                    <Source id="aqua-current-paths" type="geojson" data={marineMapData.currents as any}>
                      <Layer
                        id="aqua-current-path-line"
                        type="line"
                        layout={{ "line-cap": "round", "line-join": "round" }}
                        paint={{
                          "line-color": "#22d3ee",
                          "line-width": ["interpolate", ["linear"], ["get", "speed"], 0.5, 1.4, 1, 2.4],
                          "line-opacity": 0.66,
                          "line-blur": 0.15,
                          "line-dasharray": [2.5, 2],
                        }}
                      />
                    </Source>
                  ) : null}

                  {activeLayers["protected-areas"] ? (
                    <Source id="aqua-protected-areas" type="geojson" data={marineMapData.protectedPolygons as any}>
                      <Layer
                        id="aqua-protected-fill"
                        type="fill"
                        paint={{ "fill-color": "#00c996", "fill-opacity": 0.1 }}
                      />
                      <Layer
                        id="aqua-protected-outline"
                        type="line"
                        paint={{ "line-color": "#00c996", "line-width": 1.4, "line-opacity": 0.82, "line-dasharray": [6, 4] }}
                      />
                    </Source>
                  ) : null}

                  {activeLayers.ports
                    ? marineMapData.ports.map((port) => (
                        <Marker longitude={port.coordinates[0]} latitude={port.coordinates[1]} anchor="center" key={port.name}>
                          <span className="aqua-map-port-marker" title={port.name}>
                            <Anchor size={13} />
                          </span>
                        </Marker>
                      ))
                    : null}

                  {marineMapData.regions.map((marker) => (
                    <Marker longitude={marker.coordinates[0]} latitude={marker.coordinates[1]} anchor="bottom" key={marker.name}>
                      <button
                        type="button"
                        className={selectedRegion.id === marker.region.id ? "aqua-map-region-marker is-selected" : "aqua-map-region-marker"}
                        onClick={() => focusMarineRegion(marker.region)}
                      >
                        <span />
                        <strong>{marker.name}</strong>
                        <small>{marker.label}</small>
                      </button>
                    </Marker>
                  ))}
                </Map>

                <div className="aqua-map-data-overlay" aria-hidden />
              </div>

              <div className="aqua-map-layer-dock aqua-glass-panel">
                {layerItems.map((item) => {
                  const Icon = item.icon;
                  const active = Boolean(activeLayers[item.id]);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`aqua-layer-pill ${active ? "is-active" : ""}`}
                      onClick={() => toggleLayer(item.id)}
                    >
                      <Icon size={16} />
                      <span>{item.title}</span>
                    </button>
                  );
                })}
                <div className="aqua-layer-dock-divider" />
                <button type="button" className="aqua-layer-pill aqua-layer-pill-add" onClick={() => setIsLayerPanelOpen((current) => !current)}>
                  <Plus size={16} />
                  <span>Katman Ekle</span>
                </button>
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

              <div className="aqua-map-timeline aqua-glass-panel">
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

          <aside className="aqua-region-panel aqua-glass-panel">
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

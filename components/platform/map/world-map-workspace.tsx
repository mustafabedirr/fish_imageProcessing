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
  ShipWheel,
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
  { id: "fish-density", icon: Fish, title: "Gozlem Kayitlari", low: "Yok", high: "Kayit", active: true, tone: "blue" },
  { id: "chlorophyll", icon: Leaf, title: "Klorofil Seviyesi", low: "Dusuk", high: "Yuksek", active: false, tone: "green" },
  { id: "protected-areas", icon: Shield, title: "Koruma Alanlari", low: "Resmi Bolgeler", high: "", active: true, tone: "green" },
  { id: "ports", icon: Anchor, title: "Limanlar", low: "Ticari Liman", high: "", active: true, tone: "blue" },
  { id: "marinas", icon: ShipWheel, title: "Marinalar", low: "Yat Limani", high: "", active: true, tone: "green" },
  { id: "weather", icon: CloudRain, title: "Hava Durumu", low: "Ruzgar & Yagis", high: "Anlik", active: true, tone: "muted" },
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
const days = ["12 May", "13 May", "14 May", "15 May", "16 May", "17 May", "18 May"];

const regionTabs = ["Ozet", "Canli Veriler", "Analiz", "Notlar"] as const;

const emptyMapRegion: MarineMapRegion = {
  id: "live-map",
  name: "Turkiye Deniz Alani",
  coordinatesText: "Gercek veri secilmedi",
  center: [29.0, 39.0],
  density: "Gercek gozlem yok",
  densityScore: "-",
  temperature: "Gercek veri yok",
  chlorophyll: "Gercek veri yok",
  current: "Gercek veri yok",
  wave: "Gercek veri yok",
  wind: "Gercek veri yok",
};

const mapRegions = [emptyMapRegion] as const;

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
  id: string;
  name: string;
  label: string;
  coordinates: [number, number];
  region: MarineMapRegion;
};

type MarineMapPort = { name: string; locode?: string; coordinates: [number, number] };

type MarineMapMarina = {
  name: string;
  city?: string;
  coordinates: [number, number];
  capacity?: string;
  maxDepth?: string;
  maxLength?: string;
  opened?: string;
};

type SelectedMapFacility =
  | ({ kind: "port" } & MarineMapPort)
  | ({ kind: "marina" } & MarineMapMarina);

type MarineMapData = {
  source?: "open-meteo" | "static" | "out-of-region" | "unavailable";
  densityPoints: unknown;
  temperaturePoints: unknown;
  weatherPoints: unknown;
  currents: unknown;
  protectedPolygons: unknown;
  ports: MarineMapPort[];
  marinas: MarineMapMarina[];
  regions: MarineMapMarker[];
  isDynamic: boolean;
};
const staticMarineMapData: MarineMapData = {
  source: "static",
  densityPoints: { type: "FeatureCollection", features: [] },
  temperaturePoints: { type: "FeatureCollection", features: [] },
  weatherPoints: { type: "FeatureCollection", features: [] },
  currents: { type: "FeatureCollection", features: [] },
  protectedPolygons: { type: "FeatureCollection", features: [] },
  ports: [],
  marinas: [],
  regions: [],
  isDynamic: false,
};
const MIN_DYNAMIC_MAP_ZOOM = 0;
const TURKEY_PREMIUM_VIEW_BOUNDS = {
  west: 23.1,
  south: 34.0,
  east: 45.2,
  north: 43.8,
};

type PremiumClearArea = {
  left: number;
  top: number;
  width: number;
  height: number;
};

const formatMapCoordinates = ([longitude, latitude]: [number, number]) =>
  `${Math.abs(latitude).toFixed(4)} ${latitude >= 0 ? "N" : "S"}, ${Math.abs(longitude).toFixed(4)} ${longitude >= 0 ? "E" : "W"}`;

type MarineConditions = {
  source: "open-meteo" | "unavailable";
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
  const [isRegionPanelOpen, setIsRegionPanelOpen] = useState(false);
  const [isLiveBarExpanded, setIsLiveBarExpanded] = useState(true);
  const [activeRegionIndex, setActiveRegionIndex] = useState(0);
  const [activeRegionTab, setActiveRegionTab] = useState<(typeof regionTabs)[number]>("Ozet");
  const [favoriteRegion, setFavoriteRegion] = useState(false);
  const [marineConditions, setMarineConditions] = useState<MarineConditions | null>(null);
  const [marineStatus, setMarineStatus] = useState<"loading" | "ready" | "unavailable">("loading");
  const [marineMapData, setMarineMapData] = useState<MarineMapData>(staticMarineMapData);
  const [viewportRegion, setViewportRegion] = useState<MarineMapRegion | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<SelectedMapFacility | null>(null);
  const [viewportZoom, setViewportZoom] = useState(6.15);
  const [premiumClearArea, setPremiumClearArea] = useState<PremiumClearArea | null>(null);

  const selectedRegion = viewportRegion ?? (mapRegions[activeRegionIndex] as MarineMapRegion);
  const selectedPanelCoordinates = selectedFacility?.coordinates ?? selectedRegion.center;
  const selectedPanelCoordinatesText = formatMapCoordinates(selectedPanelCoordinates);
  const isPremiumRegion = marineMapData.source === "out-of-region";
  const selectedDayIndex = Math.max(days.indexOf(selectedDay), 0);
  const liveSourceLabel =
    marineStatus === "loading"
      ? "Veri aliniyor"
      : marineConditions?.source === "open-meteo"
      ? "Open-Meteo Marine"
      : marineMapData.source === "out-of-region"
      ? "Turkiye disi veri kapali"
      : marineMapData.source === "unavailable" || marineStatus === "unavailable"
      ? "Gercek veri alinamadi"
      : marineMapData.isDynamic
      ? "Open-Meteo + NOAA + OBIS/GBIF"
      : "Veri bekleniyor";
  const floatingMetrics = [
    { icon: Thermometer, label: "Su Sicakligi", value: marineConditions?.waterTemperature ?? "Gercek veri yok" },
    { icon: CloudRain, label: "Hava", value: marineConditions?.airTemperature ?? "Gercek veri yok" },
    { icon: Wind, label: "Ruzgar", value: marineConditions?.windSpeed ?? "Gercek veri yok" },
    { icon: Waves, label: "Dalga", value: marineConditions?.waveHeight ?? "Gercek veri yok" },
    { icon: Layers, label: "Klorofil", value: selectedRegion.chlorophyll },
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
    setSelectedFacility(null);
    setIsRegionPanelOpen(true);
    mapRef.current?.flyTo({ center: region.center as [number, number], zoom: 7.25, duration: 850 });
  };

  const focusMarineRegion = (region: MarineMapRegion) => {
    setViewportRegion(region);
    setSelectedFacility(null);
    setIsRegionPanelOpen(true);
    mapRef.current?.flyTo({ center: region.center, zoom: Math.max(viewportZoom, 6.2), duration: 750 });
  };

  const focusMapFacility = (facility: SelectedMapFacility) => {
    setSelectedFacility(facility);
    setIsRegionPanelOpen(true);
    setActiveRegionTab("Ozet");
    mapRef.current?.flyTo({ center: facility.coordinates, zoom: Math.max(viewportZoom, 8.2), duration: 650 });
  };

  const updatePremiumClearArea = () => {
    const map = mapRef.current;
    if (!map) return;

    const mapInstance = map.getMap();
    const canvas = mapInstance.getCanvas();
    const northWest = mapInstance.project([TURKEY_PREMIUM_VIEW_BOUNDS.west, TURKEY_PREMIUM_VIEW_BOUNDS.north]);
    const southEast = mapInstance.project([TURKEY_PREMIUM_VIEW_BOUNDS.east, TURKEY_PREMIUM_VIEW_BOUNDS.south]);
    const rawLeft = Math.min(northWest.x, southEast.x);
    const rawRight = Math.max(northWest.x, southEast.x);
    const rawTop = Math.min(northWest.y, southEast.y);
    const rawBottom = Math.max(northWest.y, southEast.y);
    const left = Math.max(0, rawLeft);
    const top = Math.max(0, rawTop);
    const right = Math.min(canvas.clientWidth, rawRight);
    const bottom = Math.min(canvas.clientHeight, rawBottom);

    if (right <= 0 || bottom <= 0 || left >= canvas.clientWidth || top >= canvas.clientHeight || right <= left || bottom <= top) {
      setPremiumClearArea(null);
      return;
    }

    setPremiumClearArea({ left, top, width: right - left, height: bottom - top });
  };
  const refreshViewportMarineData = () => {
    const map = mapRef.current;
    if (!map) return;

    const mapInstance = map.getMap();
    const zoom = mapInstance.getZoom();
    updatePremiumClearArea();
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
              density: "Gercek gozlem yok",
              densityScore: "-",
              temperature: "Gercek veri yok",
              chlorophyll: "Gercek veri yok",
              current: "Gercek veri yok",
              wave: "Gercek veri yok",
              wind: "Gercek veri yok",
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

    if (query.includes("turkiye") || query.includes("ege") || query.includes("akdeniz")) focusRegion(0);
    if (query.includes("karadeniz")) mapRef.current?.flyTo({ center: [34.8, 42.0], zoom: 6.25, duration: 950 });
  };

  const applyFilterPreset = (preset: "density" | "environment" | "navigation") => {
    setActiveLayers((current) => ({
      ...current,
      "fish-density": preset !== "navigation",
      chlorophyll: preset === "environment",
      "protected-areas": preset !== "density",
      ports: preset === "navigation",
      marinas: preset === "navigation",
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
        setMarineStatus(data.source === "open-meteo" ? "ready" : "unavailable");
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setMarineConditions(null);
        setMarineStatus("unavailable");
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
                <button type="button" onClick={() => applyFilterPreset("density")}>Gozlem odagi</button>
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
              <div className={isLiveBarExpanded ? "aqua-map-floating-toolbar aqua-glass-panel is-expanded" : "aqua-map-floating-toolbar aqua-glass-panel is-collapsed"}>
                <button
                  type="button"
                  className="aqua-map-live-toggle"
                  aria-expanded={isLiveBarExpanded}
                  onClick={() => setIsLiveBarExpanded((current) => !current)}
                >
                  <span className="aqua-live-dot" />
                  <span>
                    <strong>Canli Veri</strong>
                    <small>{isLiveBarExpanded ? "14:32 Guncellendi" : liveSourceLabel}</small>
                  </span>
                  <ChevronRight size={15} />
                </button>
                {isLiveBarExpanded ? (
                  <>
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
                  </>
                ) : null}
              </div>

              <div className={isPremiumRegion ? "aqua-map-canvas-v2 is-premium-locked" : "aqua-map-canvas-v2"} aria-label="Ege Denizi veri haritasi">
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


                  {activeLayers.weather ? (
                    <Source id="aqua-weather-points" type="geojson" data={marineMapData.weatherPoints as any}>
                      <Layer
                        id="aqua-weather-temperature-circles"
                        type="circle"
                        paint={{
                          "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 12, 8, 34],
                          "circle-color": [
                            "interpolate",
                            ["linear"],
                            ["get", "temperature"],
                            5,
                            "rgba(56,189,248,0.16)",
                            18,
                            "rgba(34,211,238,0.22)",
                            28,
                            "rgba(255,161,62,0.32)",
                            36,
                            "rgba(255,72,60,0.42)",
                          ],
                          "circle-opacity": 0.62,
                          "circle-blur": 0.64,
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
                          "heatmap-weight": 1,
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


                  {activeLayers.weather
                    ? ((marineMapData.weatherPoints as any)?.features ?? []).map((feature: any, index: number) => {
                        const [longitude, latitude] = feature.geometry?.coordinates ?? [];
                        const properties = feature.properties ?? {};
                        if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null;

                        const weatherTitle = [
                          `Hava: ${Number(properties.temperature).toFixed(1)} C`,
                          `Ruzgar: ${Number(properties.windSpeed).toFixed(0)} kn`,
                          `Nem: %${Number(properties.humidity).toFixed(0)}`,
                          `Yagis: ${Number(properties.precipitation).toFixed(1)} mm`,
                          properties.isDay === 1 ? "Gunduz" : "Gece",
                        ].join(" | ");

                        return (
                          <Marker longitude={longitude} latitude={latitude} anchor="center" key={`weather-${longitude}-${latitude}-${index}`}>
                            <span className="aqua-map-weather-marker" title={weatherTitle}>
                              <CloudRain size={13} />
                            </span>
                          </Marker>
                        );
                      })
                    : null}
                  {activeLayers.ports
                    ? marineMapData.ports.map((port) => (
                        <Marker longitude={port.coordinates[0]} latitude={port.coordinates[1]} anchor="center" key={`${port.name}-${port.coordinates[0]}-${port.coordinates[1]}`}>
                          <button type="button" className="aqua-map-port-marker" title={port.locode ? `${port.name} (${port.locode})` : port.name} onClick={() => focusMapFacility({ ...port, kind: "port" })}>
                            <Anchor size={13} />
                          </button>
                        </Marker>
                      ))
                    : null}

                  {activeLayers.marinas
                    ? marineMapData.marinas.map((marina) => {
                        const marinaTitle = [
                          marina.name,
                          marina.city,
                          marina.capacity ? `Kapasite: ${marina.capacity}` : undefined,
                          marina.maxDepth ? `Derinlik: ${marina.maxDepth}` : undefined,
                          marina.maxLength ? `Uzunluk: ${marina.maxLength}` : undefined,
                        ]
                          .filter(Boolean)
                          .join(" | ");

                        return (
                          <Marker longitude={marina.coordinates[0]} latitude={marina.coordinates[1]} anchor="center" key={`${marina.name}-${marina.coordinates[0]}-${marina.coordinates[1]}`}>
                            <button type="button" className="aqua-map-marina-marker" title={marinaTitle} onClick={() => focusMapFacility({ ...marina, kind: "marina" })}>
                              <ShipWheel size={14} />
                            </button>
                          </Marker>
                        );
                      })
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
                {isPremiumRegion ? (
                  <div className="aqua-map-premium-mask" aria-hidden>
                    {premiumClearArea ? (
                      <>
                        <span className="aqua-map-premium-blur-segment" style={{ left: 0, top: 0, right: 0, height: premiumClearArea.top }} />
                        <span className="aqua-map-premium-blur-segment" style={{ left: 0, top: premiumClearArea.top + premiumClearArea.height, right: 0, bottom: 0 }} />
                        <span className="aqua-map-premium-blur-segment" style={{ left: 0, top: premiumClearArea.top, width: premiumClearArea.left, height: premiumClearArea.height }} />
                        <span className="aqua-map-premium-blur-segment" style={{ left: premiumClearArea.left + premiumClearArea.width, top: premiumClearArea.top, right: 0, height: premiumClearArea.height }} />
                      </>
                    ) : (
                      <span className="aqua-map-premium-blur-segment" style={{ inset: 0 }} />
                    )}
                  </div>
                ) : null}
                {isPremiumRegion ? (
                  <div className="aqua-map-premium-overlay" role="status" aria-live="polite">
                    <div>
                      <Shield size={22} />
                      <strong>Premium harita alani</strong>
                      <span>Gercek zamanli veri katmanlari su anda Turkiye ve cevresi icin acik. Diger bolgeler premium uyelik ile kullanilabilir.</span>
                    </div>
                  </div>
                ) : null}
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
                <strong>{selectedFacility?.name ?? selectedRegion.name}</strong>
                <span>{selectedFacility ? selectedPanelCoordinatesText : selectedRegion.coordinatesText}</span>
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

          <aside className={isRegionPanelOpen ? "aqua-region-panel aqua-glass-panel is-open" : "aqua-region-panel aqua-glass-panel"} aria-hidden={!isRegionPanelOpen}>
            <section className="aqua-region-card">
              <div className="aqua-region-title">
                <span>{selectedFacility ? (selectedFacility.kind === "port" ? "Secili Liman" : "Secili Marina") : "Secili Bolge"}</span>
                <div className="aqua-region-title-actions">
                  <button
                    type="button"
                    className={favoriteRegion ? "is-favorite" : ""}
                    aria-label="Bolgeyi favorilere ekle"
                    onClick={() => setFavoriteRegion((current) => !current)}
                  >
                    <Star size={18} />
                  </button>
                  <button type="button" aria-label="Bolge panelini kapat" onClick={() => setIsRegionPanelOpen(false)}>
                    <X size={17} />
                  </button>
                </div>
              </div>
              <h2>{selectedFacility?.name ?? selectedRegion.name}</h2>
              <p>{selectedFacility ? selectedPanelCoordinatesText : selectedRegion.coordinatesText}</p>
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

              {selectedFacility ? (
                <>
                  <div className="aqua-region-metrics">
                    <article>
                      <span>Tur</span>
                      <strong>{selectedFacility.kind === "port" ? "Liman" : "Marina"}</strong>
                      {selectedFacility.kind === "port" && selectedFacility.locode ? <small>{selectedFacility.locode}</small> : null}
                    </article>
                    <article>
                      <span>Koordinat</span>
                      <strong>{selectedPanelCoordinatesText}</strong>
                    </article>
                    <article>
                      <span>Sehir</span>
                      <strong>{selectedFacility.kind === "marina" ? selectedFacility.city ?? "-" : "-"}</strong>
                    </article>
                    <article>
                      <span>Kapasite</span>
                      <strong>{selectedFacility.kind === "marina" ? selectedFacility.capacity ?? "-" : "-"}</strong>
                    </article>
                    <article>
                      <span>Maks. Derinlik</span>
                      <strong>{selectedFacility.kind === "marina" ? selectedFacility.maxDepth ?? "-" : "-"}</strong>
                    </article>
                    <article>
                      <span>Maks. Uzunluk</span>
                      <strong>{selectedFacility.kind === "marina" ? selectedFacility.maxLength ?? "-" : "-"}</strong>
                    </article>
                  </div>
                  <div className="aqua-region-tab-detail">
                    <strong>{selectedFacility.kind === "port" ? "Liman Bilgisi" : "Marina Bilgisi"}</strong>
                    <span>
                      {selectedFacility.kind === "port"
                        ? `${selectedFacility.name}${selectedFacility.locode ? ` (${selectedFacility.locode})` : ""} harita uzerinde secildi.`
                        : `${selectedFacility.name}${selectedFacility.city ? `, ${selectedFacility.city}` : ""}${selectedFacility.opened ? `, acilis ${selectedFacility.opened}` : ""}.`}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="aqua-region-metrics">
                    <article>
                      <span>Gozlem Durumu</span>
                      <strong>{selectedRegion.density}</strong>
                      <small>{selectedRegion.densityScore}</small>
                    </article>
                    <article>
                      <span>Su Sicakligi</span>
                      <strong>{marineConditions?.waterTemperature ?? "Gercek veri yok"}</strong>
                    </article>
                    <article>
                      <span>Klorofil Seviyesi</span>
                      <strong>{selectedRegion.chlorophyll}</strong>
                    </article>
                    <article>
                      <span>Akinti Hizi</span>
                      <strong>{selectedRegion.current}</strong>
                    </article>
                    <article>
                      <span>Dalga Yuksekligi</span>
                      <strong>{marineConditions?.waveHeight ?? "Gercek veri yok"}</strong>
                    </article>
                    <article>
                      <span>Ruzgar Hizi</span>
                      <strong>{marineConditions?.windSpeed ?? "Gercek veri yok"}</strong>
                    </article>
                  </div>
                  <div className="aqua-region-tab-detail">
                    <strong>{activeRegionTab}</strong>
                    <span>
                      {activeRegionTab === "Ozet"
                        ? `${selectedRegion.name} icin ${selectedDay} verileri ${liveSourceLabel} kaynagi ile izleniyor.`
                        : activeRegionTab === "Canli Veriler"
                        ? `Dalga ${marineConditions?.waveHeight ?? "Gercek veri yok"}, yon ${marineConditions?.waveDirection ?? "Gercek veri yok"}, periyot ${marineConditions?.wavePeriod ?? "Gercek veri yok"}, ruzgar ${marineConditions?.windSpeed ?? "Gercek veri yok"}.`
                        : activeRegionTab === "Analiz"
                        ? `${selectedRegion.density} durumu ve ${selectedRegion.chlorophyll.toLocaleLowerCase("tr-TR")} klorofil seviyesi raporlandi.`
                        : "Bu bolge icin saha notu eklenmedi."}
                    </span>
                  </div>
                </>
              )}
            </section>

            <section className="aqua-observation-card">
              <div className="aqua-observation-head">
                <h2>Son Gozlemler</h2>
                <a href="/platform/analyze">Tumunu Gor</a>
              </div>
              <div className="aqua-observation-list">
                {marineMapData.regions.length ? (
                  marineMapData.regions.map((item) => (
                    <article key={item.id} onClick={() => focusMarineRegion(item.region)}>
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.region.coordinatesText}</span>
                        <small>{item.label}</small>
                      </div>
                      <b>{item.label}</b>
                      <ChevronRight size={18} />
                    </article>
                  ))
                ) : (
                  <article className="is-empty">
                    <div>
                      <strong>Gercek gozlem yok</strong>
                      <span>OBIS/GBIF kaydi bulunamadi.</span>
                      <small>Sadece gercek kaynaklar gosterilir.</small>
                    </div>
                  </article>
                )}
              </div>
              <div className="aqua-selected-observation">
                <span>Secili gozlem</span>
                <strong>{marineMapData.regions[0]?.name ?? "Gercek gozlem yok"}</strong>
                <small>{marineMapData.regions[0]?.label ?? "OBIS/GBIF kaydi bekleniyor."}</small>
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

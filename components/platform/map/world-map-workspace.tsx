"use client";

import { useMemo, useRef, useState } from "react";
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
        "raster-opacity": 0.74,
        "raster-saturation": -0.58,
        "raster-contrast": 0.18,
        "raster-brightness-min": 0.02,
        "raster-brightness-max": 0.74,
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

export default function WorldMapWorkspace() {
  const mapRef = useRef<MapRef | null>(null);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>(
    Object.fromEntries(layerItems.map((layer) => [layer.id, layer.active]))
  );
  const [selectedDay, setSelectedDay] = useState("16 May");
  const [mapView, setMapView] = useState("Standart");

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

  return (
    <section className="aqua-map-workspace">
      <div className="aqua-map-screen">
        <header className="aqua-map-header">
          <div>
            <h1>Harita</h1>
            <p>Bolgeleri kesfedin, verileri goruntuleyin ve analiz edin.</p>
          </div>

          <div className="aqua-map-actions">
            <label className="aqua-map-search">
              <Search size={18} />
              <input type="search" placeholder="Konum, bolge veya koordinat ara..." />
              <span>Ctrl K</span>
            </label>
            <button type="button">
              <Filter size={18} />
              Filtreler
            </button>
            <button type="button" className="aqua-map-icon-button" aria-label="Bildirimler">
              <Bell size={18} />
              <b>3</b>
            </button>
            <button type="button">
              <Layers size={18} />
              Veri Katmanlari
            </button>
            <button type="button" className="aqua-map-icon-button" aria-label="Tam ekran">
              <Expand size={18} />
            </button>
          </div>
        </header>

        <div className="aqua-map-content">
          <aside className="aqua-layer-panel">
            <div className="aqua-panel-title">
              <h2>Veri Katmanlari</h2>
              <button type="button" aria-label="Katman panelini kapat">x</button>
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
              <button type="button">
                12 Mayis - 18 Mayis 2024
                <CalendarDays size={16} />
              </button>
            </label>

            <button type="button" className="aqua-manage-layers">
              Katmanlari Yonet
            </button>
          </aside>

          <main className="aqua-map-stage">
            <section className="aqua-map-viewport">
              <div className="aqua-map-metric-strip">
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
                  mapStyle={mapStyle as any}
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
                          "heatmap-intensity": 1.65,
                          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 4, 18, 8, 42],
                          "heatmap-opacity": 0.88,
                          "heatmap-color": [
                            "interpolate",
                            ["linear"],
                            ["heatmap-density"],
                            0,
                            "rgba(0,0,0,0)",
                            0.18,
                            "rgba(30,144,255,0.35)",
                            0.38,
                            "rgba(0,201,150,0.55)",
                            0.62,
                            "rgba(255,209,82,0.78)",
                            0.86,
                            "rgba(255,82,73,0.88)",
                          ],
                        }}
                      />
                      <Layer
                        id="aqua-fish-density-points"
                        type="circle"
                        paint={{
                          "circle-radius": ["interpolate", ["linear"], ["get", "weight"], 50, 3, 100, 7],
                          "circle-color": "#73e7ff",
                          "circle-opacity": 0.72,
                          "circle-blur": 0.28,
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
                          paint={{
                            "line-color": "#1e90ff",
                            "line-width": ["interpolate", ["linear"], ["get", "speed"], 0.5, 1.4, 1, 3],
                            "line-opacity": 0.55,
                            "line-blur": 0.35,
                          }}
                        />
                      </Source>
                      <Source id="aqua-current-particles" type="geojson" data={mapData.currentParticles}>
                        <Layer
                          id="aqua-current-particle-dots"
                          type="circle"
                          paint={{
                            "circle-radius": 2.2,
                            "circle-color": "#22d3ee",
                            "circle-opacity": 0.82,
                            "circle-blur": 0.12,
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
                        paint={{ "fill-color": "#00c996", "fill-opacity": 0.13 }}
                      />
                      <Layer
                        id="aqua-protected-outline"
                        type="line"
                        paint={{ "line-color": "#00e0a7", "line-width": 1.5, "line-opacity": 0.74 }}
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
                <button type="button" aria-label="Katmanlar">
                  <Layers size={18} />
                </button>
              </div>

              <div className="aqua-map-scale-v2">
                <span>50 km</span>
              </div>

              <div className="aqua-map-timeline">
                <button type="button" aria-label="Zaman cizelgesini oynat" onClick={() => setSelectedDay("18 May")}>
                  <Play size={18} />
                </button>
                <div className="aqua-timeline-track">
                  {days.map((day) => (
                    <button type="button" className={day === selectedDay ? "is-active" : ""} onClick={() => setSelectedDay(day)} key={day}>
                      {day}
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
                <Star size={18} />
              </div>
              <h2>Kuzey Ege Bolgesi</h2>
              <p>39.2326 N, 26.4412 E</p>
              <div className="aqua-region-preview">
                <span />
              </div>

              <nav className="aqua-region-tabs" aria-label="Bolge detay sekmeleri">
                <button type="button" className="is-active">Ozet</button>
                <button type="button">Canli Veriler</button>
                <button type="button">Analiz</button>
                <button type="button">Notlar</button>
              </nav>

              <div className="aqua-region-metrics">
                <article>
                  <span>Balik Yogunlugu</span>
                  <strong>Yuksek</strong>
                  <small>%78</small>
                </article>
                <article>
                  <span>Su Sicakligi</span>
                  <strong>18.6 C</strong>
                </article>
                <article>
                  <span>Klorofil Seviyesi</span>
                  <strong>Orta</strong>
                  <small>3.2 mg/m3</small>
                </article>
                <article>
                  <span>Akinti Hizi</span>
                  <strong>0.8 m/s</strong>
                </article>
                <article>
                  <span>Dalga Yuksekligi</span>
                  <strong>0.3 m</strong>
                </article>
                <article>
                  <span>Ruzgar Hizi</span>
                  <strong>12 kn</strong>
                </article>
              </div>
            </section>

            <section className="aqua-observation-card">
              <div className="aqua-observation-head">
                <h2>Son Gozlemler</h2>
                <a href="/platform/analyze">Tumunu Gor</a>
              </div>
              <div className="aqua-observation-list">
                {observations.map((item) => (
                  <article key={item.name}>
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

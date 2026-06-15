"use client";

import { useMemo, type ElementType } from "react";
import Map, { Layer, Source } from "react-map-gl/maplibre";
import { area, circle, featureCollection, point } from "@turf/turf";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CloudUpload,
  Database,
  Download,
  Fish,
  Gauge,
  Layers,
  Maximize2,
  Satellite,
  Search,
  Thermometer,
  UserRound,
  Waves,
} from "lucide-react";
import NotificationPopover from "../shell/notification-popover";

const fishImages = [
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=260&q=80",
  "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=260&q=80",
  "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=260&q=80",
  "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=260&q=80",
  "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=260&q=80",
];

const stats = [
  { label: "Toplam Analiz", value: "10.482", delta: "%18.6", icon: Gauge, tone: "blue" },
  { label: "Tespit Edilen Tur", value: "350+", delta: "%12.4", icon: Fish, tone: "green" },
  { label: "Veri Seti", value: "1.245", delta: "%9.7", icon: Database, tone: "purple" },
  { label: "Aktif Kullanici", value: "532", delta: "%15.3", icon: UserRound, tone: "blue" },
];

const speciesShare = [
  { name: "Levrek", value: 35, color: "#1e90ff" },
  { name: "Cupra", value: 22, color: "#13b7ff" },
  { name: "Palamut", value: 18, color: "#5d7cff" },
  { name: "Hamsi", value: 15, color: "#7c3aed" },
  { name: "Diger", value: 10, color: "#20c8b2" },
];

const trendData = [
  { day: "12 May", value: 820 },
  { day: "13 May", value: 1120 },
  { day: "14 May", value: 930 },
  { day: "15 May", value: 1510 },
  { day: "16 May", value: 1260 },
  { day: "17 May", value: 880 },
  { day: "18 May", value: 1180 },
];

const barData = [
  { name: "Levrek", value: 2010 },
  { name: "Cupra", value: 1640 },
  { name: "Palamut", value: 1420 },
  { name: "Hamsi", value: 1160 },
  { name: "Orkinos", value: 840 },
  { name: "Lufer", value: 590 },
  { name: "Istavrit", value: 410 },
  { name: "Diger", value: 260 },
];

const conditionData = [
  { day: "12 May", temp: 18.6, salt: 31.8 },
  { day: "13 May", temp: 18.1, salt: 30.9 },
  { day: "14 May", temp: 18.7, salt: 32.4 },
  { day: "15 May", temp: 18.2, salt: 31.6 },
  { day: "16 May", temp: 18.9, salt: 33.1 },
  { day: "17 May", temp: 18.0, salt: 30.8 },
  { day: "18 May", temp: 18.6, salt: 32.2 },
];

const recentAnalyses = [
  ["Levrek", "Dicentrarchus labrax", "Bugun 14:32", "%95.4"],
  ["Cupra", "Sparus aurata", "Bugun 10:15", "%92.1"],
  ["Palamut", "Sarda sarda", "Dun 18:45", "%91.3"],
  ["Hamsi", "Engraulis encrasicolus", "Dun 16:22", "%93.7"],
  ["Orkinos", "Thunnus thynnus", "11 Mayis 13:05", "%94.2"],
];

const sources = [
  { label: "Kamera Tuzaklari", value: "842 / 1.200", ratio: 70, icon: Gauge, tone: "cyan" },
  { label: "Mobil Uygulama", value: "1.245 / 2.000", ratio: 62, icon: UserRound, tone: "amber" },
  { label: "Uydu Verisi", value: "320 / 500", ratio: 64, icon: Satellite, tone: "blue" },
  { label: "Manuel Yukleme", value: "210 / 300", ratio: 70, icon: CloudUpload, tone: "purple" },
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
    { id: "carto-dark", type: "raster", source: "carto-dark", paint: { "raster-opacity": 0.68, "raster-saturation": -0.45 } },
  ],
};

const cityPoints = [
  [29.02, 41.0, 94],
  [2.35, 48.85, 72],
  [-74.0, 40.71, 86],
  [-46.63, -23.55, 63],
  [139.69, 35.68, 98],
  [151.2, -33.86, 70],
  [103.82, 1.35, 84],
  [31.23, 30.04, 58],
  [-0.12, 51.5, 75],
  [116.4, 39.9, 81],
] as const;

export default function DashboardWorkspace() {
  const mapData = useMemo(() => {
    const points = featureCollection(
      cityPoints.map(([longitude, latitude, density]) =>
        point([longitude, latitude], { density, radius: 7 + density / 10 })
      )
    );
    const zones = featureCollection(
      cityPoints.map(([longitude, latitude, density]) =>
        circle([longitude, latitude], density > 80 ? 920 : 620, {
          steps: 48,
          units: "kilometers",
          properties: { density, influence: Math.round(area(circle([longitude, latitude], 120, { units: "kilometers" })) / 1000000) },
        })
      )
    );

    return { points, zones };
  }, []);

  return (
    <section className="aqua-dashboard-page">
      <header className="aqua-dashboard-topbar">
        <div className="aqua-dashboard-title">
          <h1>Dashboard</h1>
          <span>Ozet gorunum ve gunluk istatistikler</span>
        </div>

        <label className="aqua-dashboard-search">
          <Search size={18} />
          <input placeholder="Ara (tur, bolge, analiz...)" aria-label="Dashboard arama" />
          <kbd>Ctrl K</kbd>
        </label>

        <div className="aqua-dashboard-actions">
          <button type="button" className="aqua-dashboard-upload">
            <CloudUpload size={18} />
            Veri Yukle
          </button>
          <NotificationPopover buttonClassName="aqua-dashboard-bell" iconSize={20} />
          <button type="button" className="aqua-dashboard-user">
            <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80" alt="" />
            <span>
              <strong>Derya Yilmaz</strong>
              <small>Analist</small>
            </span>
            <ChevronDown size={16} />
          </button>
        </div>
      </header>

      <div className="aqua-dashboard-main">
        <main className="aqua-dashboard-center">
          <section className="aqua-stat-grid">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <article className="aqua-stat-card" key={item.label}>
                  <span className={`aqua-stat-icon aqua-stat-icon--${item.tone}`}>
                    <Icon size={25} />
                  </span>
                  <div>
                    <p>{item.label}</p>
                    <strong>{item.value}</strong>
                    <small>+ {item.delta}</small>
                    <em>Gecen haftaya gore</em>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="aqua-dashboard-grid">
            <article className="aqua-panel aqua-map-panel">
              <PanelHeader title="Tur Dagilimi Haritasi" action="Tum Turler" />
              <div className="aqua-map-shell">
                <Map
                  initialViewState={{ longitude: 22, latitude: 18, zoom: 1.05 }}
                  mapStyle={mapStyle as any}
                  interactive={false}
                  attributionControl={false}
                  style={{ width: "100%", height: "100%" }}
                >
                  <Source id="aqua-density-zones" type="geojson" data={mapData.zones}>
                    <Layer
                      id="aqua-density-zone-fill"
                      type="fill"
                      paint={{
                        "fill-color": "#0ea5ff",
                        "fill-opacity": ["interpolate", ["linear"], ["get", "density"], 50, 0.06, 100, 0.22],
                      }}
                    />
                  </Source>
                  <Source id="aqua-density-points" type="geojson" data={mapData.points}>
                    <Layer
                      id="aqua-density-points-glow"
                      type="circle"
                      paint={{
                        "circle-radius": ["interpolate", ["linear"], ["get", "density"], 50, 4, 100, 10],
                        "circle-color": "#18a8ff",
                        "circle-blur": 0.72,
                        "circle-opacity": 0.92,
                      }}
                    />
                    <Layer
                      id="aqua-density-points-core"
                      type="circle"
                      paint={{
                        "circle-radius": 2.2,
                        "circle-color": "#82eaff",
                        "circle-opacity": 1,
                      }}
                    />
                  </Source>
                </Map>
                <div className="aqua-map-overlay" aria-hidden />
                <div className="aqua-map-controls">
                  <button type="button" aria-label="Zoom in">+</button>
                  <button type="button" aria-label="Zoom out">-</button>
                  <button type="button" aria-label="Layers"><Layers size={18} /></button>
                </div>
                <button type="button" className="aqua-map-expand" aria-label="Haritayi genislet">
                  <Maximize2 size={17} />
                </button>
                <div className="aqua-map-scale">
                  <span>Yogunluk</span>
                  <div />
                  <small>Dusuk</small>
                  <small>Yuksek</small>
                </div>
              </div>
            </article>

            <article className="aqua-panel aqua-donut-panel">
              <PanelHeader title="Tur Dagilimi" action="Tumunu Gor" />
              <div className="aqua-donut-wrap">
                <ResponsiveContainer width="56%" height={230}>
                  <PieChart>
                    <Pie data={speciesShare} innerRadius={62} outerRadius={94} paddingAngle={0} dataKey="value" stroke="none">
                      {speciesShare.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="aqua-donut-center">
                  <strong>350+</strong>
                  <span>Toplam Tur</span>
                </div>
                <ul className="aqua-chart-legend">
                  {speciesShare.map((item) => (
                    <li key={item.name}>
                      <i style={{ background: item.color }} />
                      <span>{item.name}</span>
                      <strong>% {item.value}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            <article className="aqua-panel aqua-trend-panel">
              <PanelHeader title="Analiz Trendi" action="Gunluk" />
              <div className="aqua-chart-frame aqua-chart-frame--trend">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ left: -22, right: 8, top: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1e90ff" stopOpacity={0.58} />
                        <stop offset="100%" stopColor="#1e90ff" stopOpacity={0.04} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(124,160,204,.12)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: "#8aa5c7", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#8aa5c7", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="value" stroke="#1e90ff" strokeWidth={3} fill="url(#trendFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>

          <section className="aqua-dashboard-bottom">
            <article className="aqua-panel aqua-bar-panel">
              <PanelHeader title="Turlere Gore Analiz Dagilimi" action="Tumunu Gor" />
              <div className="aqua-chart-frame aqua-chart-frame--bar">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ left: -22, right: 8, top: 8, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(124,160,204,.12)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "#91a9c8", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#91a9c8", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" radius={[5, 5, 0, 0]} fill="#1e90ff">
                      {barData.map((item, index) => (
                        <Cell key={item.name} fill={index === barData.length - 1 ? "#64748b" : "#1e90ff"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="aqua-panel aqua-condition-panel">
              <PanelHeader title="Ortam Kosullari" action="Tumunu Gor" />
              <div className="aqua-condition-stats">
                <Metric icon={Thermometer} label="Su Sicakligi" value="18.6 C" delta="1.3 C" tone="blue" />
                <Metric icon={Waves} label="Tuzluluk" value="36.2 PSU" delta="0.4" tone="cyan" />
                <Metric icon={Thermometer} label="pH Degeri" value="8.1" delta="0.2" tone="red" />
              </div>
              <div className="aqua-chart-frame aqua-chart-frame--condition">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={conditionData} margin={{ left: -22, right: 8, top: 12, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(124,160,204,.12)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: "#91a9c8", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fill: "#91a9c8", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: "#91a9c8", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#1e90ff" strokeWidth={2.5} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="salt" stroke="#00c996" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>
        </main>

        <aside className="aqua-dashboard-rail">
          <div className="aqua-rail-filters">
            <button type="button"><CalendarDays size={16} />12 Mayis - 18 Mayis 2024<ChevronDown size={15} /></button>
            <button type="button"><Download size={16} />Disa Aktar<ChevronDown size={15} /></button>
          </div>

          <article className="aqua-panel aqua-recent-panel">
            <PanelHeader title="Son Analizler" action="Tumunu Gor" />
            <div className="aqua-recent-list">
              {recentAnalyses.map((item, index) => (
                <div className="aqua-recent-row" key={item[0]}>
                  <img src={fishImages[index]} alt="" />
                  <span>
                    <strong>{item[0]}</strong>
                    <small>{item[1]}</small>
                    <em>{item[2]}</em>
                  </span>
                  <b>{item[3]}</b>
                  <ChevronRight size={17} />
                </div>
              ))}
            </div>
          </article>

          <article className="aqua-panel aqua-ai-panel">
            <PanelHeader title="AI Destekli Oneriler" action="Tumunu Gor" />
            <div className="aqua-radar-card">
              <div className="aqua-radar" />
              <div>
                <p>Bu hafta Levrek analizlerinde <strong>%18.6 artis</strong> gozlemlendi.</p>
                <span>Daha fazla detay icin rapora goz atabilirsiniz.</span>
                <button type="button">Raporu Incele</button>
              </div>
            </div>
            <div className="aqua-ai-dots"><span /><span /><span /></div>
          </article>

          <article className="aqua-panel aqua-sources-panel">
            <h2>Veri Kaynaklari</h2>
            <div className="aqua-source-list">
              {sources.map((item) => {
                const Icon = item.icon;
                return (
                  <div className="aqua-source-row" key={item.label}>
                    <span className={`aqua-source-icon aqua-source-icon--${item.tone}`}>
                      <Icon size={18} />
                    </span>
                    <strong>{item.label}</strong>
                    <div className="aqua-source-meter">
                      <i style={{ width: `${item.ratio}%` }} />
                    </div>
                    <small>{item.value}</small>
                    <em>%{item.ratio}</em>
                  </div>
                );
              })}
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}

function PanelHeader({ title, action }: { title: string; action: string }) {
  return (
    <div className="aqua-panel-head">
      <h2>{title}</h2>
      <button type="button">{action}<ChevronDown size={15} /></button>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  delta,
  tone,
}: {
  icon: ElementType;
  label: string;
  value: string;
  delta: string;
  tone: string;
}) {
  return (
    <div className="aqua-condition-metric">
      <span className={`aqua-source-icon aqua-source-icon--${tone}`}>
        <Icon size={18} />
      </span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <em>+ {delta}</em>
      </div>
    </div>
  );
}

const tooltipStyle = {
  border: "1px solid rgba(78, 127, 190, 0.28)",
  borderRadius: 10,
  background: "rgba(5, 18, 36, 0.96)",
  color: "#f8fbff",
  boxShadow: "0 16px 40px rgba(0, 8, 24, 0.34)",
};

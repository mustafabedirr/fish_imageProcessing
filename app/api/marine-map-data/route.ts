import { NextRequest, NextResponse } from "next/server";

type MarinePoint = {
  position: [number, number];
  temperature: number;
  waveHeight: number;
  waveDirection: number;
  wavePeriod: number;
  windSpeed: number;
  airTemperature: number;
  relativeHumidity: number;
  precipitation: number;
  weatherCode: number;
  isDay: boolean;
  currentVelocity: number;
  currentDirection: number;
  chlorophyllMgM3?: number | null;
};

type MarineRegion = {
  id: string;
  name: string;
  label: string;
  coordinates: [number, number];
  region: {
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
};


type SpeciesObservation = {
  id: string;
  source: "OBIS" | "GBIF";
  scientificName: string;
  commonName?: string;
  eventDate?: string;
  coordinates: [number, number];
};

type TurkeyPort = {
  name: string;
  locode?: string;
  coordinates: [number, number];
};

const TURKEY_PORTS: TurkeyPort[] = [
  { name: "Alia\u011fa Liman\u0131", locode: "TRALI", coordinates: [26.9492, 38.8175] },
  { name: "Alida\u015f Liman\u0131 (Alanya)", locode: "TRALA", coordinates: [32.0, 36.5333] },
  { name: "Alt\u0131ntel Liman\u0131 (Kocaeli)", locode: "TRALT", coordinates: [29.5406, 40.7678] },
  { name: "Ambarl\u0131 Liman\u0131", locode: "TRPAM", coordinates: [28.6911, 40.965] },
  { name: "Antalya Liman\u0131", locode: "TRAYT", coordinates: [30.6061, 36.8342] },
  { name: "Ayval\u0131k Liman\u0131", locode: "TRAVY", coordinates: [26.6914, 39.32] },
  { name: "Band\u0131rma Liman\u0131", locode: "TRBDM", coordinates: [27.9614, 40.3542] },
  { name: "Bart\u0131n Liman\u0131", locode: "TRBTN", coordinates: [32.2286, 41.6864] },
  { name: "Bodrum Liman\u0131", locode: "TRBXN", coordinates: [27.4294, 37.0297] },
  { name: "Bota\u015f (Ceyhan) Liman\u0131", locode: "TRBOT", coordinates: [35.9311, 36.875] },
  { name: "\u00c7anakkale Liman\u0131", locode: "TRCKZ", coordinates: [26.525, 40.2647] },
  { name: "\u00c7e\u015fme Liman\u0131", locode: "TRCES", coordinates: [26.2967, 38.3231] },
  { name: "Derince Liman\u0131", locode: "TRDRC", coordinates: [29.8336, 40.7489] },
  { name: "Dikili Liman\u0131", locode: "TRDIK", coordinates: [26.8867, 39.0706] },
  { name: "Fethiye Liman\u0131", locode: "TRFET", coordinates: [29.1028, 36.6261] },
  { name: "Filyos Liman\u0131", coordinates: [32.0214, 41.5647] },
  { name: "Finike Liman\u0131", locode: "TRFIN", coordinates: [30.1525, 36.2939] },
  { name: "Gemlik Liman\u0131 (Bursa)", locode: "TRGEM", coordinates: [29.1167, 40.4178] },
  { name: "Giresun Liman\u0131", locode: "TRGIR", coordinates: [38.3822, 40.9178] },
  { name: "G\u00fcll\u00fck Liman\u0131", locode: "TRGUL", coordinates: [27.6058, 37.2539] },
  { name: "Haydarpa\u015fa Liman\u0131", locode: "TRHAY", coordinates: [28.9583, 41.0008] },
  { name: "Hopa Liman\u0131", locode: "TRHOP", coordinates: [41.4311, 41.4269] },
  { name: "\u0130nebolu Liman\u0131", locode: "TRINE", coordinates: [33.7675, 41.9794] },
  { name: "\u0130skenderun Liman\u0131", locode: "TRISK", coordinates: [36.1833, 36.5833] },
  { name: "\u0130stanbul Liman\u0131", locode: "TRIST", coordinates: [28.9783, 41.0228] },
  { name: "\u0130zmir Liman\u0131", locode: "TRIZM", coordinates: [27.1525, 38.4422] },
  { name: "Karadeniz Ere\u011fli Liman\u0131", locode: "TRERE", coordinates: [31.3958, 41.2967] },
  { name: "Karasu Liman\u0131", locode: "TRKSP", coordinates: [30.6769, 41.1214] },
  { name: "Ku\u015fadas\u0131 Liman\u0131", locode: "TRKUS", coordinates: [27.2553, 37.8622] },
  { name: "Marmaris Liman\u0131", locode: "TRMRM", coordinates: [28.28, 36.85] },
  { name: "Mersin Liman\u0131", locode: "TRMER", coordinates: [34.6167, 36.7833] },
  { name: "Nemrut Liman\u0131 (Nemport)", locode: "TRNEM", coordinates: [26.9239, 38.7769] },
  { name: "Ordu Liman\u0131", locode: "TRORD", coordinates: [37.8767, 40.9958] },
  { name: "Ortado\u011fu Liman\u0131 (Antalya)", locode: "TRAYT", coordinates: [30.6, 36.8333] },
  { name: "Rize Liman\u0131", locode: "TRRIZ", coordinates: [40.5119, 41.0378] },
  { name: "Samsun Liman\u0131", locode: "TRSSX", coordinates: [36.3444, 41.2997] },
  { name: "Sinop Liman\u0131", locode: "TRSIC", coordinates: [35.1483, 42.0233] },
  { name: "Ta\u015fucu Liman\u0131", locode: "TRTAS", coordinates: [33.8847, 36.3128] },
  { name: "Tekirda\u011f Liman\u0131", locode: "TRTEK", coordinates: [27.5028, 40.9642] },
  { name: "Trabzon Liman\u0131", locode: "TRTZX", coordinates: [39.7378, 41.0022] },
  { name: "Ye\u015filovac\u0131k Medcem Liman\u0131", locode: "TRYIK", coordinates: [33.6603, 36.185] },
  { name: "Zeytinburnu Liman\u0131 (Zeyport)", locode: "TRZEY", coordinates: [28.8956, 40.9803] },
  { name: "Zonguldak Liman\u0131", locode: "TRZON", coordinates: [31.7847, 41.4569] },
];

type TurkeyMarina = {
  name: string;
  city?: string;
  coordinates: [number, number];
  capacity?: string;
  maxDepth?: string;
  maxLength?: string;
  opened?: string;
};

const TURKEY_MARINAS: TurkeyMarina[] = [
  { name: "Atak\u00f6y Marina", city: "\u0130stanbul", coordinates: [28.8819, 40.9728], opened: "1986", capacity: "805 Deniz / 40 Kara", maxLength: "100 m" },
  { name: "Setur Kalam\u0131\u015f-Fenerbah\u00e7e Marina", city: "\u0130stanbul", coordinates: [29.0358, 40.9769], capacity: "1278 Deniz / 220 Kara", maxDepth: "6.50 m", maxLength: "65 m" },
  { name: "Marint\u00fcrk \u0130stanbul City Port", city: "\u0130stanbul", coordinates: [29.2397, 40.8678], capacity: "752" },
  { name: "Viaport Tuzla Marina", city: "\u0130stanbul", coordinates: [29.32, 40.8142], opened: "2015", capacity: "750", maxLength: "80 m" },
  { name: "\u0130stmarin \u0130stinye Tekne Park", city: "\u0130stanbul", coordinates: [29.0564, 41.1128], capacity: "188", maxDepth: "3.5 m", maxLength: "30 m" },
  { name: "\u0130stmarin Tarabya Tekne Park", city: "\u0130stanbul", coordinates: [29.0625, 41.1417], capacity: "265", maxDepth: "3.5 m", maxLength: "16 m" },
  { name: "Setur Yalova Marina", city: "Yalova", coordinates: [29.2745, 40.6614], opened: "2010", capacity: "225 Deniz / 70 Kara", maxDepth: "5 m", maxLength: "30 m" },
  { name: "Setur Ayval\u0131k Marina", city: "Bal\u0131kesir", coordinates: [26.6879, 39.3141], capacity: "229 Deniz / 80 Kara", maxDepth: "4.70 m", maxLength: "40 m" },
  { name: "Setur \u00c7e\u015fme Marina", city: "\u0130zmir", coordinates: [26.3456, 38.3237], opened: "1978", capacity: "186 Deniz / 15 Kara", maxDepth: "4 m", maxLength: "45 m" },
  { name: "\u0130zmir Marina", city: "\u0130zmir", coordinates: [27.0683, 38.4064], opened: "1987" },
  { name: "IC \u00c7e\u015fme Marina", city: "\u0130zmir", coordinates: [26.3022, 38.3233], opened: "2008", capacity: "400 Deniz / 100 Kara", maxLength: "60 m" },
  { name: "Port Ala\u00e7at\u0131 Marina", city: "\u0130zmir", coordinates: [26.3872, 38.2556], capacity: "250 Deniz / 80 Kara", maxDepth: "4 m", maxLength: "35 m" },
  { name: "Teos Marina", city: "\u0130zmir", coordinates: [26.7825, 38.1958], opened: "2010", capacity: "480 Deniz / 80 Kara", maxDepth: "7.25 m" },
  { name: "D-Marin Didim", city: "Ayd\u0131n", coordinates: [27.2594, 37.3406], capacity: "576", maxDepth: "6 m", maxLength: "70 m" },
  { name: "Marmaris Adak\u00f6y Marina", city: "Mu\u011fla", coordinates: [28.2933, 36.8186], capacity: "200", maxDepth: "6.5 m", maxLength: "150 m" },
  { name: "Setur Marmaris Marina", city: "Mu\u011fla", coordinates: [28.2772, 36.8506], capacity: "701 Deniz / 130 Kara", maxDepth: "18 m", maxLength: "90 m" },
  { name: "D-Marin Turgutreis", city: "Mu\u011fla", coordinates: [27.2553, 36.9992], capacity: "532", maxDepth: "25 m", maxLength: "75 m" },
  { name: "Yal\u0131kavak Marina", city: "Mu\u011fla", coordinates: [27.282972, 37.107692], capacity: "620", maxLength: "140 m" },
  { name: "Milta Bodrum Marina", city: "Mu\u011fla", coordinates: [27.4306, 37.0333], capacity: "425 Deniz / 30 Kara" },
  { name: "Aganlar Marina", city: "Mu\u011fla", coordinates: [27.451233, 37.013639], maxDepth: "11.50 m", maxLength: "100 m" },
  { name: "Yat Lift \u0130\u00e7meler Marina", city: "Mu\u011fla", coordinates: [27.4514, 37.02], opened: "1982", capacity: "300" },
  { name: "G\u00f6cek Marina", city: "Mu\u011fla", coordinates: [28.9467, 36.7544], capacity: "150" },
  { name: "D-Marin G\u00f6cek", city: "Mu\u011fla", coordinates: [28.9433, 36.7483], capacity: "380", maxLength: "70 m" },
  { name: "Marint\u00fcrk G\u00f6cek Exclusive Marina", city: "Mu\u011fla", coordinates: [28.9237, 36.7441] },
  { name: "Marint\u00fcrk G\u00f6cek Village Port", city: "Mu\u011fla", coordinates: [28.9331, 36.7561] },
  { name: "G\u00f6cek Club Marina", city: "Mu\u011fla", coordinates: [28.9264, 36.75], opened: "1990" },
  { name: "Fethiye Belediyesi Yat Liman\u0131", city: "Mu\u011fla", coordinates: [29.0902, 36.6201] },
  { name: "Ece Saray Marina", city: "Mu\u011fla", coordinates: [29.1014, 36.6229], opened: "2016", capacity: "460", maxLength: "60 m" },
  { name: "G\u00f6kova \u00d6ren Marina", city: "Mu\u011fla", coordinates: [27.981972, 37.031417], opened: "2015", capacity: "416 Deniz / 130 Kara", maxDepth: "8.50 m", maxLength: "40 m" },
  { name: "Port Iasos Marina", city: "Mu\u011fla", coordinates: [27.5372, 37.2483], opened: "2013", capacity: "150" },
  { name: "G\u00fcll\u00fck Egesu Marina", city: "Mu\u011fla", coordinates: [27.5858, 37.2308], opened: "2016", capacity: "350" },
  { name: "Gazipa\u015fa Gold Marina", city: "Antalya", coordinates: [32.279983, 36.263767], opened: "2024", capacity: "208 Deniz / 100 Kara", maxDepth: "4 m", maxLength: "40 m" },
  { name: "Kalei\u00e7i Yat Liman\u0131", city: "Antalya", coordinates: [30.7014, 36.8848], capacity: "100", maxDepth: "8 m" },
  { name: "Setur Antalya Marina", city: "Antalya", coordinates: [30.6148, 36.8348], opened: "1991", capacity: "235 Deniz / 150 Kara", maxDepth: "5.50 m", maxLength: "90 m" },
  { name: "Setur Finike Marina", city: "Antalya", coordinates: [30.1526, 36.2947], opened: "1997", capacity: "284 Deniz / 100 Kara", maxDepth: "5 m", maxLength: "50 m" },
  { name: "Setur Ka\u015f Marina", city: "Antalya", coordinates: [29.6242, 36.2053], capacity: "438 Deniz / 120 Kara", maxDepth: "30 m", maxLength: "120 m" },
  { name: "Ka\u015f Yat Liman\u0131", city: "Antalya", coordinates: [29.6256, 36.2119] },
  { name: "Kalkan Yat Liman\u0131", city: "Antalya", coordinates: [29.41375, 36.2630] },
  { name: "Alanya Marina", city: "Antalya", coordinates: [29.6025, 36.2014], opened: "2011", capacity: "287 Deniz / 150 Kara", maxDepth: "7.20 m", maxLength: "30 m" },
  { name: "G Marina Kemer", city: "Antalya", coordinates: [30.5733, 36.5996], opened: "2016", capacity: "230 Deniz / 140 Kara", maxDepth: "5 m", maxLength: "30 m" },
  { name: "Mersin Marina", city: "Mersin", coordinates: [34.5756, 36.7717], opened: "2011", capacity: "500 Deniz / 500 Kara" },
  { name: "Kumkuyu Marina", city: "Mersin", coordinates: [34.2279, 36.5296], opened: "2015", capacity: "200" },
];

type TurkeyProtectedArea = {
  name: string;
  region: string;
  center: [number, number];
  areaKm2: number;
};

const TURKEY_COASTAL_PROTECTED_AREAS: TurkeyProtectedArea[] = [
  { name: "Belek OCKB", region: "Antalya, Serik-Manavgat kiyisi", center: [31.13, 36.84], areaKm2: 111.79 },
  { name: "Foca OCKB", region: "Izmir, Foca kiyilari ve adalar", center: [26.75, 38.67], areaKm2: 71.44 },
  { name: "Datca-Bozburun OCKB", region: "Mugla, Datca ve Bozburun yarimadalari", center: [28.05, 36.74], areaKm2: 1443.89 },
  { name: "Fethiye-Gocek OCKB", region: "Mugla, Fethiye-Gocek-Oludeniz", center: [29.05, 36.66], areaKm2: 805.37 },
  { name: "Gokova OCKB", region: "Mugla, Gokova Korfezi-Akyaka", center: [28.25, 37.03], areaKm2: 1092.79 },
  { name: "Goksu Deltasi OCKB", region: "Mersin, Silifke-Goksu Deltasi", center: [33.99, 36.29], areaKm2: 228.5 },
  { name: "Kas-Kekova OCKB", region: "Antalya, Kas-Demre-Kekova", center: [29.78, 36.2], areaKm2: 257.83 },
  { name: "Koycegiz-Dalyan OCKB", region: "Mugla, Koycegiz-Dalyan-Iztuzu", center: [28.64, 36.84], areaKm2: 461.46 },
  { name: "Patara OCKB", region: "Antalya/Mugla, Kas-Fethiye siniri", center: [29.3, 36.27], areaKm2: 197.1 },
  { name: "Saros Korfezi OCKB", region: "Edirne-Canakkale, Saros Korfezi", center: [26.59, 40.61], areaKm2: 730.21 },
  { name: "Finike Denizalti Daglari OCKB", region: "Antalya aciklari", center: [30.2, 35.95], areaKm2: 11228.85 },
  { name: "Karaburun-Ildir Korfezi OCKB", region: "Izmir, Karaburun Yarimadasi-Ildir Korfezi", center: [26.47, 38.55], areaKm2: 945.87 },
  { name: "Marmara Denizi ve Adalar OCKB", region: "Marmara Denizi, Adalar ve Turk Bogazlar sistemi", center: [28.05, 40.73], areaKm2: 12246 },
];
type OverpassElement = {
  id: number;
  type: "node" | "way" | "relation";
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
  geometry?: Array<{ lat: number; lon: number }>;
};

const TURKEY_MARINE_BOUNDS = {
  west: 23.1,
  south: 34.0,
  east: 45.2,
  north: 43.8,
};

const TURKEY_SEA_BOXES = [
  [23.1, 34.0, 30.2, 41.4],
  [29.0, 35.0, 36.5, 37.2],
  [26.0, 40.0, 30.4, 41.4],
  [28.0, 40.8, 42.4, 43.8],
  [35.2, 35.1, 36.8, 36.8],
] as const;

const emptyFeatureCollection = { type: "FeatureCollection", features: [] };
const NOAA_CHLOROPHYLL_DATASET_ID = "noaacwNPPN20S3ASCIDINEOF2kmDaily";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const formatCoordinates = ([longitude, latitude]: [number, number]) =>
  `${Math.abs(latitude).toFixed(4)} ${latitude >= 0 ? "N" : "S"}, ${Math.abs(longitude).toFixed(4)} ${longitude >= 0 ? "E" : "W"}`;

const isInBox = (longitude: number, latitude: number, west: number, south: number, east: number, north: number) =>
  longitude >= west && longitude <= east && latitude >= south && latitude <= north;

const intersectsTurkeyMarineBounds = (bounds: NonNullable<ReturnType<typeof parseBounds>>) =>
  bounds.maxLon >= TURKEY_MARINE_BOUNDS.west &&
  bounds.minLon <= TURKEY_MARINE_BOUNDS.east &&
  bounds.maxLat >= TURKEY_MARINE_BOUNDS.south &&
  bounds.minLat <= TURKEY_MARINE_BOUNDS.north;

const isTurkeyMarinePoint = (longitude: number, latitude: number) =>
  TURKEY_SEA_BOXES.some(([west, south, east, north]) => isInBox(longitude, latitude, west, south, east, north));

const getViewportName = ([longitude, latitude]: [number, number]) => {
  if (longitude >= 28 && longitude <= 42.4 && latitude >= 40.8) return "Karadeniz Kiyilari";
  if (longitude >= 26 && longitude <= 30.4 && latitude >= 40) return "Marmara Denizi";
  if (longitude >= 29 && longitude <= 36.8 && latitude <= 37.4) return "Akdeniz Kiyilari";
  if (longitude >= 23.1 && longitude <= 30.2) return "Ege Denizi";
  return "Turkiye Deniz Alani";
};


const toWeatherPointCollection = (items: MarinePoint[]) => ({
  type: "FeatureCollection",
  features: items.map((item) => ({
    type: "Feature",
    properties: {
      temperature: item.airTemperature,
      humidity: item.relativeHumidity,
      precipitation: item.precipitation,
      weatherCode: item.weatherCode,
      isDay: item.isDay ? 1 : 0,
      windSpeed: item.windSpeed,
    },
    geometry: { type: "Point", coordinates: item.position },
  })),
});

const toLineCollection = (items: MarinePoint[]) => ({
  type: "FeatureCollection",
  features: items.slice(0, 8).map((item) => {
    const [longitude, latitude] = item.position;
    const radians = ((item.currentDirection || 0) * Math.PI) / 180;
    const distance = 0.22;
    const dx = Math.sin(radians) * distance;
    const dy = Math.cos(radians) * distance * 0.62;

    return {
      type: "Feature",
      properties: { speed: Number(Math.max(0.2, item.currentVelocity).toFixed(2)) },
      geometry: {
        type: "LineString",
        coordinates: [
          [Number((longitude - dx).toFixed(4)), Number((latitude - dy).toFixed(4))],
          [Number(longitude.toFixed(4)), Number(latitude.toFixed(4))],
          [Number((longitude + dx).toFixed(4)), Number((latitude + dy).toFixed(4))],
        ],
      },
    };
  }),
});

const toPolygonCollection = (items: Array<{ name: string; polygon: Array<[number, number]> }>) => ({
  type: "FeatureCollection",
  features: items.map((item) => ({
    type: "Feature",
    properties: { name: item.name },
    geometry: { type: "Polygon", coordinates: [item.polygon] },
  })),
});

const buildRegions = (items: MarinePoint[], observations: SpeciesObservation[] = []): MarineRegion[] =>
  observations.slice(0, 8).map((observation) => {
    const nearestPoint = items.reduce<MarinePoint | null>((nearest, item) => {
      if (!nearest) return item;
      const [obsLon, obsLat] = observation.coordinates;
      const [itemLon, itemLat] = item.position;
      const [nearLon, nearLat] = nearest.position;
      const itemDistance = Math.abs(obsLon - itemLon) + Math.abs(obsLat - itemLat);
      const nearestDistance = Math.abs(obsLon - nearLon) + Math.abs(obsLat - nearLat);
      return itemDistance < nearestDistance ? item : nearest;
    }, null);

    return {
      id: observation.id,
      name: observation.commonName ?? observation.scientificName,
      label: observation.source,
      coordinates: observation.coordinates,
      region: {
        id: `observation-${observation.id}`,
        name: observation.commonName ?? observation.scientificName,
        coordinatesText: formatCoordinates(observation.coordinates),
        center: observation.coordinates,
        density: "Gercek gozlem",
        densityScore: observation.source,
        temperature: nearestPoint ? `${nearestPoint.temperature.toFixed(1)} C` : "Gercek veri yok",
        chlorophyll: nearestPoint?.chlorophyllMgM3 != null ? `${nearestPoint.chlorophyllMgM3.toFixed(2)} mg/m3` : "Gercek veri yok",
        current: nearestPoint ? `${nearestPoint.currentVelocity.toFixed(1)} kn / ${nearestPoint.currentDirection.toFixed(0)} deg` : "Gercek veri yok",
        wave: nearestPoint ? `${nearestPoint.waveHeight.toFixed(1)} m` : "Gercek veri yok",
        wind: nearestPoint ? `${nearestPoint.windSpeed.toFixed(0)} kn` : "Gercek veri yok",
      },
    };
  });

const sampleOpenMeteoPoint = async (longitude: number, latitude: number): Promise<MarinePoint | null> => {
  const marineUrl = new URL("https://marine-api.open-meteo.com/v1/marine");
  marineUrl.searchParams.set("latitude", String(latitude));
  marineUrl.searchParams.set("longitude", String(longitude));
  marineUrl.searchParams.set("current", "wave_height,wave_direction,wave_period,sea_surface_temperature,ocean_current_velocity,ocean_current_direction");
  marineUrl.searchParams.set("velocity_unit", "kn");
  marineUrl.searchParams.set("timezone", "auto");

  const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
  forecastUrl.searchParams.set("latitude", String(latitude));
  forecastUrl.searchParams.set("longitude", String(longitude));
  forecastUrl.searchParams.set("current", "temperature_2m,relative_humidity_2m,precipitation,weather_code,is_day,wind_speed_10m");
  forecastUrl.searchParams.set("wind_speed_unit", "kn");
  forecastUrl.searchParams.set("timezone", "auto");

  const [marineResponse, forecastResponse] = await Promise.all([
    fetch(marineUrl, { cache: "no-store", signal: AbortSignal.timeout(3200) }),
    fetch(forecastUrl, { cache: "no-store", signal: AbortSignal.timeout(3200) }),
  ]);

  if (!marineResponse.ok || !forecastResponse.ok) return null;

  const [marine, forecast] = await Promise.all([marineResponse.json(), forecastResponse.json()]);
  const waveHeight = Number(marine?.current?.wave_height);
  const waveDirection = Number(marine?.current?.wave_direction);
  const wavePeriod = Number(marine?.current?.wave_period);
  const seaSurfaceTemperature = Number(marine?.current?.sea_surface_temperature);
  const windSpeed = Number(forecast?.current?.wind_speed_10m);
  const airTemperature = Number(forecast?.current?.temperature_2m);
  const relativeHumidity = Number(forecast?.current?.relative_humidity_2m);
  const precipitation = Number(forecast?.current?.precipitation);
  const weatherCode = Number(forecast?.current?.weather_code);
  const isDay = Number(forecast?.current?.is_day);
  const currentVelocity = Number(marine?.current?.ocean_current_velocity);
  const currentDirection = Number(marine?.current?.ocean_current_direction);

  if (
    !Number.isFinite(waveHeight) ||
    !Number.isFinite(waveDirection) ||
    !Number.isFinite(wavePeriod) ||
    !Number.isFinite(seaSurfaceTemperature) ||
    !Number.isFinite(windSpeed) ||
    !Number.isFinite(airTemperature) ||
    !Number.isFinite(relativeHumidity) ||
    !Number.isFinite(precipitation) ||
    !Number.isFinite(weatherCode) ||
    !Number.isFinite(isDay) ||
    !Number.isFinite(currentVelocity) ||
    !Number.isFinite(currentDirection)
  ) {
    return null;
  }

  return {
    position: [Number(longitude.toFixed(4)), Number(latitude.toFixed(4))],
    temperature: seaSurfaceTemperature,
    waveHeight,
    waveDirection,
    wavePeriod,
    windSpeed,
    airTemperature,
    relativeHumidity,
    precipitation,
    weatherCode,
    isDay: isDay === 1,
    currentVelocity,
    currentDirection,
  };
};

const parseBounds = (bbox: string | null) => {
  const values = bbox?.split(",").map(Number) ?? [];
  if (values.length !== 4 || values.some((value) => !Number.isFinite(value))) return null;

  const [rawWest, rawSouth, rawEast, rawNorth] = values;
  const west = clamp(rawWest, -179, 179);
  const east = clamp(rawEast, -179, 179);
  const south = clamp(rawSouth, -70, 78);
  const north = clamp(rawNorth, -70, 78);

  return {
    minLon: Math.min(west, east),
    maxLon: Math.max(west, east),
    minLat: Math.min(south, north),
    maxLat: Math.max(south, north),
  };
};

const buildCandidateGrid = (bounds: NonNullable<ReturnType<typeof parseBounds>>, zoom: number) => {
  const clippedBounds = {
    minLon: Math.max(bounds.minLon, TURKEY_MARINE_BOUNDS.west),
    maxLon: Math.min(bounds.maxLon, TURKEY_MARINE_BOUNDS.east),
    minLat: Math.max(bounds.minLat, TURKEY_MARINE_BOUNDS.south),
    maxLat: Math.min(bounds.maxLat, TURKEY_MARINE_BOUNDS.north),
  };
  const lonSpan = Math.max(clippedBounds.maxLon - clippedBounds.minLon, 0.3);
  const latSpan = Math.max(clippedBounds.maxLat - clippedBounds.minLat, 0.3);
  const columns = zoom > 7 ? 4 : 3;
  const rows = zoom > 7 ? 3 : 2;
  const points: Array<[number, number]> = [];

  for (let row = 1; row <= rows; row += 1) {
    for (let column = 1; column <= columns; column += 1) {
      const longitude = clippedBounds.minLon + (lonSpan * column) / (columns + 1);
      const latitude = clippedBounds.minLat + (latSpan * row) / (rows + 1);
      points.push([longitude, latitude]);
    }
  }

  return points.slice(0, 6);
};

const emptyResponse = (source: "unavailable") => ({
  source,
  isDynamic: true,
  densityPoints: emptyFeatureCollection,
  temperaturePoints: emptyFeatureCollection,
  currents: emptyFeatureCollection,
  protectedPolygons: emptyFeatureCollection,
  ports: [],
  marinas: [],
  regions: [],
});


const isPointInBounds = ([longitude, latitude]: [number, number], bounds: NonNullable<ReturnType<typeof parseBounds>>) =>
  longitude >= bounds.minLon && longitude <= bounds.maxLon && latitude >= bounds.minLat && latitude <= bounds.maxLat;

const getTurkeyPortsInBounds = (bounds: NonNullable<ReturnType<typeof parseBounds>>) =>
  TURKEY_PORTS.filter((port) => isPointInBounds(port.coordinates, bounds) && isTurkeyMarinePoint(port.coordinates[0], port.coordinates[1]));

const getTurkeyMarinasInBounds = (bounds: NonNullable<ReturnType<typeof parseBounds>>) =>
  TURKEY_MARINAS.filter((marina) => isPointInBounds(marina.coordinates, bounds) && isTurkeyMarinePoint(marina.coordinates[0], marina.coordinates[1]));

const uniquePorts = (ports: TurkeyPort[]) => {
  const seen = new Set<string>();
  return ports.filter((port) => {
    const key = `${port.locode ?? port.name}-${port.coordinates[0].toFixed(4)}-${port.coordinates[1].toFixed(4)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const buildApproximateAreaPolygon = ([longitude, latitude]: [number, number], areaKm2: number) => {
  const radiusKm = Math.sqrt(areaKm2 / Math.PI);
  const latitudeDelta = radiusKm / 111;
  const longitudeDelta = radiusKm / (111 * Math.max(0.24, Math.cos((latitude * Math.PI) / 180)));
  const steps = 28;
  const polygon: Array<[number, number]> = [];

  for (let index = 0; index <= steps; index += 1) {
    const angle = (index / steps) * Math.PI * 2;
    polygon.push([
      Number((longitude + Math.cos(angle) * longitudeDelta).toFixed(5)),
      Number((latitude + Math.sin(angle) * latitudeDelta).toFixed(5)),
    ]);
  }

  return polygon;
};

const polygonIntersectsBounds = (polygon: Array<[number, number]>, bounds: NonNullable<ReturnType<typeof parseBounds>>) =>
  polygon.some(([longitude, latitude]) => isPointInBounds([longitude, latitude], bounds)) ||
  polygon.some(([longitude, latitude]) =>
    longitude >= bounds.minLon - 1.8 && longitude <= bounds.maxLon + 1.8 && latitude >= bounds.minLat - 1.8 && latitude <= bounds.maxLat + 1.8
  );

const getTurkeyProtectedAreasInBounds = (bounds: NonNullable<ReturnType<typeof parseBounds>>) =>
  TURKEY_COASTAL_PROTECTED_AREAS.map((area) => ({
    name: area.name,
    region: area.region,
    areaKm2: area.areaKm2,
    polygon: buildApproximateAreaPolygon(area.center, area.areaKm2),
  })).filter((area) => polygonIntersectsBounds(area.polygon, bounds));

const uniqueProtectedAreas = (areas: Array<{ name: string; polygon: Array<[number, number]>; region?: string; areaKm2?: number }>) => {
  const seen = new Set<string>();
  return areas.filter((area) => {
    if (seen.has(area.name)) return false;
    seen.add(area.name);
    return true;
  });
};
const fetchOverpassElements = async (query: string): Promise<OverpassElement[]> => {
  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body: new URLSearchParams({ data: query }),
    cache: "no-store",
    signal: AbortSignal.timeout(4200),
  });

  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data?.elements) ? data.elements : [];
};

const fetchRealPorts = async (bounds: NonNullable<ReturnType<typeof parseBounds>>) => {
  const staticPorts = getTurkeyPortsInBounds(bounds);
  const bbox = `${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon}`;
  const query = `[out:json][timeout:4];(node["seamark:type"="harbour"](${bbox});node["harbour"](${bbox});node["leisure"="marina"](${bbox});node["amenity"="ferry_terminal"](${bbox}););out center 24;`;

  try {
    const elements = await fetchOverpassElements(query);
    const overpassPorts = elements
      .map<TurkeyPort | null>((element) => {
        const longitude = element.lon;
        const latitude = element.lat;
        if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null;
        if (!isTurkeyMarinePoint(Number(longitude), Number(latitude))) return null;
        return {
          name: element.tags?.["name:tr"] ?? element.tags?.name ?? "Liman",
          locode: element.tags?.locode ?? element.tags?.["ref:LOCODE"],
          coordinates: [Number(longitude), Number(latitude)] as [number, number],
        };
      })
      .filter((port): port is TurkeyPort => Boolean(port));

    return uniquePorts([...staticPorts, ...overpassPorts]).slice(0, 80);
  } catch {
    return staticPorts;
  }
};

const fetchRealProtectedPolygons = async (bounds: NonNullable<ReturnType<typeof parseBounds>>) => {
  const staticProtectedAreas = getTurkeyProtectedAreasInBounds(bounds);
  const bbox = `${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon}`;
  const query = `[out:json][timeout:4];(way["boundary"="protected_area"](${bbox});way["protect_class"](${bbox});way["leisure"="nature_reserve"](${bbox}););out geom 12;`;

  try {
    const elements = await fetchOverpassElements(query);
    const overpassProtectedAreas = elements
      .map((element) => {
        const geometry = element.geometry ?? [];
        const polygon = geometry
          .map((point) => [Number(point.lon), Number(point.lat)] as [number, number])
          .filter(([longitude, latitude]) => Number.isFinite(longitude) && Number.isFinite(latitude) && isTurkeyMarinePoint(longitude, latitude));

        if (polygon.length < 4) return null;
        const first = polygon[0];
        const last = polygon[polygon.length - 1];
        const closedPolygon = first[0] === last[0] && first[1] === last[1] ? polygon : [...polygon, first];
        return {
          name: element.tags?.name ?? element.tags?.["name:tr"] ?? "Koruma Alani",
          polygon: closedPolygon,
        };
      })
      .filter((polygon): polygon is { name: string; polygon: Array<[number, number]> } => Boolean(polygon));

    return uniqueProtectedAreas([...staticProtectedAreas, ...overpassProtectedAreas]).slice(0, 40);
  } catch {
    return staticProtectedAreas;
  }
};

const sampleNoaaChlorophyll = async (longitude: number, latitude: number): Promise<number | null> => {
  const url = new URL(`https://coastwatch.pfeg.noaa.gov/erddap/griddap/${NOAA_CHLOROPHYLL_DATASET_ID}.json`);
  url.search = `?chlor_a[(last)][(0)][(${latitude.toFixed(4)})][(${longitude.toFixed(4)})]`;

  try {
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(4500) });
    if (!response.ok) return null;
    const data = await response.json();
    const value = Number(data?.table?.rows?.[0]?.[4]);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
};

const enrichWithChlorophyll = async (points: MarinePoint[]) => {
  const sampled = await Promise.all(
    points.map(async (point) => ({
      ...point,
      chlorophyllMgM3: await sampleNoaaChlorophyll(point.position[0], point.position[1]),
    }))
  );

  return sampled;
};

const toObservationPointCollection = (observations: SpeciesObservation[]) => ({
  type: "FeatureCollection",
  features: observations.map((observation) => ({
    type: "Feature",
    properties: { source: observation.source, name: observation.scientificName },
    geometry: { type: "Point", coordinates: observation.coordinates },
  })),
});

const boundsToWktPolygon = (bounds: NonNullable<ReturnType<typeof parseBounds>>) =>
  `POLYGON((${bounds.minLon} ${bounds.minLat},${bounds.maxLon} ${bounds.minLat},${bounds.maxLon} ${bounds.maxLat},${bounds.minLon} ${bounds.maxLat},${bounds.minLon} ${bounds.minLat}))`;

const isLikelyFishObservation = (item: Record<string, unknown>) => {
  const className = String(item.class ?? item.className ?? "").toLocaleLowerCase("tr-TR");
  const orderName = String(item.order ?? "").toLocaleLowerCase("tr-TR");
  return ["actinopter", "chondrich", "elasmobranch", "squal", "perciform", "clupeiform", "gobiiform"].some((token) => className.includes(token) || orderName.includes(token));
};

const fetchObisObservations = async (bounds: NonNullable<ReturnType<typeof parseBounds>>): Promise<SpeciesObservation[]> => {
  const url = new URL("https://api.obis.org/v3/occurrence");
  url.searchParams.set("geometry", boundsToWktPolygon(bounds));
  url.searchParams.set("size", "80");

  try {
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(5200) });
    if (!response.ok) return [];
    const data = await response.json();
    const results = Array.isArray(data?.results) ? data.results : [];

    return results
      .filter((item: Record<string, unknown>) => isLikelyFishObservation(item))
      .map((item: Record<string, unknown>) => {
        const longitude = Number(item.decimalLongitude);
        const latitude = Number(item.decimalLatitude);
        if (!Number.isFinite(longitude) || !Number.isFinite(latitude) || !isTurkeyMarinePoint(longitude, latitude)) return null;
        const scientificName = String(item.scientificName ?? item.species ?? "Deniz turu gozlemi");
        return {
          id: `obis-${String(item.occurrenceID ?? `${longitude}-${latitude}-${scientificName}`)}`,
          source: "OBIS" as const,
          scientificName,
          eventDate: item.eventDate ? String(item.eventDate) : undefined,
          coordinates: [Number(longitude.toFixed(4)), Number(latitude.toFixed(4))] as [number, number],
        };
      })
      .filter((item): item is SpeciesObservation => Boolean(item))
      .slice(0, 12);
  } catch {
    return [];
  }
};

const fetchGbifObservations = async (bounds: NonNullable<ReturnType<typeof parseBounds>>): Promise<SpeciesObservation[]> => {
  const url = new URL("https://api.gbif.org/v1/occurrence/search");
  url.searchParams.set("geometry", boundsToWktPolygon(bounds));
  url.searchParams.set("hasCoordinate", "true");
  url.searchParams.set("classKey", "204");
  url.searchParams.set("limit", "40");

  try {
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(5200) });
    if (!response.ok) return [];
    const data = await response.json();
    const results = Array.isArray(data?.results) ? data.results : [];

    return results
      .map((item: Record<string, unknown>) => {
        const longitude = Number(item.decimalLongitude);
        const latitude = Number(item.decimalLatitude);
        if (!Number.isFinite(longitude) || !Number.isFinite(latitude) || !isTurkeyMarinePoint(longitude, latitude)) return null;
        const scientificName = String(item.scientificName ?? item.species ?? "Balik gozlemi");
        return {
          id: `gbif-${String(item.key ?? `${longitude}-${latitude}-${scientificName}`)}`,
          source: "GBIF" as const,
          scientificName,
          commonName: item.vernacularName ? String(item.vernacularName) : undefined,
          eventDate: item.eventDate ? String(item.eventDate) : undefined,
          coordinates: [Number(longitude.toFixed(4)), Number(latitude.toFixed(4))] as [number, number],
        };
      })
      .filter((item): item is SpeciesObservation => Boolean(item))
      .slice(0, 12);
  } catch {
    return [];
  }
};

const uniqueObservations = (observations: SpeciesObservation[]) => {
  const seen = new Set<string>();
  return observations.filter((observation) => {
    const key = `${observation.scientificName}-${observation.coordinates[0]}-${observation.coordinates[1]}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
const buildResponse = async (points: MarinePoint[], bounds: NonNullable<ReturnType<typeof parseBounds>>, layers: Set<string>) => {
  const wantsChlorophyll = layers.has("chlorophyll");
  const wantsObservations = layers.has("fish-density");
  const wantsProtectedAreas = layers.has("protected-areas");
  const wantsPorts = layers.has("ports");
  const wantsMarinas = layers.has("marinas");
  const wantsWeather = layers.has("weather");

  const [enrichedPoints, ports, marinas, protectedAreas, obisObservations, gbifObservations] = await Promise.all([
    wantsChlorophyll ? enrichWithChlorophyll(points) : Promise.resolve(points),
    wantsPorts ? fetchRealPorts(bounds) : Promise.resolve([]),
    wantsMarinas ? Promise.resolve(getTurkeyMarinasInBounds(bounds)) : Promise.resolve([]),
    wantsProtectedAreas ? fetchRealProtectedPolygons(bounds) : Promise.resolve([]),
    wantsObservations ? fetchObisObservations(bounds) : Promise.resolve([]),
    wantsObservations ? fetchGbifObservations(bounds) : Promise.resolve([]),
  ]);
  const observations = uniqueObservations([...obisObservations, ...gbifObservations]);

  return {
    source: "open-meteo",
    isDynamic: true,
    densityPoints: observations.length ? toObservationPointCollection(observations) : emptyFeatureCollection,
    temperaturePoints: emptyFeatureCollection,
    weatherPoints: emptyFeatureCollection,
    currents: emptyFeatureCollection,
    protectedPolygons: toPolygonCollection(protectedAreas),
    ports,
    marinas,
    regions: buildRegions(enrichedPoints, observations),
  };
};

export async function GET(request: NextRequest) {
  const bounds = parseBounds(request.nextUrl.searchParams.get("bbox"));
  const zoom = Number(request.nextUrl.searchParams.get("zoom") ?? 5);
  const layers = new Set((request.nextUrl.searchParams.get("layers") ?? "fish-density,protected-areas,ports,marinas,weather").split(",").filter(Boolean));

  if (!bounds) {
    return NextResponse.json({ error: "Invalid bbox" }, { status: 400 });
  }

  if (!intersectsTurkeyMarineBounds(bounds)) {
    return NextResponse.json(emptyResponse("unavailable"));
  }

  const candidatePoints = buildCandidateGrid(bounds, Number.isFinite(zoom) ? zoom : 5);
  const marineCandidatePoints = candidatePoints.filter(([longitude, latitude]) => isTurkeyMarinePoint(longitude, latitude));

  if (marineCandidatePoints.length === 0) {
    return NextResponse.json(emptyResponse("unavailable"));
  }

  try {
    const sampled = await Promise.all(marineCandidatePoints.map(([longitude, latitude]) => sampleOpenMeteoPoint(longitude, latitude)));
    const realPoints = sampled.filter((point): point is MarinePoint => Boolean(point));

    if (!realPoints.length) {
      return NextResponse.json(emptyResponse("unavailable"));
    }

    return NextResponse.json(await buildResponse(realPoints, bounds, layers));
  } catch {
    return NextResponse.json(emptyResponse("unavailable"));
  }
}
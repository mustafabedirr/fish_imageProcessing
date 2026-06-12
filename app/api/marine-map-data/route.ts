import { NextRequest, NextResponse } from "next/server";

type MarinePoint = {
  position: [number, number];
  weight: number;
  temperature: number;
  waveHeight: number;
  windSpeed: number;
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

const globalPorts = [
  { name: "Izmir", coordinates: [27.14, 38.42] },
  { name: "Kusadasi", coordinates: [27.26, 37.86] },
  { name: "Bodrum", coordinates: [27.43, 37.03] },
  { name: "Rhodes", coordinates: [28.22, 36.43] },
  { name: "Tokyo Bay", coordinates: [139.78, 35.55] },
  { name: "Yokohama", coordinates: [139.64, 35.45] },
  { name: "Osaka Bay", coordinates: [135.18, 34.45] },
  { name: "Busan", coordinates: [129.07, 35.1] },
  { name: "Singapore Strait", coordinates: [103.85, 1.25] },
  { name: "San Francisco Bay", coordinates: [-122.42, 37.78] },
  { name: "Sydney Harbour", coordinates: [151.22, -33.85] },
  { name: "Cape Town", coordinates: [18.42, -33.92] },
] as const;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const formatCoordinates = ([longitude, latitude]: [number, number]) =>
  `${Math.abs(latitude).toFixed(4)} ${latitude >= 0 ? "N" : "S"}, ${Math.abs(longitude).toFixed(4)} ${longitude >= 0 ? "E" : "W"}`;

const seededValue = (longitude: number, latitude: number, salt: number) => {
  const seed = Math.sin(longitude * 12.9898 + latitude * 78.233 + salt * 37.719) * 43758.5453;
  return seed - Math.floor(seed);
};

const isInBox = (longitude: number, latitude: number, west: number, south: number, east: number, north: number) =>
  longitude >= west && longitude <= east && latitude >= south && latitude <= north;

const isLikelyMarinePoint = (longitude: number, latitude: number) => {
  if (latitude > 78 || latitude < -70) return false;

  const oceanExceptions = [
    [20, 34, 31, 42], // Aegean
    [126, 28, 147, 46], // Japan seas
    [120, 30, 132, 42], // Korea Strait
    [100, -2, 112, 8], // Singapore / Malacca
    [-126, 32, -116, 42], // California coast
    [145, -38, 156, -28], // East Australia
    [17, -36, 21, -32], // Cape Town coast
  ] as const;

  if (oceanExceptions.some(([west, south, east, north]) => isInBox(longitude, latitude, west, south, east, north))) {
    return true;
  }

  const broadLandBoxes = [
    [-170, 8, -52, 72], // North America
    [-82, -56, -34, 13], // South America
    [-11, 35, 45, 72], // Europe
    [-18, -35, 52, 37], // Africa
    [25, 5, 150, 72], // Asia
    [110, -45, 155, -10], // Australia
    [-74, 59, -12, 84], // Greenland
  ] as const;

  return !broadLandBoxes.some(([west, south, east, north]) => isInBox(longitude, latitude, west, south, east, north));
};

const getViewportName = ([longitude, latitude]: [number, number]) => {
  if (longitude > 126 && longitude < 147 && latitude > 28 && latitude < 46) return "Japonya Deniz Alani";
  if (longitude > 120 && longitude < 132 && latitude > 30 && latitude < 42) return "Kore Bogazi";
  if (longitude > 100 && longitude < 112 && latitude > -2 && latitude < 8) return "Singapur Deniz Koridoru";
  if (longitude > -126 && longitude < -116 && latitude > 32 && latitude < 42) return "Kaliforniya Kiyi Alani";
  if (longitude > 145 && longitude < 156 && latitude > -38 && latitude < -28) return "Dogu Avustralya Kiyi Alani";
  if (longitude > 20 && longitude < 31 && latitude > 34 && latitude < 42) return "Ege Denizi";
  return "Acik Deniz Alani";
};

const toPointCollection = (items: MarinePoint[], property: "weight" | "temperature") => ({
  type: "FeatureCollection",
  features: items.map((item) => ({
    type: "Feature",
    properties: { weight: property === "temperature" ? item.temperature : item.weight },
    geometry: { type: "Point", coordinates: item.position },
  })),
});

const toLineCollection = (items: MarinePoint[]) => ({
  type: "FeatureCollection",
  features: items.slice(0, 4).map((item, index) => {
    const [longitude, latitude] = item.position;
    const offset = 0.18 + index * 0.04;
    return {
      type: "Feature",
      properties: { speed: Number((0.3 + item.windSpeed / 28).toFixed(2)) },
      geometry: {
        type: "LineString",
        coordinates: [
          [Number((longitude - offset).toFixed(4)), Number((latitude - offset * 0.25).toFixed(4))],
          [Number(longitude.toFixed(4)), Number((latitude + offset * 0.28).toFixed(4))],
          [Number((longitude + offset).toFixed(4)), Number((latitude + offset * 0.08).toFixed(4))],
        ],
      },
    };
  }),
});

const toPolygonCollection = (items: MarinePoint[]) => ({
  type: "FeatureCollection",
  features: items.slice(0, 2).map((item, index) => {
    const [longitude, latitude] = item.position;
    const width = 0.18 + index * 0.08;
    const height = 0.12 + index * 0.05;
    return {
      type: "Feature",
      properties: { name: `${getViewportName(item.position)} Koruma ${index + 1}` },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [Number((longitude - width).toFixed(4)), Number((latitude - height).toFixed(4))],
            [Number((longitude + width).toFixed(4)), Number((latitude - height * 0.8).toFixed(4))],
            [Number((longitude + width * 0.86).toFixed(4)), Number((latitude + height).toFixed(4))],
            [Number((longitude - width * 0.72).toFixed(4)), Number((latitude + height * 0.9).toFixed(4))],
            [Number((longitude - width).toFixed(4)), Number((latitude - height).toFixed(4))],
          ],
        ],
      },
    };
  }),
});

const buildRegions = (items: MarinePoint[]): MarineRegion[] =>
  [...items]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 4)
    .map((item, index) => {
      const density = item.weight > 74 ? "Yuksek" : item.weight > 55 ? "Orta" : "Dusuk";
      const name = `${getViewportName(item.position)} ${index + 1}`;

      return {
        id: `${item.position[0]}-${item.position[1]}`,
        name,
        label: `%${item.weight}`,
        coordinates: item.position,
        region: {
          id: `marine-${index}-${item.position[0]}-${item.position[1]}`,
          name,
          coordinatesText: formatCoordinates(item.position),
          center: item.position,
          density,
          densityScore: `%${item.weight}`,
          temperature: `${item.temperature.toFixed(1)} C`,
          chlorophyll: item.weight > 72 ? "Orta" : "Dusuk",
          current: `${(0.25 + item.windSpeed / 35).toFixed(1)} m/s`,
          wave: `${item.waveHeight.toFixed(1)} m`,
          wind: `${item.windSpeed.toFixed(0)} kn`,
        },
      };
    });

const buildFallbackPoint = (longitude: number, latitude: number): MarinePoint => {
  const temperature = 8 + (1 - Math.abs(latitude) / 90) * 18 + seededValue(longitude, latitude, 22) * 3;
  const waveHeight = 0.2 + seededValue(longitude, latitude, 44) * 1.8;
  const windSpeed = 5 + seededValue(longitude, latitude, 33) * 22;
  const weight = Math.round(clamp(38 + seededValue(longitude, latitude, 11) * 48 + (1 - Math.abs(latitude) / 92) * 12, 28, 96));

  return {
    position: [Number(longitude.toFixed(4)), Number(latitude.toFixed(4))],
    weight,
    temperature,
    waveHeight,
    windSpeed,
  };
};

const sampleOpenMeteoPoint = async (longitude: number, latitude: number): Promise<MarinePoint | null> => {
  const marineUrl = new URL("https://marine-api.open-meteo.com/v1/marine");
  marineUrl.searchParams.set("latitude", String(latitude));
  marineUrl.searchParams.set("longitude", String(longitude));
  marineUrl.searchParams.set("current", "wave_height,wave_period");
  marineUrl.searchParams.set("timezone", "auto");

  const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
  forecastUrl.searchParams.set("latitude", String(latitude));
  forecastUrl.searchParams.set("longitude", String(longitude));
  forecastUrl.searchParams.set("current", "temperature_2m,wind_speed_10m");
  forecastUrl.searchParams.set("wind_speed_unit", "kn");
  forecastUrl.searchParams.set("timezone", "auto");

  const [marineResponse, forecastResponse] = await Promise.all([
    fetch(marineUrl, { cache: "no-store", signal: AbortSignal.timeout(2600) }),
    fetch(forecastUrl, { cache: "no-store", signal: AbortSignal.timeout(2600) }),
  ]);

  if (!marineResponse.ok || !forecastResponse.ok) return null;

  const [marine, forecast] = await Promise.all([marineResponse.json(), forecastResponse.json()]);
  const waveHeight = Number(marine?.current?.wave_height);
  const temperature = Number(forecast?.current?.temperature_2m);
  const windSpeed = Number(forecast?.current?.wind_speed_10m);

  if (!Number.isFinite(waveHeight) || !Number.isFinite(temperature) || !Number.isFinite(windSpeed)) return null;

  const waveScore = clamp(waveHeight * 18, 0, 36);
  const windScore = clamp(windSpeed * 1.4, 0, 34);
  const temperatureScore = clamp((temperature - 6) * 1.1, 0, 28);

  return {
    position: [Number(longitude.toFixed(4)), Number(latitude.toFixed(4))],
    weight: Math.round(clamp(24 + waveScore + windScore + temperatureScore, 18, 96)),
    temperature,
    waveHeight,
    windSpeed,
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
  const lonSpan = Math.max(bounds.maxLon - bounds.minLon, 0.3);
  const latSpan = Math.max(bounds.maxLat - bounds.minLat, 0.3);
  const columns = zoom > 7 ? 4 : 3;
  const rows = zoom > 7 ? 3 : 2;
  const points: Array<[number, number]> = [];

  for (let row = 1; row <= rows; row += 1) {
    for (let column = 1; column <= columns; column += 1) {
      const longitude = bounds.minLon + (lonSpan * column) / (columns + 1);
      const latitude = bounds.minLat + (latSpan * row) / (rows + 1);
      points.push([longitude, latitude]);
    }
  }

  return points.slice(0, 12);
};

const buildResponse = (points: MarinePoint[], bounds: NonNullable<ReturnType<typeof parseBounds>>, source: "open-meteo" | "fallback") => {
  const ports = globalPorts
    .filter((port) => {
      const [longitude, latitude] = port.coordinates;
      return longitude >= bounds.minLon && longitude <= bounds.maxLon && latitude >= bounds.minLat && latitude <= bounds.maxLat;
    })
    .map((port) => ({ name: port.name, coordinates: port.coordinates }));

  return {
    source,
    isDynamic: true,
    densityPoints: toPointCollection(points, "weight"),
    temperaturePoints: toPointCollection(points, "temperature"),
    currents: toLineCollection(points),
    protectedPolygons: toPolygonCollection(points),
    ports,
    regions: buildRegions(points),
  };
};

export async function GET(request: NextRequest) {
  const bounds = parseBounds(request.nextUrl.searchParams.get("bbox"));
  const zoom = Number(request.nextUrl.searchParams.get("zoom") ?? 5);

  if (!bounds) {
    return NextResponse.json({ error: "Invalid bbox" }, { status: 400 });
  }

  const candidatePoints = buildCandidateGrid(bounds, Number.isFinite(zoom) ? zoom : 5);
  const fallbackPoints = candidatePoints
    .filter(([longitude, latitude]) => isLikelyMarinePoint(longitude, latitude))
    .map(([longitude, latitude]) => buildFallbackPoint(longitude, latitude));

  if (candidatePoints.length === 0) {
    return NextResponse.json(buildResponse([], bounds, "fallback"));
  }

  try {
    const sampled = await Promise.all(candidatePoints.map(([longitude, latitude]) => sampleOpenMeteoPoint(longitude, latitude)));
    const realPoints = sampled.filter((point): point is MarinePoint => Boolean(point));

    return NextResponse.json(buildResponse(realPoints.length ? realPoints : fallbackPoints, bounds, realPoints.length ? "open-meteo" : "fallback"));
  } catch {
    return NextResponse.json(buildResponse(fallbackPoints, bounds, "fallback"));
  }
}

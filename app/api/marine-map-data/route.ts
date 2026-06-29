import { NextRequest, NextResponse } from "next/server";

type MarinePoint = {
  position: [number, number];
  weight: number;
  temperature: number;
  waveHeight: number;
  waveDirection: number;
  wavePeriod: number;
  windSpeed: number;
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

const toPointCollection = (items: MarinePoint[], property: "weight" | "temperature") => ({
  type: "FeatureCollection",
  features: items.map((item) => ({
    type: "Feature",
    properties: { weight: property === "temperature" ? item.temperature : item.weight, chlorophyll: item.chlorophyllMgM3 ?? null },
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
  (observations.length
    ? observations.slice(0, 8).map((observation, index) => {
        const nearestPoint = items.reduce<MarinePoint | null>((nearest, item) => {
          if (!nearest) return item;
          const [obsLon, obsLat] = observation.coordinates;
          const [itemLon, itemLat] = item.position;
          const [nearLon, nearLat] = nearest.position;
          const itemDistance = Math.abs(obsLon - itemLon) + Math.abs(obsLat - itemLat);
          const nearestDistance = Math.abs(obsLon - nearLon) + Math.abs(obsLat - nearLat);
          return itemDistance < nearestDistance ? item : nearest;
        }, null);
        const score = nearestPoint?.weight ?? 0;

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
            temperature: nearestPoint ? `${nearestPoint.temperature.toFixed(1)} C` : "-",
            chlorophyll: nearestPoint?.chlorophyllMgM3 != null ? `${nearestPoint.chlorophyllMgM3.toFixed(2)} mg/m3` : "Gercek veri yok",
            current: nearestPoint ? `${nearestPoint.currentVelocity.toFixed(1)} kn / ${nearestPoint.currentDirection.toFixed(0)} deg` : "-",
            wave: nearestPoint ? `${nearestPoint.waveHeight.toFixed(1)} m` : "-",
            wind: nearestPoint ? `${nearestPoint.windSpeed.toFixed(0)} kn` : "-",
          },
        };
      })
    : [...items]
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 4)
        .map((item, index) => {
          const condition = item.weight > 74 ? "Uygun" : item.weight > 55 ? "Orta" : "Dusuk";
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
              density: condition,
              densityScore: `%${item.weight}`,
              temperature: `${item.temperature.toFixed(1)} C`,
              chlorophyll: item.chlorophyllMgM3 != null ? `${item.chlorophyllMgM3.toFixed(2)} mg/m3` : "Gercek veri yok",
              current: `${item.currentVelocity.toFixed(1)} kn / ${item.currentDirection.toFixed(0)} deg`,
              wave: `${item.waveHeight.toFixed(1)} m`,
              wind: `${item.windSpeed.toFixed(0)} kn`,
            },
          };
        }));

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
  forecastUrl.searchParams.set("current", "wind_speed_10m");
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
  const currentVelocity = Number(marine?.current?.ocean_current_velocity);
  const currentDirection = Number(marine?.current?.ocean_current_direction);

  if (
    !Number.isFinite(waveHeight) ||
    !Number.isFinite(waveDirection) ||
    !Number.isFinite(wavePeriod) ||
    !Number.isFinite(seaSurfaceTemperature) ||
    !Number.isFinite(windSpeed) ||
    !Number.isFinite(currentVelocity) ||
    !Number.isFinite(currentDirection)
  ) {
    return null;
  }

  const waveScore = clamp(40 - waveHeight * 12, 0, 40);
  const windScore = clamp(32 - windSpeed * 1.2, 0, 32);
  const temperatureScore = clamp((seaSurfaceTemperature - 10) * 1.8, 0, 28);

  return {
    position: [Number(longitude.toFixed(4)), Number(latitude.toFixed(4))],
    weight: Math.round(clamp(waveScore + windScore + temperatureScore, 8, 96)),
    temperature: seaSurfaceTemperature,
    waveHeight,
    waveDirection,
    wavePeriod,
    windSpeed,
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

  return points.slice(0, 12);
};

const emptyResponse = (source: "out-of-region" | "unavailable") => ({
  source,
  isDynamic: true,
  densityPoints: emptyFeatureCollection,
  temperaturePoints: emptyFeatureCollection,
  currents: emptyFeatureCollection,
  protectedPolygons: emptyFeatureCollection,
  ports: [],
  regions: [],
});

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
  const bbox = `${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon}`;
  const query = `[out:json][timeout:4];(node["seamark:type"="harbour"](${bbox});node["harbour"](${bbox});node["leisure"="marina"](${bbox});node["amenity"="ferry_terminal"](${bbox}););out center 24;`;

  try {
    const elements = await fetchOverpassElements(query);
    return elements
      .map((element) => {
        const longitude = element.lon;
        const latitude = element.lat;
        if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null;
        if (!isTurkeyMarinePoint(Number(longitude), Number(latitude))) return null;
        return {
          name: element.tags?.name ?? element.tags?.["name:tr"] ?? "Liman",
          coordinates: [Number(longitude), Number(latitude)] as [number, number],
        };
      })
      .filter((port): port is { name: string; coordinates: [number, number] } => Boolean(port))
      .slice(0, 24);
  } catch {
    return [];
  }
};

const fetchRealProtectedPolygons = async (bounds: NonNullable<ReturnType<typeof parseBounds>>) => {
  const bbox = `${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon}`;
  const query = `[out:json][timeout:4];(way["boundary"="protected_area"](${bbox});way["protect_class"](${bbox});way["leisure"="nature_reserve"](${bbox}););out geom 12;`;

  try {
    const elements = await fetchOverpassElements(query);
    return elements
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
      .filter((polygon): polygon is { name: string; polygon: Array<[number, number]> } => Boolean(polygon))
      .slice(0, 12);
  } catch {
    return [];
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
    properties: { weight: observation.source === "OBIS" ? 92 : 84, source: observation.source, name: observation.scientificName },
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
const buildResponse = async (points: MarinePoint[], bounds: NonNullable<ReturnType<typeof parseBounds>>) => {
  const [enrichedPoints, ports, protectedAreas, obisObservations, gbifObservations] = await Promise.all([
    enrichWithChlorophyll(points),
    fetchRealPorts(bounds),
    fetchRealProtectedPolygons(bounds),
    fetchObisObservations(bounds),
    fetchGbifObservations(bounds),
  ]);
  const observations = uniqueObservations([...obisObservations, ...gbifObservations]);

  return {
    source: "open-meteo",
    isDynamic: true,
    densityPoints: observations.length ? toObservationPointCollection(observations) : toPointCollection(enrichedPoints, "weight"),
    temperaturePoints: toPointCollection(enrichedPoints, "temperature"),
    currents: toLineCollection(enrichedPoints),
    protectedPolygons: toPolygonCollection(protectedAreas),
    ports,
    regions: buildRegions(enrichedPoints, observations),
  };
};

export async function GET(request: NextRequest) {
  const bounds = parseBounds(request.nextUrl.searchParams.get("bbox"));
  const zoom = Number(request.nextUrl.searchParams.get("zoom") ?? 5);

  if (!bounds) {
    return NextResponse.json({ error: "Invalid bbox" }, { status: 400 });
  }

  if (!intersectsTurkeyMarineBounds(bounds)) {
    return NextResponse.json(emptyResponse("out-of-region"));
  }

  const candidatePoints = buildCandidateGrid(bounds, Number.isFinite(zoom) ? zoom : 5);
  const marineCandidatePoints = candidatePoints.filter(([longitude, latitude]) => isTurkeyMarinePoint(longitude, latitude));

  if (marineCandidatePoints.length === 0) {
    return NextResponse.json(emptyResponse("out-of-region"));
  }

  try {
    const sampled = await Promise.all(marineCandidatePoints.map(([longitude, latitude]) => sampleOpenMeteoPoint(longitude, latitude)));
    const realPoints = sampled.filter((point): point is MarinePoint => Boolean(point));

    if (!realPoints.length) {
      return NextResponse.json(emptyResponse("unavailable"));
    }

    return NextResponse.json(await buildResponse(realPoints, bounds));
  } catch {
    return NextResponse.json(emptyResponse("unavailable"));
  }
}
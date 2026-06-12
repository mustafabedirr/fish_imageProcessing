import { NextRequest, NextResponse } from "next/server";

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

const fallbackByRegion: Record<string, Omit<MarineConditions, "source" | "updatedAt">> = {
  north: {
    waveHeight: "0.3 m",
    waveDirection: "236 deg",
    wavePeriod: "4.8 s",
    windSpeed: "12 kn",
    windDirection: "318 deg",
    airTemperature: "21.4 C",
    waterTemperature: "18.6 C",
  },
  izmir: {
    waveHeight: "0.2 m",
    waveDirection: "248 deg",
    wavePeriod: "4.2 s",
    windSpeed: "9 kn",
    windDirection: "305 deg",
    airTemperature: "22.1 C",
    waterTemperature: "19.1 C",
  },
  bodrum: {
    waveHeight: "0.4 m",
    waveDirection: "221 deg",
    wavePeriod: "5.4 s",
    windSpeed: "14 kn",
    windDirection: "292 deg",
    airTemperature: "24.0 C",
    waterTemperature: "20.2 C",
  },
};

const formatNumber = (value: unknown, digits = 1) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return numeric.toFixed(digits);
};

const getFallback = (region: string): MarineConditions => ({
  source: "fallback",
  updatedAt: new Date().toISOString(),
  ...(fallbackByRegion[region] ?? fallbackByRegion.north),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const latitude = Number(searchParams.get("lat"));
  const longitude = Number(searchParams.get("lon"));
  const region = searchParams.get("region") ?? "north";

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json(getFallback(region));
  }

  try {
    const marineUrl = new URL("https://marine-api.open-meteo.com/v1/marine");
    marineUrl.searchParams.set("latitude", String(latitude));
    marineUrl.searchParams.set("longitude", String(longitude));
    marineUrl.searchParams.set("current", "wave_height,wave_direction,wave_period");
    marineUrl.searchParams.set("timezone", "auto");

    const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
    forecastUrl.searchParams.set("latitude", String(latitude));
    forecastUrl.searchParams.set("longitude", String(longitude));
    forecastUrl.searchParams.set("current", "temperature_2m,wind_speed_10m,wind_direction_10m");
    forecastUrl.searchParams.set("wind_speed_unit", "kn");
    forecastUrl.searchParams.set("timezone", "auto");

    const [marineResponse, forecastResponse] = await Promise.all([
      fetch(marineUrl, { cache: "no-store", signal: AbortSignal.timeout(3200) }),
      fetch(forecastUrl, { cache: "no-store", signal: AbortSignal.timeout(3200) }),
    ]);

    if (!marineResponse.ok || !forecastResponse.ok) {
      return NextResponse.json(getFallback(region));
    }

    const [marine, forecast] = await Promise.all([marineResponse.json(), forecastResponse.json()]);
    const fallback = getFallback(region);
    const waveHeight = formatNumber(marine?.current?.wave_height);
    const waveDirection = formatNumber(marine?.current?.wave_direction, 0);
    const wavePeriod = formatNumber(marine?.current?.wave_period);
    const windSpeed = formatNumber(forecast?.current?.wind_speed_10m);
    const windDirection = formatNumber(forecast?.current?.wind_direction_10m, 0);
    const airTemperature = formatNumber(forecast?.current?.temperature_2m);

    return NextResponse.json({
      source: "open-meteo",
      updatedAt: String(marine?.current?.time ?? forecast?.current?.time ?? new Date().toISOString()),
      waveHeight: waveHeight ? `${waveHeight} m` : fallback.waveHeight,
      waveDirection: waveDirection ? `${waveDirection} deg` : fallback.waveDirection,
      wavePeriod: wavePeriod ? `${wavePeriod} s` : fallback.wavePeriod,
      windSpeed: windSpeed ? `${windSpeed} kn` : fallback.windSpeed,
      windDirection: windDirection ? `${windDirection} deg` : fallback.windDirection,
      airTemperature: airTemperature ? `${airTemperature} C` : fallback.airTemperature,
      waterTemperature: fallback.waterTemperature,
    } satisfies MarineConditions);
  } catch {
    return NextResponse.json(getFallback(region));
  }
}

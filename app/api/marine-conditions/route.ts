import { NextRequest, NextResponse } from "next/server";

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

const formatNumber = (value: unknown, digits = 1) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return numeric.toFixed(digits);
};

const unavailableConditions = (): MarineConditions => ({
  source: "unavailable",
  updatedAt: new Date().toISOString(),
  waveHeight: "Gercek veri yok",
  waveDirection: "Gercek veri yok",
  wavePeriod: "Gercek veri yok",
  windSpeed: "Gercek veri yok",
  windDirection: "Gercek veri yok",
  airTemperature: "Gercek veri yok",
  waterTemperature: "Gercek veri yok",
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const latitude = Number(searchParams.get("lat"));
  const longitude = Number(searchParams.get("lon"));

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json(unavailableConditions());
  }

  try {
    const marineUrl = new URL("https://marine-api.open-meteo.com/v1/marine");
    marineUrl.searchParams.set("latitude", String(latitude));
    marineUrl.searchParams.set("longitude", String(longitude));
    marineUrl.searchParams.set("current", "wave_height,wave_direction,wave_period,sea_surface_temperature,ocean_current_velocity,ocean_current_direction");
    marineUrl.searchParams.set("velocity_unit", "kn");
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
      return NextResponse.json(unavailableConditions());
    }

    const [marine, forecast] = await Promise.all([marineResponse.json(), forecastResponse.json()]);
    const waveHeight = formatNumber(marine?.current?.wave_height);
    const waveDirection = formatNumber(marine?.current?.wave_direction, 0);
    const wavePeriod = formatNumber(marine?.current?.wave_period);
    const seaSurfaceTemperature = formatNumber(marine?.current?.sea_surface_temperature);
    const windSpeed = formatNumber(forecast?.current?.wind_speed_10m);
    const windDirection = formatNumber(forecast?.current?.wind_direction_10m, 0);
    const airTemperature = formatNumber(forecast?.current?.temperature_2m);

    return NextResponse.json({
      source: "open-meteo",
      updatedAt: String(marine?.current?.time ?? forecast?.current?.time ?? new Date().toISOString()),
      waveHeight: waveHeight ? `${waveHeight} m` : "Gercek veri yok",
      waveDirection: waveDirection ? `${waveDirection} deg` : "Gercek veri yok",
      wavePeriod: wavePeriod ? `${wavePeriod} s` : "Gercek veri yok",
      windSpeed: windSpeed ? `${windSpeed} kn` : "Gercek veri yok",
      windDirection: windDirection ? `${windDirection} deg` : "Gercek veri yok",
      airTemperature: airTemperature ? `${airTemperature} C` : "Gercek veri yok",
      waterTemperature: seaSurfaceTemperature ? `${seaSurfaceTemperature} C` : "Gercek veri yok",
    } satisfies MarineConditions);
  } catch {
    return NextResponse.json(unavailableConditions());
  }
}

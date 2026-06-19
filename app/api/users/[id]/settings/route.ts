import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSettings } from "../../../../../lib/server/aquascope-db";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const settings = await getSettings(params.id);
  return NextResponse.json({ settings });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => null);
  const settings = await updateSettings(params.id, {
    addResultsToLibrary: typeof body?.addResultsToLibrary === "boolean" ? body.addResultsToLibrary : undefined,
    densityAlerts: typeof body?.densityAlerts === "boolean" ? body.densityAlerts : undefined,
    syncInterval: body?.syncInterval ? String(body.syncInterval) : undefined,
    emailNotifications: typeof body?.emailNotifications === "boolean" ? body.emailNotifications : undefined,
  });
  return NextResponse.json({ settings });
}
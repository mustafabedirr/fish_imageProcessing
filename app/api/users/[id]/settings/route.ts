import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSettings } from "../../../../../lib/server/aquascope-db";

const visibilityOptions = new Set(["public", "followers", "private"]);
const messageOptions = new Set(["everyone", "followers", "none"]);
const languageOptions = new Set(["tr", "en", "both"]);

function pickString(value: unknown, allowed: Set<string>) {
  return typeof value === "string" && allowed.has(value) ? value : undefined;
}

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
    socialProfileVisibility: pickString(body?.socialProfileVisibility, visibilityOptions) as "public" | "followers" | "private" | undefined,
    socialAllowComments: typeof body?.socialAllowComments === "boolean" ? body.socialAllowComments : undefined,
    socialAllowMentions: typeof body?.socialAllowMentions === "boolean" ? body.socialAllowMentions : undefined,
    socialStoryReplies: typeof body?.socialStoryReplies === "boolean" ? body.socialStoryReplies : undefined,
    socialDirectMessages: pickString(body?.socialDirectMessages, messageOptions) as "everyone" | "followers" | "none" | undefined,
    socialShareActivity: typeof body?.socialShareActivity === "boolean" ? body.socialShareActivity : undefined,
    socialShowOnlineStatus: typeof body?.socialShowOnlineStatus === "boolean" ? body.socialShowOnlineStatus : undefined,
    socialContentLanguage: pickString(body?.socialContentLanguage, languageOptions) as "tr" | "en" | "both" | undefined,
  });
  return NextResponse.json({ settings });
}
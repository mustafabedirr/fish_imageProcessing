import { NextRequest, NextResponse } from "next/server";
import { setFollow } from "../../../lib/server/aquascope-db";
import { requireSessionUser } from "../../../lib/server/auth-session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const followingId = String(body?.followingId ?? "");
  const active = body?.active !== false;
  const sessionUser = await requireSessionUser(request);

  if (!sessionUser) {
    return NextResponse.json({ error: "Takip islemi icin oturum acin." }, { status: 401 });
  }

  try {
    const follows = await setFollow(sessionUser.id, followingId, active);
    return NextResponse.json({ follows });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Takip islemi tamamlanamadi." },
      { status: 400 }
    );
  }
}
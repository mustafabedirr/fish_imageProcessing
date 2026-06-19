import { NextRequest, NextResponse } from "next/server";
import { setFollow } from "../../../lib/server/aquascope-db";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const followerId = String(body?.followerId ?? "");
  const followingId = String(body?.followingId ?? "");
  const active = body?.active !== false;

  try {
    const follows = await setFollow(followerId, followingId, active);
    return NextResponse.json({ follows });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Takip islemi tamamlanamadi." },
      { status: 400 }
    );
  }
}
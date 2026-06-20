import { NextRequest, NextResponse } from "next/server";
import { setPostLike } from "../../../../../lib/server/aquascope-db";
import { requireSessionUser } from "../../../../../lib/server/auth-session";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const sessionUser = await requireSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: "Begenmek icin oturum acin." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const active = body?.active !== false;

  try {
    const result = await setPostLike(params.id, sessionUser.id, active);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Begeni kaydedilemedi." }, { status: 400 });
  }
}
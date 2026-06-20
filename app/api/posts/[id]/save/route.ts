import { NextRequest, NextResponse } from "next/server";
import { setPostSave } from "../../../../../lib/server/aquascope-db";
import { requireSessionUser } from "../../../../../lib/server/auth-session";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const sessionUser = await requireSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: "Kaydetmek icin oturum acin." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const active = body?.active !== false;

  try {
    const result = await setPostSave(params.id, sessionUser.id, active);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Kaydetme islemi tamamlanamadi." }, { status: 400 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { archiveAnalyzedSpecies, listLibraryArchive } from "../../../../lib/server/aquascope-db";
import { requireSessionUser } from "../../../../lib/server/auth-session";

export async function GET(request: NextRequest) {
  const sessionUser = await requireSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ items: [] });
  }

  const items = await listLibraryArchive(sessionUser.id);
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const sessionUser = await requireSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const item = await archiveAnalyzedSpecies({
      userId: sessionUser.id,
      species: String(body?.species ?? "").trim(),
      latin: body?.latin ? String(body.latin) : undefined,
      score: Number(body?.score ?? 0),
      imageUrl: body?.imageUrl ? String(body.imageUrl) : undefined,
      tags: Array.isArray(body?.tags) ? body.tags.map(String) : undefined,
    });

    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Arsiv kaydi olusturulamadi." },
      { status: 400 }
    );
  }
}

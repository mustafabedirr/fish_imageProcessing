import { NextResponse } from "next/server";
import { getUserSocialSummary } from "../../../../../lib/server/aquascope-db";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const summary = await getUserSocialSummary(params.id);
    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Profil sosyal verisi yuklenemedi." },
      { status: 404 }
    );
  }
}
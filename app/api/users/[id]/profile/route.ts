import { NextRequest, NextResponse } from "next/server";
import { updateProfile } from "../../../../../lib/server/aquascope-db";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => null);

  try {
    const user = await updateProfile(params.id, {
      name: body?.name ? String(body.name) : undefined,
      handle: body?.handle ? String(body.handle) : undefined,
      region: body?.region ? String(body.region) : undefined,
      level: body?.level ? String(body.level) : undefined,
      bio: body?.bio ? String(body.bio) : undefined,
      avatarUrl: body?.avatarUrl ? String(body.avatarUrl) : undefined,
      coverUrl: body?.coverUrl ? String(body.coverUrl) : undefined,
      interests: Array.isArray(body?.interests) ? body.interests.map(String) : undefined,
      experience: body?.experience ? String(body.experience) : undefined,
      visibility: body?.visibility === "followers" || body?.visibility === "private" ? body.visibility : "public",
      onboardingCompleted: typeof body?.onboardingCompleted === "boolean" ? body.onboardingCompleted : undefined,
      catches: typeof body?.catches === "number" ? body.catches : undefined,
      analyses: typeof body?.analyses === "number" ? body.analyses : undefined,
    });
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Profil guncellenemedi." },
      { status: 400 }
    );
  }
}
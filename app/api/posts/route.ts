import { NextRequest, NextResponse } from "next/server";
import { createPost, listPosts } from "../../../lib/server/aquascope-db";
import { validatePostBody } from "../../../lib/validation/post-schema";

export async function GET() {
  const posts = await listPosts();
  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const postBody = String(body?.body ?? body?.text ?? "");
  const error = validatePostBody(postBody);

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    const post = await createPost({
      userId: String(body?.userId ?? ""),
      body: postBody,
      kind: body?.kind,
      tags: Array.isArray(body?.tags) ? body.tags.map(String) : [],
      mediaUrls: Array.isArray(body?.mediaUrls) ? body.mediaUrls.map(String) : [],
      region: body?.region ? String(body.region) : undefined,
      species: body?.species ? String(body.species) : undefined,
    });

    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Paylasim kaydedilemedi." },
      { status: 400 }
    );
  }
}
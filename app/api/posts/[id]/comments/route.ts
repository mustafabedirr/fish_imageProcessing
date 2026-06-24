import { NextRequest, NextResponse } from "next/server";
import { addPostComment, listPostComments } from "../../../../../lib/server/aquascope-db";
import { requireSessionUser } from "../../../../../lib/server/auth-session";


export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const comments = await listPostComments(params.id);
    return NextResponse.json({ comments });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Yorumlar yuklenemedi." }, { status: 400 });
  }
}
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const sessionUser = await requireSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: "Yorum yapmak icin oturum acin." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const commentBody = String(body?.body ?? body?.comment ?? "");

  try {
    const comment = await addPostComment(params.id, sessionUser.id, commentBody);
    return NextResponse.json({ comment });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Yorum kaydedilemedi." }, { status: 400 });
  }
}
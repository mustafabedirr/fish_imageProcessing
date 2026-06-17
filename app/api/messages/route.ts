import { NextResponse } from "next/server";
import { conversations, messages } from "../../../lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ conversations, messages });
}

import { NextResponse } from "next/server";
import { listUsers } from "../../../lib/server/aquascope-db";

export async function GET() {
  const users = await listUsers();
  return NextResponse.json({ users });
}
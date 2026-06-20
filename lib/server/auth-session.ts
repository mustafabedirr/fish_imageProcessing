import type { NextRequest, NextResponse } from "next/server";
import { prisma } from "./prisma";

export const sessionCookieName = "aquascope_session_user_id";
const sessionMaxAge = 60 * 60 * 24 * 30;

export function setSessionCookie(response: NextResponse, userId: string) {
  response.cookies.set(sessionCookieName, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionMaxAge,
  });
  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(sessionCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export function getSessionUserId(request: NextRequest) {
  return request.cookies.get(sessionCookieName)?.value ?? null;
}

export async function requireSessionUser(request: NextRequest) {
  const userId = getSessionUserId(request);
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
}
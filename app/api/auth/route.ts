import { NextRequest, NextResponse } from "next/server";
import { loginUser, registerUser } from "../../../lib/server/aquascope-db";
import { clearSessionCookie, setSessionCookie } from "../../../lib/server/auth-session";
import { validateEmail, validatePassword } from "../../../lib/validation/auth-schema";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "");
  const password = String(body?.password ?? "");
  const mode = String(body?.mode ?? "login");
  const name = String(body?.name ?? body?.fullName ?? "");

  if (!validateEmail(email) || !validatePassword(password)) {
    return NextResponse.json(
      { error: "Gecerli e-posta ve en az 8 karakterlik sifre girin." },
      { status: 400 }
    );
  }

  try {
    if (mode === "register") {
      if (name.trim().length < 2) {
        return NextResponse.json(
          { error: "Profil olusturmak icin ad soyad bilgisi gerekli." },
          { status: 400 }
        );
      }

      const user = await registerUser({ name, email, password });
      return setSessionCookie(
        NextResponse.json({ authenticated: true, nextStep: "onboarding", user }),
        user.id
      );
    }

    const user = await loginUser(email, password);
    return setSessionCookie(
      NextResponse.json({ authenticated: true, nextStep: user.onboardingCompleted ? "platform" : "onboarding", user }),
      user.id
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Kimlik dogrulama tamamlanamadi." },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  return clearSessionCookie(NextResponse.json({ authenticated: false }));
}
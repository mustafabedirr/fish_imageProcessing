"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "../../../hooks/use-current-user";
import MobilePlatformNav from "./mobile-platform-nav";
import SisyphusSidebar from "./sisyphus-sidebar";

export default function PlatformLayoutShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, ready } = useCurrentUser();

  useEffect(() => {
    if (!ready) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!user.onboardingCompleted) {
      router.replace("/onboarding");
    }
  }, [pathname, ready, router, user]);

  if (!ready || !user || !user.onboardingCompleted) {
    return (
      <div className="platform-session-loading">
        <div>
          <span />
          <strong>Oturum kontrol ediliyor</strong>
          <p>Profil ve servis eri�imleri haz�rlan�yor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <SisyphusSidebar />
      <div>
        <MobilePlatformNav />
        <main key={pathname} className="platform-main platform-main--route-transition">{children}</main>
      </div>
    </div>
  );
}
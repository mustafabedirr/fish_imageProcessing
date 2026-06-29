"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ElementType } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useCurrentUser } from "../../../hooks/use-current-user";
import { defaultProfileAvatarUrl } from "../../../lib/constants";
import {
  BarChart3,
  ChevronDown,
  ChevronsLeft,
  Fish,
  LayoutDashboard,
  LogOut,
  MapPin,
  Settings,
  User,
  Users,
} from "lucide-react";

type SidebarNavItem = {
  href: string;
  label: string;
  icon: ElementType;
  rootMatch?: string;
  hidden?: boolean;
};

const primaryItems: SidebarNavItem[] = [
  { href: "/platform/dashboard", label: "Dashboard", icon: LayoutDashboard, rootMatch: "/platform", hidden: true },
  { href: "/platform/analyze", label: "Analiz", icon: BarChart3 },
  { href: "/platform/map", label: "Harita", icon: MapPin },
  { href: "/platform/library", label: "Tür Kütüphanesi", icon: Fish },
  { href: "/platform/social", label: "Sosyal Alan", icon: Users },
  { href: "/platform/profile", label: "Profil", icon: User },
];

const lowerItems: SidebarNavItem[] = [
  { href: "/platform/settings", label: "Ayarlar", icon: Settings },
];

export default function SisyphusSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useCurrentUser();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setPortalReady(true);
    const savedState = window.localStorage.getItem("aquascope-sidebar-collapsed");
    const shouldCollapse = savedState === "true";
    setCollapsed(shouldCollapse);
    document.body.classList.toggle("sidebar-collapsed", shouldCollapse);
  }, []);

  function toggleSidebar() {
    setCollapsed((current) => {
      const next = !current;
      document.body.classList.toggle("sidebar-collapsed", next);
      window.localStorage.setItem("aquascope-sidebar-collapsed", String(next));
      return next;
    });
  }

  const displayName = user?.name ?? "AquaScope User";
  const displayEmail = user?.email ?? `${user?.handle ?? "@aquascope"}`;
  const avatarUrl = user?.avatarUrl ?? defaultProfileAvatarUrl;

  function confirmLogout() {
    logout();
    setShowLogoutModal(false);
    router.push("/login");
  }

  return (
    <aside className={collapsed ? "sidebar sisyphus-sidebar aqua-sidebar aqua-sidebar--collapsed" : "sidebar sisyphus-sidebar aqua-sidebar"}>
      <div className="aqua-sidebar__panel">
        <div className="aqua-sidebar__header">
          {collapsed ? (
            <button
              className="aqua-sidebar__brand-wrap aqua-sidebar__brand-trigger"
              type="button"
              aria-label="Expand sidebar"
              onClick={toggleSidebar}
            >
              <LogoMark />
            </button>
          ) : (
            <>
              <div className="aqua-sidebar__brand-wrap">
                <LogoMark />

                <div className="aqua-sidebar__brand-copy">
                  <h1 aria-label="AquaScope">
                    <span>Aqua</span>
                    <span className="aqua-sidebar__brand-accent">Scope</span>
                  </h1>
                </div>
              </div>

              <button className="aqua-sidebar__theme" type="button" aria-label="Collapse sidebar" aria-pressed={collapsed} onClick={toggleSidebar}>
                <ChevronsLeft size={20} />
              </button>
            </>
          )}
        </div>

        <div className="aqua-sidebar__body">
          <nav className="aqua-sidebar__menu aqua-sidebar__menu--top" aria-label="Primary navigation">
            <SectionTitle title="ANA MENÜ" />
            {primaryItems.filter((item) => !item.hidden).map((item) => {
              const active = isSidebarItemActive(pathname, item.href, item.rootMatch);
              return <SidebarItem key={item.label} href={item.href} label={item.label} icon={item.icon} active={active} />;
            })}
          </nav>

          <div className="aqua-sidebar__section">
            <SectionTitle title="ARAÇLAR" />

            <div className="aqua-sidebar__menu aqua-sidebar__menu--org">
              {lowerItems.map((item) => {
                const active = isSidebarItemActive(pathname, item.href);
                return <SidebarItem key={item.label} href={item.href} label={item.label} icon={item.icon} active={active} compact />;
              })}
            </div>
          </div>
        </div>

        <div className="aqua-sidebar__footer">
          <Link href="/platform/profile" className="aqua-sidebar__user">
            <div className="aqua-sidebar__avatar-wrap">
              <img
                src={avatarUrl}
                alt={displayName}
              />
              <span className="aqua-sidebar__status" aria-hidden />
            </div>

            <div className="aqua-sidebar__user-text">
              <strong>{displayName}</strong>
              <span>{displayEmail}</span>
            </div>

            <span className="aqua-sidebar__settings" aria-hidden>
              <ChevronDown size={18} />
            </span>
          </Link>

          <button className="aqua-sidebar__logout aqua-sidebar__logout--icon" type="button" aria-label="Cikis Yap" onClick={() => setShowLogoutModal(true)}>
            <LogOut className="aqua-sidebar__logout-icon" size={20} />
          </button>
        </div>
      </div>

      {showLogoutModal && portalReady
        ? createPortal(
            <div className="logout-modal-layer" role="dialog" aria-modal="true" aria-labelledby="logout-modal-title">
              <div className="logout-modal-card">
                <span className="logout-modal-icon" aria-hidden>
                  <LogOut size={22} />
                </span>
                <span className="logout-modal-kicker">Oturum Onayı</span>
                <h2 id="logout-modal-title">Çıkış yapmak istediğinize emin misiniz?</h2>
                <div className="logout-modal-actions">
                  <button className="logout-stay-button" type="button" onClick={() => setShowLogoutModal(false)}>
                    Sayfada Kal
                  </button>
                  <button className="logout-confirm-button" type="button" onClick={confirmLogout}>
                    ??k??
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </aside>
  );
}

function LogoMark() {
  return (
    <div className="aqua-sidebar__logo-box">
      <img src="/aquascope-logo.svg" alt="" className="aqua-sidebar__logo-image" />
    </div>
  );
}

type SidebarItemProps = {
  href: string;
  label: string;
  icon: ElementType;
  active?: boolean;
  compact?: boolean;
};

function SidebarItem({ href, label, icon: Icon, active, compact }: SidebarItemProps) {
  return (
    <Link href={href} className={active ? "aqua-sidebar__item aqua-sidebar__item--active" : "aqua-sidebar__item"}>
      <Icon
        size={compact ? 20 : 22}
        className={active ? "aqua-sidebar__item-icon aqua-sidebar__item-icon--active" : "aqua-sidebar__item-icon"}
      />
      <span className="aqua-sidebar__item-label">{label}</span>
    </Link>
  );
}

function isSidebarItemActive(pathname: string, href: string, rootMatch?: string) {
  if (rootMatch && pathname === rootMatch) return true;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="aqua-sidebar__section-title">
      <h2>{title}</h2>
      <ChevronDown size={16} />
    </div>
  );
}

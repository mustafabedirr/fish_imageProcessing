"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  BarChart3,
  Bell,
  BookOpen,
  ChevronDown,
  ChevronsLeft,
  Database,
  FileText,
  Fish,
  LayoutDashboard,
  LogOut,
  MapPin,
  Settings,
  Sparkles,
  User,
  Users,
} from "lucide-react";

const primaryItems = [
  { href: "/platform/dashboard", label: "Dashboard", icon: LayoutDashboard, matches: ["/platform", "/platform/dashboard"] },
  { href: "/platform/analyze", label: "Analiz", icon: BarChart3 },
  { href: "/platform/map", label: "Harita", icon: MapPin },
  { href: "/platform/library", label: "Tür Kütüphanesi", icon: Fish },
  { href: "/platform/social", label: "Sosyal Alan", icon: Users },
  { href: "/platform/profile", label: "Profil", icon: User },
];

const lowerItems = [
  { href: "/platform/social", label: "Raporlar", icon: FileText },
  { href: "/platform/messages", label: "Veri Setleri", icon: Database },
  { href: "/platform/dashboard", label: "İstatistikler", icon: BookOpen },
  { href: "/platform/settings", label: "Ayarlar", icon: Settings },
];

export default function SisyphusSidebar() {
  const pathname = usePathname();
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
                  <h1>AquaScope</h1>
                </div>
              </div>

              <button className="aqua-sidebar__theme" type="button" aria-label="Collapse sidebar" aria-pressed={collapsed} onClick={toggleSidebar}>
                <ChevronsLeft size={20} />
              </button>
            </>
          )}
        </div>

        <nav className="aqua-sidebar__menu aqua-sidebar__menu--top" aria-label="Primary navigation">
          <SectionTitle title="ANA MENÜ" />
          {primaryItems.map((item) => {
            const active = item.matches
              ? item.matches.some((match) => pathname === match || pathname.startsWith(`${match}/`))
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return <SidebarItem key={item.label} href={item.href} label={item.label} icon={item.icon} active={active} />;
          })}
        </nav>

        <div className="aqua-sidebar__section">
          <SectionTitle title="ARAÇLAR" />

          <div className="aqua-sidebar__menu aqua-sidebar__menu--org">
            {lowerItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return <SidebarItem key={item.label} href={item.href} label={item.label} icon={item.icon} active={active} compact />;
            })}
          </div>
        </div>

        <div className="aqua-sidebar__spacer" />

        <Link href="/platform/analyze" className="aqua-sidebar__insight-card">
          <div>
            <strong>AI Destekli Analiz</strong>
            <p>Akıllı analiz ile içgörüleri keşfedin.</p>
          </div>
          <Sparkles size={17} />
        </Link>

        <button className="aqua-sidebar__notification" type="button" aria-label="Bildirimler">
          <Bell size={21} />
          <span>3</span>
        </button>

        <Link href="/platform/profile" className="aqua-sidebar__user">
          <div className="aqua-sidebar__avatar-wrap">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80"
              alt="Derya Yılmaz"
            />
            <span className="aqua-sidebar__status" aria-hidden />
          </div>

          <div className="aqua-sidebar__user-text">
            <strong>Derya Yılmaz</strong>
            <span>derya@aquascope.io</span>
          </div>

          <span className="aqua-sidebar__settings" aria-hidden>
            <ChevronDown size={18} />
          </span>
        </Link>
      </div>

      {showLogoutModal && portalReady
        ? createPortal(
            <div className="logout-modal-layer" role="dialog" aria-modal="true" aria-labelledby="logout-modal-title">
              <div className="logout-modal-card">
                <span className="logout-modal-icon" aria-hidden>
                  <LogOut size={22} />
                </span>
                <h2 id="logout-modal-title">Cikis yapmak istediginize emin misiniz?</h2>
                <p>Oturumunuz kapatilacak ve giris ekranina yonlendirileceksiniz.</p>
                <div className="logout-modal-actions">
                  <button className="logout-stay-button" type="button" onClick={() => setShowLogoutModal(false)}>
                    Sayfada Kal
                  </button>
                  <Link className="logout-confirm-button" href="/">
                    Cikis
                  </Link>
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
  icon: React.ElementType;
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

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="aqua-sidebar__section-title">
      <h2>{title}</h2>
      <ChevronDown size={16} />
    </div>
  );
}

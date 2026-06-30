"use client";

import { useEffect, useState } from "react";
import AccountSettings from "../../../components/platform/settings/account-settings";
import BackendStatus from "../../../components/platform/settings/backend-status";
import SettingsPanels, { defaultPlatformSettings, type PlatformSettings } from "../../../components/platform/settings/settings-panels";
import AnimatedTabBar from "../../../components/ui/animated-tab-bar";
import { useCurrentUser } from "../../../hooks/use-current-user";
import { AlertCircle, Check, Info, Loader2, Search, Trash2 } from "lucide-react";

const tabs = ["Genel", "Bildirimler", "Sosyal", "Entegrasyonlar", "Veri & Gizlilik"] as const;
type SettingsTab = (typeof tabs)[number];
type NoticeStatus = "success" | "warning" | "error" | "info";
type SettingsToast = {
  id: number;
  message: string;
  status: NoticeStatus;
};

function getNoticeStatus(message: string): NoticeStatus {
  if (message.includes("kaydedildi") || message.includes("yuklendi") || message.includes("guncellendi") || message.includes("hazirlandi") || message.includes("temizlendi")) return "success";
  if (message.includes("kaydedilemedi") || message.includes("bulunamadi") || message.includes("yuklenemedi") || message.includes("vermedi")) return "error";
  if (message.includes("onayi")) return "warning";
  return "info";
}

export default function SettingsPage() {
  const { user } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<SettingsTab>("Genel");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<SettingsToast | null>(null);
  const [settings, setSettings] = useState<PlatformSettings>(defaultPlatformSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const isGeneral = activeTab === "Genel";
  const ToastIcon = toast?.status === "success" ? Check : toast?.status === "error" ? AlertCircle : Info;
  const showNotice = (message: string) => {
    setToast({ id: Date.now(), message, status: getNoticeStatus(message) });
  };
  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;
    setIsLoadingSettings(true);
    fetch(`/api/users/${user.id}/settings`, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("settings_load_failed");
        return response.json();
      })
      .then((payload) => {
        if (!isMounted) return;
        setSettings({ ...defaultPlatformSettings, ...payload.settings });

      })
      .catch(() => {
        if (!isMounted) return;
        showNotice("Ayarlar yuklenemedi, varsayilan degerler kullaniliyor.");
      })
      .finally(() => {
        if (isMounted) setIsLoadingSettings(false);
      });
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => {
      setToast((current) => (current?.id === toast.id ? null : current));
    }, 3000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const updateSetting = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const saveSettings = async () => {
    if (!user?.id) {
      showNotice("Ayar kaydi icin oturum bilgisi bulunamadi.");
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch(`/api/users/${user.id}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error("settings_save_failed");
      const payload = await response.json();
      setSettings({ ...defaultPlatformSettings, ...payload.settings });
      showNotice("Degisiklikler kaydedildi.");
    } catch {
      showNotice("Ayarlar kaydedilemedi. Lutfen tekrar deneyin.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="settings-workspace">
      <header className="settings-header">
        <div>
          <h1>Ayarlar</h1>
          <p>Hesap bilgilerinizi ve uygulama tercihlerinizi yonetin.</p>
        </div>
        <div className="settings-header-actions">
          <label className="settings-search">
            <Search size={18} />
            <input
              placeholder="Ayarlar arasinda ara..."
              aria-label="Ayarlar arasinda ara"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <span>Ctrl K</span>
          </label>
          <button type="button" className="settings-save-button" onClick={saveSettings} disabled={isSaving || isLoadingSettings}>
            {isSaving ? <Loader2 size={19} className="settings-spin" /> : <Check size={19} />}
            {isSaving ? "Kaydediliyor" : "Degisiklikleri Kaydet"}
          </button>
        </div>
      </header>

      <AnimatedTabBar
        ariaLabel="Ayar sekmeleri"
        activeButtonClassName="is-active"
        activeValue={activeTab}
        buttonClassName="settings-tab-button"
        className="settings-tabs"
        layoutId="settings-active-tab"
        onChange={(value) => setActiveTab(value as SettingsTab)}
        tabs={tabs.map((tab) => ({ title: tab, value: tab }))}
      />
      <div key={activeTab} className="settings-stack" data-active-tab={activeTab}>
        {isGeneral ? <AccountSettings activeTab={activeTab} setNotice={showNotice} /> : null}
        {isGeneral || activeTab === "Bildirimler" || activeTab === "Sosyal" || activeTab === "Veri & Gizlilik" ? (
          <SettingsPanels activeTab={activeTab} settings={settings} onSettingChange={updateSetting} setNotice={showNotice} />
        ) : null}
        {isGeneral || activeTab === "Entegrasyonlar" ? <BackendStatus setNotice={showNotice} /> : null}
      </div>

      {isGeneral || activeTab === "Veri & Gizlilik" ? (
        <section className="settings-danger-zone">
          <div>
            <h2>Hesabinizi silmek mi istiyorsunuz?</h2>
            <p>Bu islem geri alinamaz. Tum verileriniz kalici olarak silinecektir.</p>
          </div>
          <button type="button" onClick={() => showNotice("Hesap silme icin guvenlik onayi gerekir.")}>
            <Trash2 size={18} />
            Hesabi Sil
          </button>
        </section>
      ) : null}
      {toast ? (
        <div key={toast.id} className="settings-alert settings-alert--toast" data-status={toast.status} role="status" aria-live="polite">
          <span className="settings-alert-indicator">
            <ToastIcon size={18} />
          </span>
          <div className="settings-alert-content">
            <strong>{toast.status === "success" ? "Islem Basarili" : toast.status === "error" ? "Dikkat Gerekiyor" : toast.status === "warning" ? "Onay Bekleniyor" : "Bilgilendirme"}</strong>
            <p>{toast.message}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
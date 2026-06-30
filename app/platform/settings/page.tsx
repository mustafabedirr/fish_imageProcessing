"use client";

import { useEffect, useState } from "react";
import AccountSettings from "../../../components/platform/settings/account-settings";
import BackendStatus from "../../../components/platform/settings/backend-status";
import SettingsPanels, { defaultPlatformSettings, type PlatformSettings } from "../../../components/platform/settings/settings-panels";
import AnimatedTabBar from "../../../components/ui/animated-tab-bar";
import { useCurrentUser } from "../../../hooks/use-current-user";
import { AlertCircle, Check, Info, Loader2, Search, Trash2 } from "lucide-react";

const tabs = ["Genel", "Bildirimler", "Sosyal", "Gorunum", "Guvenlik", "Entegrasyonlar", "Veri & Gizlilik"] as const;
type SettingsTab = (typeof tabs)[number];

export default function SettingsPage() {
  const { user } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<SettingsTab>("Genel");
  const [searchQuery, setSearchQuery] = useState("");
  const [notice, setNotice] = useState("Ayarlariniz guncellenmeye hazir.");
  const [settings, setSettings] = useState<PlatformSettings>(defaultPlatformSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const isGeneral = activeTab === "Genel";
  const noticeStatus = notice.includes("kaydedildi") || notice.includes("yuklendi") ? "success" : notice.includes("kaydedilemedi") || notice.includes("bulunamadi") || notice.includes("yuklenemedi") ? "error" : notice.includes("onayi") ? "warning" : "info";
  const NoticeIcon = isLoadingSettings ? Loader2 : noticeStatus === "success" ? Check : noticeStatus === "error" ? AlertCircle : Info;

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
        setNotice("Ayarlariniz yuklendi.");
      })
      .catch(() => {
        if (!isMounted) return;
        setNotice("Ayarlar yuklenemedi, varsayilan degerler kullaniliyor.");
      })
      .finally(() => {
        if (isMounted) setIsLoadingSettings(false);
      });
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const updateSetting = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const saveSettings = async () => {
    if (!user?.id) {
      setNotice("Ayar kaydi icin oturum bilgisi bulunamadi.");
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
      setNotice("Degisiklikler kaydedildi.");
    } catch {
      setNotice("Ayarlar kaydedilemedi. Lutfen tekrar deneyin.");
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

      <div className="settings-alert" data-status={isLoadingSettings ? "info" : noticeStatus} role="status">
        <span className="settings-alert-indicator">
          <NoticeIcon size={18} className={isLoadingSettings ? "settings-spin" : undefined} />
        </span>
        <div className="settings-alert-content">
          <strong>{noticeStatus === "success" ? "Islem Basarili" : noticeStatus === "error" ? "Dikkat Gerekiyor" : noticeStatus === "warning" ? "Onay Bekleniyor" : "Bilgilendirme"}</strong>
          <p>{notice}</p>
        </div>
        {searchQuery ? <span className="settings-alert-meta">Arama: {searchQuery}</span> : null}
      </div>

      <div className="settings-stack" data-active-tab={activeTab}>
        {isGeneral || activeTab === "Gorunum" || activeTab === "Guvenlik" ? <AccountSettings activeTab={activeTab} /> : null}
        {isGeneral || activeTab === "Bildirimler" || activeTab === "Sosyal" || activeTab === "Veri & Gizlilik" ? (
          <SettingsPanels activeTab={activeTab} settings={settings} onSettingChange={updateSetting} setNotice={setNotice} />
        ) : null}
        {isGeneral || activeTab === "Entegrasyonlar" ? <BackendStatus setNotice={setNotice} /> : null}
      </div>

      {isGeneral || activeTab === "Veri & Gizlilik" || activeTab === "Guvenlik" ? (
        <section className="settings-danger-zone">
          <div>
            <h2>Hesabinizi silmek mi istiyorsunuz?</h2>
            <p>Bu islem geri alinamaz. Tum verileriniz kalici olarak silinecektir.</p>
          </div>
          <button type="button" onClick={() => setNotice("Hesap silme icin guvenlik onayi gerekir.")}>
            <Trash2 size={18} />
            Hesabi Sil
          </button>
        </section>
      ) : null}
    </section>
  );
}
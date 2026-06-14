"use client";

import { useState } from "react";
import AccountSettings from "../../../components/platform/settings/account-settings";
import BackendStatus from "../../../components/platform/settings/backend-status";
import SettingsPanels from "../../../components/platform/settings/settings-panels";
import AnimatedTabBar from "../../../components/ui/animated-tab-bar";
import { Check, Search, Trash2 } from "lucide-react";

const tabs = ["Genel", "Bildirimler", "Gorunum", "Guvenlik", "Entegrasyonlar", "Veri & Gizlilik"] as const;
type SettingsTab = (typeof tabs)[number];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("Genel");
  const [searchQuery, setSearchQuery] = useState("");
  const [notice, setNotice] = useState("Ayarlariniz guncellenmeye hazir.");
  const isGeneral = activeTab === "Genel";

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
          <button type="button" className="settings-save-button" onClick={() => setNotice("Degisiklikler kaydedildi.")}>
            <Check size={19} />
            Degisiklikleri Kaydet
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

      <div className="settings-feedback" role="status">
        <Check size={16} />
        <span>{notice}</span>
        {searchQuery ? <strong>Arama: {searchQuery}</strong> : null}
      </div>

      <div className="settings-stack" data-active-tab={activeTab}>
        {(isGeneral || activeTab === "Gorunum" || activeTab === "Guvenlik") ? <AccountSettings activeTab={activeTab} /> : null}
        {(isGeneral || activeTab === "Bildirimler" || activeTab === "Veri & Gizlilik") ? <SettingsPanels activeTab={activeTab} setNotice={setNotice} /> : null}
        {(isGeneral || activeTab === "Entegrasyonlar") ? <BackendStatus setNotice={setNotice} /> : null}
      </div>

      {(isGeneral || activeTab === "Veri & Gizlilik" || activeTab === "Guvenlik") ? (
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

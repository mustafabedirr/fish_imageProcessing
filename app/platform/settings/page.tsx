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
            <input placeholder="Ayarlar arasinda ara..." aria-label="Ayarlar arasinda ara" />
            <span>Ctrl K</span>
          </label>
          <button type="button" className="settings-save-button">
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
        onChange={setActiveTab}
        tabs={tabs.map((tab) => ({ title: tab, value: tab }))}
      />

      <div className="settings-stack" data-active-tab={activeTab}>
        <AccountSettings />
        <SettingsPanels />
        <BackendStatus />
      </div>

      <section className="settings-danger-zone">
        <div>
          <h2>Hesabinizi silmek mi istiyorsunuz?</h2>
          <p>Bu islem geri alinamaz. Tum verileriniz kalici olarak silinecektir.</p>
        </div>
        <button type="button">
          <Trash2 size={18} />
          Hesabi Sil
        </button>
      </section>
    </section>
  );
}

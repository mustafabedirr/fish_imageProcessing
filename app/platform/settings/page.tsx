import AccountSettings from "../../../components/platform/settings/account-settings";
import BackendStatus from "../../../components/platform/settings/backend-status";
import SettingsPanels from "../../../components/platform/settings/settings-panels";
import { Check, Search, Trash2 } from "lucide-react";

const tabs = ["Genel", "Bildirimler", "Gorunum", "Guvenlik", "Entegrasyonlar", "Veri & Gizlilik"];

export default function SettingsPage() {
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

      <nav className="settings-tabs" aria-label="Ayar sekmeleri">
        {tabs.map((tab, index) => (
          <button type="button" className={index === 0 ? "is-active" : ""} key={tab}>
            {tab}
          </button>
        ))}
      </nav>

      <div className="settings-stack">
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

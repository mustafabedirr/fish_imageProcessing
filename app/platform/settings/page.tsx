import AccountSettings from "../../../components/platform/settings/account-settings";
import BackendStatus from "../../../components/platform/settings/backend-status";
import SettingsPanels from "../../../components/platform/settings/settings-panels";

export default function SettingsPage() {
  return (
    <section className="settings-workspace">
      <header className="settings-header">
        <div>
          <h1>Ayarlar</h1>
          <p>Hesap bilgilerinizi ve uygulama tercihlerinizi yonetin.</p>
        </div>
        <button type="button" className="settings-save-button">
          Degisiklikleri Kaydet
        </button>
      </header>

      <div className="settings-stack">
        <AccountSettings />
        <SettingsPanels />
        <BackendStatus />
      </div>

      <p className="settings-secure-note">Tum ayarlariniz guvenle saklanir ve yalnizca sizin tarafinizdan goruntulenir.</p>
    </section>
  );
}

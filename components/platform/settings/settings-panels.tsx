"use client";

import { useState } from "react";
import { Bell, BookOpen, BriefcaseBusiness, CloudCog, DatabaseZap, SlidersHorizontal } from "lucide-react";

const preferences = [
  {
    title: "Analizden sonra sonucu kutuphaneye ekle",
    description: "Yaptiginiz analizler otomatik olarak kutuphanenize kaydedilir.",
    icon: BookOpen,
  },
  {
    title: "Bolge yogunlugu uyarilarini goster",
    description: "Secilen bolgelerde yogunluk degisimlerinde bildirim alin.",
    icon: Bell,
  },
];

export default function SettingsPanels({
  activeTab,
  setNotice,
}: {
  activeTab?: string;
  setNotice: (notice: string) => void;
}) {
  const [enabledPreferences, setEnabledPreferences] = useState<Record<string, boolean>>(
    Object.fromEntries(preferences.map((item) => [item.title, true])),
  );
  const [syncInterval, setSyncInterval] = useState("15 Dakikada Bir");
  const [cacheCleared, setCacheCleared] = useState(false);
  const [backupReady, setBackupReady] = useState(false);
  const showPreferences = activeTab !== "Veri & Gizlilik";
  const showSync = activeTab !== "Bildirimler";

  return (
    <>
      {showPreferences ? (
      <section className="settings-card settings-card--preferences">
        <header className="settings-card-head">
          <span>
            <SlidersHorizontal size={22} />
          </span>
          <div>
            <h2>Tercihler</h2>
            <p>Uygulama tercihlerinizi yonetin.</p>
          </div>
        </header>

        <div className="settings-preference-grid">
          {preferences.map(({ title, description, icon: Icon }) => (
            <label className="settings-preference-item" key={title}>
              <span className="settings-preference-icon">
                <Icon size={22} />
              </span>
              <span>
                <strong>{title}</strong>
                <small>{description}</small>
              </span>
              <input
                type="checkbox"
                checked={enabledPreferences[title]}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setEnabledPreferences((current) => ({ ...current, [title]: checked }));
                  setNotice(`${title}: ${checked ? "aktif" : "pasif"}.`);
                }}
              />
              <i aria-hidden />
            </label>
          ))}
        </div>
      </section>
      ) : null}

      {showSync ? (
      <section className="settings-card settings-card--sync">
        <header className="settings-card-head">
          <span>
            <CloudCog size={22} />
          </span>
          <div>
            <h2>Veri & Senkronizasyon</h2>
            <p>Verilerinizi yonetin ve senkronizasyon ayarlarini duzenleyin.</p>
          </div>
        </header>

        <div className="settings-sync-list">
          <article>
            <span className="settings-preference-icon">
              <CloudCog size={21} />
            </span>
            <div>
              <strong>Otomatik Senkronizasyon</strong>
              <small>Verileriniz arka planda otomatik senkronize edilir.</small>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = syncInterval === "15 Dakikada Bir" ? "Saatte Bir" : syncInterval === "Saatte Bir" ? "Manuel" : "15 Dakikada Bir";
                setSyncInterval(next);
                setNotice(`Senkronizasyon sikligi: ${next}.`);
              }}
            >
              {syncInterval}
              <SlidersHorizontal size={15} />
            </button>
          </article>
          <article>
            <span className="settings-preference-icon">
              <DatabaseZap size={21} />
            </span>
            <div>
              <strong>Veri On Bellegini Temizle</strong>
              <small>Gecici verileri temizleyerek uygulama performansini artirin.</small>
            </div>
            <button
              type="button"
              className={cacheCleared ? "is-complete" : ""}
              onClick={() => {
                setCacheCleared(true);
                setNotice("Gecici veri on bellegi temizlendi.");
              }}
            >
              {cacheCleared ? "Temizlendi" : "Temizle"}
            </button>
          </article>
          <article>
            <span className="settings-preference-icon">
              <BriefcaseBusiness size={21} />
            </span>
            <div>
              <strong>Veri Yedekleme</strong>
              <small>Hesap verilerinizin yedegini indirin.</small>
            </div>
            <button
              type="button"
              className={backupReady ? "is-complete" : ""}
              onClick={() => {
                setBackupReady(true);
                setNotice("Yedek dosyasi hazirlandi.");
              }}
            >
              {backupReady ? "Hazir" : "Yedekle"}
            </button>
          </article>
        </div>
      </section>
      ) : null}
    </>
  );
}

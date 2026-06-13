"use client";

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

export default function SettingsPanels() {
  return (
    <>
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
              <input type="checkbox" defaultChecked />
              <i aria-hidden />
            </label>
          ))}
        </div>
      </section>

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
            <button type="button">
              15 Dakikada Bir
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
            <button type="button">Temizle</button>
          </article>
          <article>
            <span className="settings-preference-icon">
              <BriefcaseBusiness size={21} />
            </span>
            <div>
              <strong>Veri Yedekleme</strong>
              <small>Hesap verilerinizin yedegini indirin.</small>
            </div>
            <button type="button">Yedekle</button>
          </article>
        </div>
      </section>
    </>
  );
}

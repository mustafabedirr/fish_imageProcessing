"use client";

import { Bell, BookOpen, SlidersHorizontal } from "lucide-react";

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
    <section className="settings-card settings-card--preferences">
      <header className="settings-card-head">
        <span>
          <SlidersHorizontal size={22} />
        </span>
        <div>
          <h2>Tercihler</h2>
          <p>Uygulama tercihlerinizi ozellestirin.</p>
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
  );
}

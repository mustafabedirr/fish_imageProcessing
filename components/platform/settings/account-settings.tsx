"use client";

import { ChevronDown, MapPin, User } from "lucide-react";

export default function AccountSettings() {
  return (
    <section className="settings-card settings-card--account">
      <header className="settings-card-head">
        <span>
          <User size={22} />
        </span>
        <div>
          <h2>Hesap Bilgileri</h2>
          <p>Kisisel bilgilerinizi guncelleyin.</p>
        </div>
      </header>

      <div className="settings-form-grid">
        <label className="settings-field">
          <span>Ad</span>
          <div className="settings-input-shell">
            <User size={20} />
            <input defaultValue="Deniz Arslan" />
          </div>
        </label>

        <label className="settings-field">
          <span>Bolge</span>
          <div className="settings-input-shell">
            <MapPin size={20} />
            <select defaultValue="izmir">
              <option value="izmir">Izmir Korfezi</option>
              <option value="ege">Kuzey Ege Bolgesi</option>
              <option value="akdeniz">Akdeniz Kiyilari</option>
              <option value="karadeniz">Karadeniz Hatti</option>
            </select>
            <ChevronDown className="settings-select-icon" size={18} />
          </div>
        </label>
      </div>
    </section>
  );
}

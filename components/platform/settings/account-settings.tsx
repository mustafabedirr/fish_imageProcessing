"use client";

import { ChevronDown, Mail, MapPin, Pencil, User } from "lucide-react";

const profileImage = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=85";

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

      <div className="settings-account-layout">
        <div className="settings-avatar-field">
          <span>Profil Fotografı</span>
          <button type="button" aria-label="Profil fotografini degistir">
            <img src={profileImage} alt="Derya Yilmaz" />
            <i>
              <Pencil size={16} />
            </i>
          </button>
        </div>

        <div className="settings-form-grid">
          <label className="settings-field">
            <span>Ad Soyad</span>
            <div className="settings-input-shell">
              <User size={18} />
              <input defaultValue="Derya Yilmaz" />
            </div>
          </label>

          <label className="settings-field">
            <span>E-posta</span>
            <div className="settings-input-shell">
              <Mail size={18} />
              <input defaultValue="derya@aquascope.io" type="email" />
            </div>
          </label>

          <label className="settings-field settings-field--wide">
            <span>Bolge</span>
            <div className="settings-input-shell">
              <MapPin size={18} />
              <select defaultValue="izmir">
                <option value="izmir">Izmir Korfezi, Turkiye</option>
                <option value="ege">Kuzey Ege Bolgesi</option>
                <option value="akdeniz">Akdeniz Kiyilari</option>
                <option value="karadeniz">Karadeniz Hatti</option>
              </select>
              <ChevronDown className="settings-select-icon" size={18} />
            </div>
          </label>
        </div>
      </div>
    </section>
  );
}

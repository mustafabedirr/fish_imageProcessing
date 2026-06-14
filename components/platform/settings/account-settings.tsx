"use client";

import { useRef, useState } from "react";
import { ChevronDown, Mail, MapPin, Pencil, User } from "lucide-react";

const profileImage = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=85";

export default function AccountSettings({ activeTab }: { activeTab?: string }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState("Derya Yilmaz");
  const [email, setEmail] = useState("derya@aquascope.io");
  const [region, setRegion] = useState("izmir");
  const [avatar, setAvatar] = useState(profileImage);

  function handleAvatarUpload(file: File | null) {
    if (!file) return;
    setAvatar(URL.createObjectURL(file));
  }

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
          <button type="button" aria-label="Profil fotografini degistir" onClick={() => fileInputRef.current?.click()}>
            <img src={avatar} alt={name} />
            <i>
              <Pencil size={16} />
            </i>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={(event) => handleAvatarUpload(event.target.files?.[0] ?? null)}
          />
          <small>{activeTab === "Gorunum" ? "Profil gorseli gorunum ayarlarinda da kullanilir." : "JPG, PNG veya WEBP yukleyin."}</small>
        </div>

        <div className="settings-form-grid">
          <label className="settings-field">
            <span>Ad Soyad</span>
            <div className="settings-input-shell">
              <User size={18} />
              <input value={name} onChange={(event) => setName(event.target.value)} />
            </div>
          </label>

          <label className="settings-field">
            <span>E-posta</span>
            <div className="settings-input-shell">
              <Mail size={18} />
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
            </div>
          </label>

          <label className="settings-field settings-field--wide">
            <span>Bolge</span>
            <div className="settings-input-shell">
              <MapPin size={18} />
              <select value={region} onChange={(event) => setRegion(event.target.value)}>
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

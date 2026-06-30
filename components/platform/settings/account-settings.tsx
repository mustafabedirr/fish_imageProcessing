"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AtSign, ChevronDown, Mail, MapPin, Pencil, User } from "lucide-react";
import { useCurrentUser } from "../../../hooks/use-current-user";
import { defaultProfileAvatarUrl } from "../../../lib/constants";

const regionOptions = [
  { value: "izmir", label: "Izmir Korfezi, Turkiye" },
  { value: "ege", label: "Kuzey Ege Bolgesi" },
  { value: "akdeniz", label: "Akdeniz Kiyilari" },
  { value: "karadeniz", label: "Karadeniz Hatti" },
];

type AccountSettingsProps = {
  activeTab?: string;
  setNotice?: (message: string) => void;
};

function normalizeHandle(value: string) {
  const handle = value.trim().replace(/^@+/, "").replace(/\s+/g, "").toLowerCase();
  return handle ? `@${handle}` : "@aquascope";
}

function resolveRegionValue(region?: string) {
  if (!region) return regionOptions[0].value;
  return regionOptions.find((option) => option.value === region || option.label === region)?.value ?? regionOptions[0].value;
}

export default function AccountSettings({ activeTab, setNotice }: AccountSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user, updateUser } = useCurrentUser();
  const [name, setName] = useState("Derya Yilmaz");
  const [handle, setHandle] = useState("@deryayilmaz");
  const [email, setEmail] = useState("derya@aquascope.io");
  const [region, setRegion] = useState("izmir");
  const [avatar, setAvatar] = useState(defaultProfileAvatarUrl);
  const selectedRegionLabel = useMemo(() => regionOptions.find((option) => option.value === region)?.label ?? regionOptions[0].label, [region]);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setHandle(user.handle);
    setEmail(user.email ?? "");
    setRegion(resolveRegionValue(user.region));
    setAvatar(user.avatarUrl ?? defaultProfileAvatarUrl);
  }, [user]);

  async function persistAccount(nextAvatar = avatar, nextRegionValue = region) {
    if (!user?.id) {
      setNotice?.("Hesap kaydi icin oturum bilgisi bulunamadi.");
      return;
    }

    const nextUser = {
      name: name.trim() || user.name,
      handle: normalizeHandle(handle || user.handle),
      email: email.trim() || user.email,
      region: regionOptions.find((option) => option.value === nextRegionValue)?.label ?? selectedRegionLabel,
      avatarUrl: nextAvatar,
    };

    setHandle(nextUser.handle);
    updateUser(nextUser);

    try {
      const response = await fetch(`/api/users/${user.id}/profile`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: nextUser.name,
          handle: nextUser.handle,
          region: nextUser.region,
          avatarUrl: nextUser.avatarUrl,
        }),
      });
      if (!response.ok) throw new Error("profile_update_failed");
      const payload = await response.json().catch(() => null);
      if (payload?.user) updateUser(payload.user);
      setNotice?.("Hesap bilgileri guncellendi.");
    } catch {
      setNotice?.("Hesap bilgileri kaydedilemedi. Lutfen tekrar deneyin.");
    }
  }

  function handleAvatarUpload(file: File | null) {
    if (!file) return;
    const nextAvatar = URL.createObjectURL(file);
    setAvatar(nextAvatar);
    void persistAccount(nextAvatar);
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
          <span>Profil Fotografi</span>
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
          <small>JPG, PNG veya WEBP yukleyin.</small>
        </div>

        <div className="settings-form-grid">
          <label className="settings-field">
            <span>Ad Soyad</span>
            <div className="settings-input-shell">
              <User size={18} />
              <input value={name} onChange={(event) => setName(event.target.value)} onBlur={() => void persistAccount()} />
            </div>
          </label>

          <label className="settings-field">
            <span>Kullanici Adi</span>
            <div className="settings-input-shell">
              <AtSign size={18} />
              <input value={handle} onChange={(event) => setHandle(event.target.value)} onBlur={() => void persistAccount()} />
            </div>
          </label>

          <label className="settings-field">
            <span>E-posta</span>
            <div className="settings-input-shell">
              <Mail size={18} />
              <input value={email} onChange={(event) => setEmail(event.target.value)} onBlur={() => void persistAccount()} type="email" />
            </div>
          </label>

          <label className="settings-field">
            <span>Bolge</span>
            <div className="settings-input-shell">
              <MapPin size={18} />
              <select
                value={region}
                onChange={(event) => {
                  const nextRegion = event.target.value;
                  setRegion(nextRegion);
                  void persistAccount(avatar, nextRegion);
                }}
              >
                {regionOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <ChevronDown className="settings-select-icon" size={18} />
            </div>
          </label>
        </div>
      </div>
    </section>
  );
}

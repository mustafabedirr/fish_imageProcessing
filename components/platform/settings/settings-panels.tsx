"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AtSign,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CloudCog,
  DatabaseZap,
  Eye,
  Globe2,
  MessageCircle,
  Radio,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
} from "lucide-react";


export type PlatformSettings = {
  addResultsToLibrary: boolean;
  densityAlerts: boolean;
  syncInterval: string;
  emailNotifications: boolean;
  socialProfileVisibility: "public" | "followers" | "private";
  socialAllowComments: boolean;
  socialAllowMentions: boolean;
  socialStoryReplies: boolean;
  socialDirectMessages: "everyone" | "followers" | "none";
  socialShareActivity: boolean;
  socialShowOnlineStatus: boolean;
  socialContentLanguage: "tr" | "en" | "both";
};

export const defaultPlatformSettings: PlatformSettings = {
  addResultsToLibrary: true,
  densityAlerts: true,
  syncInterval: "15m",
  emailNotifications: true,
  socialProfileVisibility: "public",
  socialAllowComments: true,
  socialAllowMentions: true,
  socialStoryReplies: true,
  socialDirectMessages: "followers",
  socialShareActivity: true,
  socialShowOnlineStatus: true,
  socialContentLanguage: "tr",
};

type SettingsKey = keyof PlatformSettings;
type BooleanSettingsKey = {
  [K in SettingsKey]: PlatformSettings[K] extends boolean ? K : never;
}[SettingsKey];

type SettingsPanelsProps = {
  activeTab?: string;
  settings: PlatformSettings;
  onSettingChange: <K extends SettingsKey>(key: K, value: PlatformSettings[K]) => void;
  setNotice: (notice: string) => void;
};

const preferences: Array<{
  key: BooleanSettingsKey;
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    key: "addResultsToLibrary",
    title: "Analizden sonra sonucu kutuphaneye ekle",
    description: "Yaptiginiz analizler otomatik olarak kutuphanenize kaydedilir.",
    icon: BookOpen,
  },
  {
    key: "densityAlerts",
    title: "Bolge yogunlugu uyarilarini goster",
    description: "Secilen bolgelerde yogunluk degisimlerinde bildirim alin.",
    icon: Bell,
  },
  {
    key: "emailNotifications",
    title: "E-posta bildirimlerini al",
    description: "Hesap, guvenlik ve sosyal aktivite bildirimleri e-posta ile gelsin.",
    icon: ShieldCheck,
  },
];

const socialToggles: Array<{
  key: BooleanSettingsKey;
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    key: "socialAllowComments",
    title: "Yorumlara izin ver",
    description: "Paylasimlarinizda yorum aksiyonu aktif kalsin.",
    icon: MessageCircle,
  },
  {
    key: "socialAllowMentions",
    title: "Etiketlenmeye izin ver",
    description: "Diger kullanicilar sizi yorum ve paylasimlarda etiketleyebilsin.",
    icon: AtSign,
  },
  {
    key: "socialStoryReplies",
    title: "Story cevaplari",
    description: "Story paylasimlarina cevap alinabilsin.",
    icon: Radio,
  },
  {
    key: "socialShareActivity",
    title: "Aktiviteyi profilde goster",
    description: "Yeni post, begeni ve kaydetme hareketleri profil akisiniza yansisin.",
    icon: UserCheck,
  },
  {
    key: "socialShowOnlineStatus",
    title: "Cevrimici durumu",
    description: "Sosyal alanda aktif oldugunuz takipcilere gosterilsin.",
    icon: Eye,
  },
];

const syncLabels: Record<string, string> = {
  "15m": "15 Dakikada Bir",
  "1h": "Saatte Bir",
  manual: "Manuel",
};

function SegmentedControl<K extends SettingsKey>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: PlatformSettings[K];
  options: Array<{ label: string; value: PlatformSettings[K] }>;
  onChange: (value: PlatformSettings[K]) => void;
}) {
  return (
    <article className="settings-social-option">
      <strong>{label}</strong>
      <div className="settings-segmented-control" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            type="button"
            key={String(option.value)}
            className={option.value === value ? "is-active" : ""}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </article>
  );
}

export default function SettingsPanels({ activeTab, settings, onSettingChange, setNotice }: SettingsPanelsProps) {
  const [cacheCleared, setCacheCleared] = useState(false);
  const [backupReady, setBackupReady] = useState(false);
  const showPreferences = activeTab !== "Veri & Gizlilik" && activeTab !== "Sosyal";
  const showSync = activeTab !== "Bildirimler" && activeTab !== "Sosyal";
  const showSocial = activeTab === "Genel" || activeTab === "Sosyal" || activeTab === "Bildirimler" || activeTab === "Veri & Gizlilik";

  const updateBoolean = (key: BooleanSettingsKey, checked: boolean, title: string) => {
    onSettingChange(key, checked as PlatformSettings[typeof key]);
    setNotice(`${title}: ${checked ? "aktif" : "pasif"}.`);
  };

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
            {preferences.map(({ key, title, description, icon: Icon }) => (
              <label className="settings-preference-item" key={key}>
                <span className="settings-preference-icon">
                  <Icon size={22} />
                </span>
                <span>
                  <strong>{title}</strong>
                  <small>{description}</small>
                </span>
                <input type="checkbox" checked={settings[key]} onChange={(event) => updateBoolean(key, event.target.checked, title)} />
                <i aria-hidden />
              </label>
            ))}
          </div>
        </section>
      ) : null}

      {showSocial ? (
        <section className="settings-card settings-card--social">
          <header className="settings-card-head">
            <span>
              <Globe2 size={22} />
            </span>
            <div>
              <h2>Sosyal Medya Ayarlari</h2>
              <p>Profil, story ve sosyal etkilesim tercihlerinizi yonetin.</p>
            </div>
          </header>

          <div className="settings-social-grid">
            <SegmentedControl
              label="Profil gorunurlugu"
              value={settings.socialProfileVisibility}
              options={[
                { label: "Herkese Acik", value: "public" },
                { label: "Takipciler", value: "followers" },
                { label: "Gizli", value: "private" },
              ]}
              onChange={(value) => {
                onSettingChange("socialProfileVisibility", value);
                setNotice("Profil gorunurlugu guncellendi.");
              }}
            />
            <SegmentedControl
              label="Mesaj izinleri"
              value={settings.socialDirectMessages}
              options={[
                { label: "Herkes", value: "everyone" },
                { label: "Takipciler", value: "followers" },
                { label: "Kapali", value: "none" },
              ]}
              onChange={(value) => {
                onSettingChange("socialDirectMessages", value);
                setNotice("Mesaj izinleri guncellendi.");
              }}
            />
            <SegmentedControl
              label="Icerik dili"
              value={settings.socialContentLanguage}
              options={[
                { label: "Turkce", value: "tr" },
                { label: "Ingilizce", value: "en" },
                { label: "Ikisi", value: "both" },
              ]}
              onChange={(value) => {
                onSettingChange("socialContentLanguage", value);
                setNotice("Icerik dili guncellendi.");
              }}
            />
          </div>

          <div className="settings-preference-grid settings-social-toggle-grid">
            {socialToggles.map(({ key, title, description, icon: Icon }) => (
              <label className="settings-preference-item" key={key}>
                <span className="settings-preference-icon">
                  <Icon size={22} />
                </span>
                <span>
                  <strong>{title}</strong>
                  <small>{description}</small>
                </span>
                <input type="checkbox" checked={settings[key]} onChange={(event) => updateBoolean(key, event.target.checked, title)} />
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
                  const next = settings.syncInterval === "15m" ? "1h" : settings.syncInterval === "1h" ? "manual" : "15m";
                  onSettingChange("syncInterval", next);
                  setNotice(`Senkronizasyon sikligi: ${syncLabels[next]}.`);
                }}
              >
                {syncLabels[settings.syncInterval] ?? settings.syncInterval}
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

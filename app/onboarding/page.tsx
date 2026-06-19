"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Camera, Check, Fish, MapPin, Shield, Sparkles, UserRound } from "lucide-react";
import { getStoredUser, saveStoredUser } from "../../lib/user-session";

const interestOptions = ["Levrek", "�ipura", "Dal��", "K�y� Av�", "Harita Verisi", "AI Analiz"];
const experienceOptions = ["Ba�lang��", "Orta", "Deneyimli", "Profesyonel"];
const visibilityOptions = [
  { value: "public", label: "Herkese A��k", helper: "Profiliniz ve payla��mlar�n�z toplulukta g�r�n�r." },
  { value: "followers", label: "Takip�ilere A��k", helper: "Sosyal i�erikleriniz takip�ilerle s�n�rl� kal�r." },
  { value: "private", label: "Gizli", helper: "Sadece temel profil bilgileriniz g�r�n�r." },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [region, setRegion] = useState("");
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState(experienceOptions[0]);
  const [visibility, setVisibility] = useState<(typeof visibilityOptions)[number]["value"]>("public");
  const [interests, setInterests] = useState<string[]>(["AI Analiz"]);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.onboardingCompleted) {
      router.replace("/platform/social");
      return;
    }

    setName(user.name);
    setHandle(user.handle.replace("@", ""));
    setRegion(user.region === "B�lge se�ilmedi" ? "" : user.region);
    setBio(user.bio ?? "");
    setExperience(user.experience ?? experienceOptions[0]);
    setVisibility(user.visibility ?? "public");
    setInterests(user.interests?.length ? user.interests : ["AI Analiz"]);
    setAvatarUrl(user.avatarUrl ?? "");
    setReady(true);
  }, [router]);

  const selectedVisibility = useMemo(
    () => visibilityOptions.find((item) => item.value === visibility) ?? visibilityOptions[0],
    [visibility]
  );

  function toggleInterest(interest: string) {
    setInterests((current) => current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest]);
  }

  async function finishOnboarding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const current = getStoredUser();
    if (!current) {
      router.replace("/login");
      return;
    }

    if (!name.trim() || !handle.trim() || !region.trim()) {
      setError("Ad, kullan�c� ad� ve b�lge alanlar�n� doldurun.");
      return;
    }

    const completedUser = {
      ...current,
      name: name.trim(),
      handle: `@${handle.trim().replace(/^@/, "")}`,
      region: region.trim(),
      level: experience,
      bio: bio.trim() || "AquaScope ile deniz verilerini ve t�r ke�iflerini takip ediyor.",
      avatarUrl: avatarUrl || current.avatarUrl,
      interests,
      experience,
      visibility,
      onboardingCompleted: true,
    };

    try {
      const response = await fetch(`/api/users/${current.id}/profile`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(completedUser),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(String(data?.error ?? "Profil kaydedilemedi."));
      }
      saveStoredUser(data?.user ?? completedUser);
      router.push("/platform/social");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Profil kaydedilemedi.");
    }
  }

  if (!ready) {
    return (
      <main className="onboarding-page">
        <div className="onboarding-loading">Profil haz�rlan�yor...</div>
      </main>
    );
  }

  return (
    <main className="onboarding-page">
      <section className="onboarding-shell">
        <div className="onboarding-hero">
          <span><Sparkles size={18} /> Yeni Profil</span>
          <h1>AquaScope profilinizi tamamlay�n</h1>
          <p>Bu bilgiler profiliniz, sosyal alan, �neriler ve analiz ge�mi�iniz i�in ba�lang�� profili olu�turur.</p>
        </div>

        <form className="onboarding-card" onSubmit={finishOnboarding}>
          <div className="onboarding-preview">
            <div className="onboarding-cover" />
            <div className="onboarding-avatar">
              {avatarUrl ? <img src={avatarUrl} alt={name} /> : <UserRound size={38} />}
              <span><Camera size={14} /></span>
            </div>
            <strong>{name || "Yeni Kullan�c�"}</strong>
            <small>@{handle || "aquascope"}</small>
            <p>{bio || "K�sa profil a��klaman�z burada g�r�n�r."}</p>
          </div>

          <div className="onboarding-fields">
            <label>
              <span>Ad Soyad</span>
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Deniz Arslan" />
            </label>

            <label>
              <span>Kullan�c� Ad�</span>
              <input value={handle} onChange={(event) => setHandle(event.target.value)} placeholder="denizde" />
            </label>

            <label>
              <span>B�lge</span>
              <span className="onboarding-input-icon"><MapPin size={16} /><input value={region} onChange={(event) => setRegion(event.target.value)} placeholder="�zmir K�rfezi" /></span>
            </label>

            <label>
              <span>Profil Foto�raf� URL</span>
              <input value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="https://..." />
            </label>

            <label className="onboarding-wide">
              <span>K�sa Bio</span>
              <textarea value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Deniz ke�ifleri, t�r analizi ve topluluk payla��mlar�..." />
            </label>

            <div className="onboarding-wide">
              <span className="onboarding-label"><Fish size={16} /> �lgi Alanlar�</span>
              <div className="onboarding-chip-grid">
                {interestOptions.map((interest) => (
                  <button key={interest} type="button" className={interests.includes(interest) ? "is-selected" : ""} onClick={() => toggleInterest(interest)}>
                    {interests.includes(interest) ? <Check size={14} /> : null}{interest}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="onboarding-label">Deneyim Seviyesi</span>
              <div className="onboarding-segments">
                {experienceOptions.map((option) => (
                  <button key={option} type="button" className={experience === option ? "is-selected" : ""} onClick={() => setExperience(option)}>{option}</button>
                ))}
              </div>
            </div>

            <div>
              <span className="onboarding-label"><Shield size={16} /> G�r�n�rl�k</span>
              <div className="onboarding-visibility">
                {visibilityOptions.map((option) => (
                  <button key={option.value} type="button" className={visibility === option.value ? "is-selected" : ""} onClick={() => setVisibility(option.value)}>{option.label}</button>
                ))}
              </div>
              <small className="onboarding-helper">{selectedVisibility.helper}</small>
            </div>

            {error ? <div className="onboarding-error">{error}</div> : null}

            <button className="onboarding-submit" type="submit">
              Profili Tamamla <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
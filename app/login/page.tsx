"use client";

import type { PointerEvent } from "react";
import { useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { BarChart3, BrainCircuit, Check, ChevronDown, Globe2, Share2 } from "lucide-react";
import Link from "next/link";
import LoginCard from "../../components/auth/login-card";
import { ShiningBorder } from "../../components/ui/shine-border";

const featureList = [
  {
    icon: BrainCircuit,
    title: "AI Destekli Analiz",
    body: "Gelişmiş yapay zeka ile yüksek doğrulukta balık türü tanıma.",
  },
  {
    icon: BarChart3,
    title: "Veri & Görselleştirme",
    body: "Kapsamlı istatistikler ve görsellerle verilerinizi anlamlandırın.",
  },
  {
    icon: Share2,
    title: "Dünya ile Paylaş",
    body: "Keşiflerinizi toplulukla paylaşın, birlikte öğrenelim.",
  },
];

const localeOptions = ["Türkçe", "English", "Deutsch"];

export default function LoginPage() {
  const [selectedLocale, setSelectedLocale] = useState(localeOptions[0]);
  const [localeOpen, setLocaleOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const isRegister = authMode === "register";
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 170, damping: 24, mass: 0.35 });
  const springY = useSpring(pointerY, { stiffness: 170, damping: 24, mass: 0.35 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [4.2, -4.2]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-4.8, 4.8]);

  function handleFramePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    pointerX.set(x);
    pointerY.set(y);
  }

  function resetFrameTilt() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <main className="auth-stage">
      <motion.div
        className="login-frame-tilt-shell"
        onPointerLeave={resetFrameTilt}
        onPointerMove={handleFramePointerMove}
        style={reduceMotion ? undefined : { rotateX, rotateY }}
      >
        <ShiningBorder
          className="login-frame"
          animationMode="auto-rotate"
          animationSpeed={7}
          borderWidth={1}
          borderRadius={24}
          backgroundColor="rgba(3, 13, 31, 0.32)"
          gradientColors={{
            primary: "#0b1730",
            secondary: "#38bdf8",
            accent: "#d8f6ff",
          }}
        >
          <section className="login-frame-inner">
          <div className="login-left-panel">
            <div className="login-left-surface">
              <Link href="/" className="login-brandmark">
                <span className="login-brandmark-icon" aria-hidden>
                  <img src="/aquascope-logo.svg" alt="" />
                </span>
                <span className="login-brandmark-word" aria-label="AquaScope">
                  <span>Aqua</span>
                  <span className="login-brandmark-word-accent">Scope</span>
                </span>
              </Link>

              <div className="login-left-copy">
                <span>HOŞ GELDİNİZ</span>
                <h1>
                  Okyanusu Keşfet,
                  <br />
                  Bilgiyle <em>Derinleş.</em>
                </h1>
                <p>
                  AquaScope ile balık türlerini keşfedin, analiz edin ve su altı dünyasının
                  sırlarını birlikte çözün.
                </p>
              </div>

              <img className="login-left-fish" src="/login-fish-cutout.png" alt="Fish" />

              <div className="login-left-features">
                {featureList.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <article key={feature.title} className="login-left-feature">
                      <span className="login-left-feature-icon">
                        <Icon size={24} strokeWidth={1.8} />
                      </span>
                      <div>
                        <strong>{feature.title}</strong>
                        <p>{feature.body}</p>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="login-left-social-proof">
                <div className="login-left-avatars">
                  <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80" alt="User 1" />
                  <img src="https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=96&q=80" alt="User 2" />
                  <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=96&q=80" alt="User 3" />
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80" alt="User 4" />
                </div>
                <p>
                  <strong>+500 kullanıcı</strong>
                  AquaScope&apos;u keşfediyor
                </p>
              </div>
            </div>
          </div>

          <div className="login-right-panel">
            <div className="login-locale-menu">
              <button
                aria-expanded={localeOpen}
                aria-haspopup="listbox"
                className="login-locale-pill"
                type="button"
                onClick={() => setLocaleOpen((current) => !current)}
              >
                <Globe2 size={16} />
                <span>{selectedLocale}</span>
                <ChevronDown size={16} className={localeOpen ? "login-locale-chevron login-locale-chevron-open" : "login-locale-chevron"} />
              </button>

              {localeOpen ? (
                <div className="login-locale-dropdown" role="listbox">
                  {localeOptions.map((locale) => (
                    <button
                      aria-selected={selectedLocale === locale}
                      key={locale}
                      role="option"
                      type="button"
                      onClick={() => {
                        setSelectedLocale(locale);
                        setLocaleOpen(false);
                      }}
                    >
                      <span>{locale}</span>
                      {selectedLocale === locale ? <Check size={14} /> : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div
              key={authMode}
              className={
                isRegister
                  ? "login-right-copy login-right-copy--register"
                  : "login-right-copy login-right-copy--login"
              }
            >
              <h2>{isRegister ? "Hesap Oluşturun" : "Giriş Yapın"}</h2>
              <p>
                {isRegister
                  ? "AquaScope hesabınızı oluşturun ve analizlerinizi kaydetmeye başlayın."
                  : "Hesabınıza giriş yaparak keşfetmeye devam edin."}
              </p>
            </div>

            <LoginCard mode={authMode} onModeChange={setAuthMode} />
          </div>
          </section>
        </ShiningBorder>
      </motion.div>

      <footer className="login-bottom-links">
        <span>© 2024 AquaScope. Tüm hakları saklıdır.</span>
        <a href="/">Gizlilik Politikası</a>
        <a href="/">Kullanım Şartları</a>
        <a href="/">İletişim</a>
      </footer>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Camera,
  CirclePlay,
  Fish,
  Instagram,
  Linkedin,
  MapPin,
  MessageSquareText,
  Search,
  ShieldCheck,
  Twitter,
  Users,
  Youtube,
} from "lucide-react";

const featureCards = [
  {
    icon: BrainCircuit,
    title: "AI Destekli Analiz",
    desc: "Gelişmiş makine öğrenmesi modeli ile yüksek doğrulukta tür tahmini.",
  },
  {
    icon: BarChart3,
    title: "Veri & Görselleştirme",
    desc: "Analiz sonuçlarını grafikler ve istatistiklerle zenginleştirin.",
  },
  {
    icon: MapPin,
    title: "Harita Üzerinde Keşif",
    desc: "Türlerin coğrafi dağılımını interaktif harita üzerinden inceleyin.",
  },
  {
    icon: Users,
    title: "Topluluk ile Paylaş",
    desc: "Keşiflerinizi paylaşın, diğer kullanıcılarla etkileşime geçin.",
  },
];

const modules = [
  {
    icon: Search,
    title: "Analiz",
    body: "Görsel yükleyin, AI destekli anında tür tahminini saniyeler içinde elde edin.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=700&q=80",
    href: "/platform/analyze",
  },
  {
    icon: BarChart3,
    title: "Dashboard",
    body: "Kişisel istatistiklerinizi ve analiz geçmişinizi tek bakışta görüntüleyin.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=700&q=80",
    href: "/platform/dashboard",
  },
  {
    icon: MapPin,
    title: "Harita",
    body: "Türlerin dünya üzerindeki dağılımını interaktif harita üzerinden keşfedin.",
    image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=700&q=80",
    href: "/platform/map",
  },
  {
    icon: BookOpen,
    title: "Tür Kütüphanesi",
    body: "Detaylı balık bilgilerine, görsellere ve özelliklere ulaşın.",
    image: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=700&q=80",
    href: "/platform/library",
  },
  {
    icon: MessageSquareText,
    title: "Sosyal Alan",
    body: "Keşiflerinizi paylaşın, yorum yapın ve topluluğun bir parçası olun.",
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=700&q=80",
    href: "/platform/social",
  },
  {
    icon: Users,
    title: "Profil",
    body: "Profilinizi özelleştirin, favori türlerinizi ve rozetlerinizi görüntüleyin.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=80",
    href: "/platform/profile",
  },
];

const stats = [
  { value: 10000, label: "Aktif Kullanıcı", icon: BrainCircuit, suffix: "+", compact: "k", duration: 1800 },
  { value: 350, label: "Balık Türü", icon: Fish, suffix: "+", duration: 1500 },
  { value: 500, label: "Analiz Kategorisi", icon: Users, suffix: "+", duration: 1650 },
  { value: 50, label: "Ülke", icon: ShieldCheck, suffix: "+", duration: 1300 },
] as const;

const heroTitleLines = ["Balık Türlerini", "Keşfet, Analiz Et,", "Dünyayla Paylaş!"] as const;

const technologies = ["Next.js", "FastAPI", "TensorFlow / Keras", "Leaflet", "TypeScript"];

export default function LandingPage() {
  const statsRef = useRef<HTMLElement | null>(null);
  const [animateStats, setAnimateStats] = useState(false);
  const [typedTitle, setTypedTitle] = useState<string[]>(() => heroTitleLines.map(() => ""));

  useEffect(() => {
    const statsNode = statsRef.current;

    if (!statsNode || animateStats) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setAnimateStats(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimateStats(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(statsNode);

    return () => observer.disconnect();
  }, [animateStats]);

  useEffect(() => {
    let lineIndex = 0;
    let charIndex = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    function typeNextCharacter() {
      if (lineIndex >= heroTitleLines.length) {
        timeoutId = setTimeout(() => {
          lineIndex = 0;
          charIndex = 0;
          setTypedTitle(heroTitleLines.map(() => ""));
          timeoutId = setTimeout(typeNextCharacter, 280);
        }, 5000);
        return;
      }

      setTypedTitle(
        heroTitleLines.map((line, index) => {
          if (index < lineIndex) {
            return line;
          }

          if (index === lineIndex) {
            return line.slice(0, charIndex);
          }

          return "";
        })
      );

      const currentLine = heroTitleLines[lineIndex];
      if (charIndex <= currentLine.length) {
        charIndex += 1;
        timeoutId = setTimeout(typeNextCharacter, charIndex === 1 ? 220 : 58);
        return;
      }

      lineIndex += 1;
      charIndex = 0;
      timeoutId = setTimeout(typeNextCharacter, 260);
    }

    timeoutId = setTimeout(typeNextCharacter, 280);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <main className="landing-page">
      <section className="landing-hero" id="top">
        <div className="landing-hero-bg" />
        <header className="landing-navbar">
          <Link href="/" className="landing-brand">
            <span className="landing-brand-badge">
              <img src="/aquascope-logo.svg" alt="AquaScope logo" />
            </span>
            <span className="landing-brand-word" aria-label="AquaScope">
              <span>Aqua</span>
              <span className="landing-brand-word-accent">Scope</span>
            </span>
          </Link>

          <nav className="landing-nav-links" aria-label="Landing navigation">
            <a href="#features">Özellikler</a>
            <a href="#modules">Modüller</a>
            <a href="#how-it-works">Nasıl Çalışır?</a>
          </nav>

          <Link href="/login" className="landing-primary-button">
            Hemen Başla
            <ArrowRight size={16} />
          </Link>
        </header>

        <div className="landing-hero-inner">
          <div className="landing-hero-copy">
            <h1 aria-label={heroTitleLines.join(" ")}>
              {heroTitleLines.map((line, index) => {
                const activeLineIndex = typedTitle.findIndex((value, activeIndex) => value.length < heroTitleLines[activeIndex].length);
                const isComplete = typedTitle.every((value, doneIndex) => value === heroTitleLines[doneIndex]);
                const showCursor = index === activeLineIndex || (isComplete && index === heroTitleLines.length - 1);

                return (
                  <span
                    aria-hidden="true"
                    className={index === 1 ? "landing-typewriter-line landing-typewriter-line--accent" : "landing-typewriter-line"}
                    key={line}
                  >
                    {typedTitle[index]}
                    {showCursor ? <i aria-hidden="true" /> : null}
                  </span>
                );
              })}
            </h1>
            <p>
              AquaScope, yapay zeka destekli analiz teknolojisi ile balık türlerini tanır,
              verileri görselleştirir ve sualtı dünyasını parmaklarınızın ucuna getirir.
            </p>

            <div className="landing-hero-actions">
              <Link href="/platform/analyze" className="landing-primary-button">
                Hemen Keşfet
                <ArrowRight size={16} />
              </Link>
              <Link href="/platform/dashboard" className="landing-secondary-button">
                Canlı Demo
                <CirclePlay size={16} />
              </Link>
            </div>

            <div className="landing-social-proof">
              <div className="landing-avatars">
                <div className="landing-avatar-track">
                  {[0, 1].map((group) => (
                    <span className="landing-avatar-set" aria-hidden={group === 1} key={group}>
                      <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80" alt={group === 0 ? "User 1" : ""} />
                      <img src="https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=96&q=80" alt={group === 0 ? "User 2" : ""} />
                      <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=96&q=80" alt={group === 0 ? "User 3" : ""} />
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80" alt={group === 0 ? "User 4" : ""} />
                    </span>
                  ))}
                </div>
              </div>
              <p><strong>500+</strong> kullanıcı AquaScope'u keşfetmeye başladı.</p>
            </div>
          </div>
        </div>

        <section className="landing-feature-panel" id="features">
          <div className="landing-feature-grid">
              {featureCards.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="landing-feature-card"
                  >
                    <div className="landing-feature-card-inner">
                      <div className="landing-feature-icon">
                        <Icon size={30} strokeWidth={1.8} />
                      </div>

                      <h3 className="landing-feature-title">
                        {item.title}
                      </h3>

                      <div className="landing-feature-accent" />

                      <p className="landing-feature-description">
                        {item.desc}
                      </p>

                      <div className="landing-feature-footer">
                        <div className="landing-feature-arrow">
                          <ArrowRight size={20} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      </section>

      <section className="landing-modules-section" id="modules">
        <div className="landing-section-heading">
          <strong>TÜM ARAÇLAR</strong>
          <h2>AquaScope ile Her Şey Elinizin Altında</h2>
          <p>İhtiyacınız olan tüm araçlar, tek bir platformda.</p>
        </div>

        <div className="landing-module-grid">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <article key={module.title} className="landing-module-card">
                <span><Icon size={18} /></span>
                <h3>{module.title}</h3>
                <img src={module.image} alt={module.title} />
                <p>{module.body}</p>
                <Link href={module.href}>
                  Keşfet
                  <ArrowRight size={14} />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="landing-stats-band" id="about" ref={statsRef}>
        <div className="landing-stats-inner">
          {stats.map(({ value, label, icon: Icon, suffix, compact, duration }) => (
            <article key={label}>
              <span><Icon size={18} /></span>
              <strong>
                <AnimatedStatValue
                  compact={compact}
                  duration={duration}
                  start={animateStats}
                  suffix={suffix}
                  target={value}
                />
              </strong>
              <p>{label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-how-section" id="how-it-works">
        <div className="landing-section-heading">
          <strong>NASIL ÇALIŞIR?</strong>
          <h2>3 Adımda Tür Analizi</h2>
          <p>Görsel yükleyin, analizi bekleyin, sonucu keşfedin.</p>
        </div>

        <div className="landing-steps">
          <article>
            <div className="landing-step-visual upload">
              <Camera size={28} />
              <img src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=320&q=80" alt="Upload fish" />
            </div>
            <span>1</span>
            <h3>Görsel Yükle</h3>
            <p>Balık fotoğrafınızı yükleyin veya kameranızla çekin.</p>
          </article>

          <article>
            <div className="landing-step-visual network">
              <BrainCircuit size={38} />
            </div>
            <span>2</span>
            <h3>AI Analiz</h3>
            <p>Yapay zeka modelimiz görseli analiz eder ve tür tahmini yapar.</p>
          </article>

          <article>
            <div className="landing-step-visual result">
              <div>
                <img src="https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=320&q=80" alt="Prediction result" />
                <aside>
                  <strong>Levrek</strong>
                  <small>Dicentrarchus labrax</small>
                  <b>%95.4</b>
                </aside>
              </div>
            </div>
            <span>3</span>
            <h3>Sonucu Keşfet</h3>
            <p>Tahmin sonucunu, güven skorunu ve detayları görüntüleyin.</p>
          </article>
        </div>
      </section>

      <section className="landing-cta-band" id="technologies">
        <div className="landing-cta-copy">
          <h2>Sualtı dünyasını birlikte keşfetmeye hazır mısın?</h2>
          <p>AquaScope'a katıl, keşfet, öğren ve paylaş!</p>
        </div>

        <div className="landing-cta-actions">
          <Link href="/login" className="landing-primary-button">
            Hemen Başla
            <ArrowRight size={16} />
          </Link>
          <a href="#footer" className="landing-secondary-button">
            Daha Fazla Bilgi
            <CirclePlay size={16} />
          </a>
        </div>
      </section>

      <footer className="landing-footer" id="footer">
        <div className="landing-footer-top">
          <div className="landing-footer-brand">
            <Link href="/" className="landing-brand">
              <span className="landing-brand-badge">
                <img src="/aquascope-logo.svg" alt="AquaScope logo" />
              </span>
              <span>AquaScope</span>
            </Link>
            <p>
              AquaScope, yapay zeka ile sualtı dünyasını keşfetmenizi sağlayan modern bir analiz platformudur.
            </p>
            <div className="landing-footer-socials">
              <span aria-label="LinkedIn"><Linkedin size={16} /></span>
              <span aria-label="Instagram"><Instagram size={16} /></span>
              <span aria-label="YouTube"><Youtube size={16} /></span>
              <span aria-label="X"><Twitter size={16} /></span>
            </div>
          </div>

          <div className="landing-footer-links">
            <section>
              <h3>Platform</h3>
              <a href="#features">Özellikler</a>
              <a href="#modules">Modüller</a>
              <Link href="/platform/dashboard">Güncellemeler</Link>
            </section>
            <section>
              <h3>Kaynaklar</h3>
              <a href="#how-it-works">Dokümantasyon</a>
              <Link href="/platform/map">API</Link>
              <Link href="/platform/library">Blog</Link>
            </section>
            <section>
              <h3>Şirket</h3>
              <a href="#about">Hakkımızda</a>
              <Link href="/platform/social">İletişim</Link>
              <Link href="/platform/profile">Kullanım Şartları</Link>
            </section>
            <section>
              <h3>Bülten</h3>
              <p>Gelişmelerden haberdar olun.</p>
              <label className="landing-newsletter">
                <input placeholder="E-posta adresiniz" aria-label="Email" />
                <button type="button"><ArrowRight size={14} /></button>
              </label>
            </section>
          </div>
        </div>

        <div className="landing-footer-bottom">
          <div className="landing-tech-list">
            {technologies.map((item) => <span key={item}>{item}</span>)}
          </div>
          <p>© 2024 AquaScope. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </main>
  );
}

function AnimatedStatValue({
  compact,
  duration,
  start,
  suffix,
  target,
}: {
  compact?: "k";
  duration: number;
  start: boolean;
  suffix: string;
  target: number;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) {
      setValue(0);
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }

    let frameId = 0;
    const startedAt = performance.now();
    const easeOutCubic = (progress: number) => 1 - Math.pow(1 - progress, 3);

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      setValue(Math.round(target * easeOutCubic(progress)));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [duration, start, target]);

  if (compact === "k") {
    return <>{Math.round(value / 1000)}K{suffix}</>;
  }

  return <>{value}{suffix}</>;
}

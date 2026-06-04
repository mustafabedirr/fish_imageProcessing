"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Apple, AppWindow, ArrowRight, Chrome, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { demoCredentials } from "../../lib/auth";

export default function LoginCard() {
  const router = useRouter();
  const [email, setEmail] = useState(demoCredentials.email);
  const [password, setPassword] = useState(demoCredentials.password);
  const [loading, setLoading] = useState(false);
  const [showLaunchOverlay, setShowLaunchOverlay] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(String(data?.error ?? "Giriş başarısız oldu."));
      }

      setShowLaunchOverlay(true);
      window.setTimeout(() => {
        router.push("/platform");
      }, 1850);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
      setLoading(false);
    }
  }

  return (
    <>
      <form className="auth-form" onSubmit={onSubmit}>
        <div className="auth-fields">
          <label className="auth-field">
            <span className="auth-label">
              E-posta
            </span>
            <span className="auth-input-wrap">
              <Mail size={16} />
              <input
                className="auth-input"
                placeholder="ornek@mail.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </span>
          </label>

          <label className="auth-field">
            <span className="auth-label">
              Şifre
            </span>
            <span className="auth-input-wrap">
              <Lock size={16} />
              <input
                className="auth-input"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                className="auth-password-toggle"
                type="button"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </span>
          </label>
        </div>

        <a className="forgot-link" href="/platform">
          Şifremi Unuttum?
        </a>

        {error ? <div className="auth-error">{error}</div> : null}

        <button className="auth-submit" type="submit" disabled={loading || showLaunchOverlay}>
          <span>{loading || showLaunchOverlay ? "Açılıyor..." : "Giriş Yap"}</span>
          <ArrowRight size={20} />
        </button>

        <div className="social-divider">
          <span />
          <p>veya şununla devam et</p>
          <span />
        </div>

        <div className="social-login-row">
          <button type="button" aria-label="Google">
            <Chrome size={20} />
          </button>
          <button type="button" aria-label="Apple">
            <Apple size={22} />
          </button>
          <button type="button" aria-label="Microsoft">
            <AppWindow size={20} />
          </button>
        </div>

        <p className="signup-copy">
          Hesabınız yok mu? <a href="/platform">Kayıt Ol</a>
        </p>
      </form>

      {showLaunchOverlay && portalReady ? createPortal(
        <div className="launch-overlay" role="status" aria-live="polite">
          <div className="launch-loader">
            <img src="/aquascope-loading-transparent.gif" alt="" />
            <strong>AquaScope hazırlanıyor</strong>
            <span>Deniz verileri senkronize ediliyor</span>
            <div className="launch-dots" aria-hidden>
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>,
        document.body
      ) : null}
    </>
  );
}

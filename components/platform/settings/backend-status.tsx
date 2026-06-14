"use client";

import { useState } from "react";
import { Clock3, Code2, Copy, Server, Zap } from "lucide-react";

const endpoint = "http://127.0.0.1:8000/api/v1/analyze-fish";

export default function BackendStatus({ setNotice }: { setNotice: (notice: string) => void }) {
  const [copied, setCopied] = useState(false);
  const [lastChecked, setLastChecked] = useState("16 Mayis 2024 14:32");

  async function copyEndpoint() {
    try {
      await navigator.clipboard.writeText(endpoint);
      setCopied(true);
      setNotice("API endpoint panoya kopyalandi.");
    } catch {
      setNotice("Tarayici pano izni vermedi, endpoint manuel kopyalanabilir.");
    }
  }

  function refreshStatus() {
    setLastChecked(new Date().toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" }));
    setNotice("Backend baglanti durumu yenilendi.");
  }

  return (
    <section className="settings-card settings-card--backend">
      <header className="settings-card-head">
        <span>
          <Server size={22} />
        </span>
        <div>
          <h2>Backend Durumu</h2>
          <p>FastAPI servisinizin baglanti durumunu kontrol edin.</p>
        </div>
      </header>

      <div className="settings-backend-grid">
        <article>
          <span className="settings-status-dot" />
          <div>
            <small>Baglanti Durumu</small>
            <strong>Aktif</strong>
          </div>
        </article>
        <article>
          <Zap size={22} />
          <div>
            <small>API Servisi</small>
            <strong>FastAPI</strong>
          </div>
        </article>
        <article>
          <Clock3 size={22} />
          <div>
            <small>Son Kontrol</small>
            <strong>{lastChecked}</strong>
          </div>
        </article>
      </div>

      <div className="settings-endpoint-row">
        <span>API Endpoint</span>
        <code>{endpoint}</code>
        <button type="button" className={copied ? "is-complete" : ""} onClick={copyEndpoint}>
          <Copy size={15} />
          {copied ? "Kopyalandi" : "Kopyala"}
        </button>
      </div>

      <button type="button" className="settings-env-button" onClick={refreshStatus}>
        <Code2 size={18} />
        Baglantiyi Yenile
      </button>
    </section>
  );
}

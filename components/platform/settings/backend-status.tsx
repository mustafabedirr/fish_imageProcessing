import { Clock3, Code2, Server, Zap } from "lucide-react";

export default function BackendStatus() {
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
            <strong>16 Mayis 2024 14:32</strong>
          </div>
        </article>
      </div>

      <p className="settings-backend-copy">
        Next.js API, varsayilan olarak FastAPI analiz servisine <code>http://127.0.0.1:8000/api/v1/analyze-fish</code> uzerinden baglanir.
      </p>

      <button type="button" className="settings-env-button">
        <Code2 size={18} />
        FASTAPI_URL ile degistirilebilir
      </button>
    </section>
  );
}

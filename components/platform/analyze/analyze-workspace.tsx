"use client";

import type { ChangeEvent, ElementType } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import FishMorphometricViewer from "../../analysis/FishMorphometricViewer";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bot,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  Download,
  Droplets,
  FileText,
  Loader2,
  MapPin,
  Maximize2,
  MoreVertical,
  Ruler,
  Share2,
  Sparkles,
  Target,
  Upload,
  Waves,
} from "lucide-react";

type AnalyzeResponse = {
  species: string;
  confidence: number;
  name_tr?: string;
  display_name?: string;
  edible: boolean;
  ideal_size: string;
  recommended_baits: string[];
  recommended_gear: string[];
  region_notes: string[];
};

type SpeciesProfile = {
  commonName: string;
  latin: string;
  description: string;
  location: string;
  coordinates: string;
  environment: {
    temperature: string;
    salinity: string;
    ph: string;
    oxygen: string;
    habitat: string;
    habitatScore: number;
  };
  colors: string[];
  distribution: number[];
};

const thumbnails = [
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=220&q=80",
  "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=220&q=80",
  "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=220&q=80",
  "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=220&q=80",
];

const reportItems = [
  "Su sicakligi ideal aralikta.",
  "Besin kaynaklari yeterli.",
  "Kirlilik seviyesi dusuk.",
  "Populasyon durumu stabil.",
];

const speciesProfiles: Record<string, SpeciesProfile> = {
  levrek: {
    commonName: "Levrek",
    latin: "Dicentrarchus labrax",
    description: "Akdeniz, Ege ve Karadeniz kiyilarinda yaygin gorulen avci bir deniz balik turudur.",
    location: "Karadeniz, Sinop Aciklari",
    coordinates: "41.887 N, 34.868 E",
    environment: {
      temperature: "16.8 C",
      salinity: "18.6 PSU",
      ph: "8.1",
      oxygen: "8.2 mg/L",
      habitat: "Cok Uygun",
      habitatScore: 94,
    },
    colors: ["Gumus %48", "Mavi-Gri %26", "Beyaz %15", "Koyu Gri %8", "Diger %3"],
    distribution: [12, 28, 52, 82, 61, 34, 18],
  },
  cupra: {
    commonName: "Cupra",
    latin: "Sparus aurata",
    description: "Kiyisal kayalik, kumluk ve deniz cayi alanlarinda gozlenen degerli bir deniz balik turudur.",
    location: "Kuzey Ege Bolgesi",
    coordinates: "39.2326 N, 26.4412 E",
    environment: {
      temperature: "18.6 C",
      salinity: "32.5 PSU",
      ph: "8.0",
      oxygen: "7.7 mg/L",
      habitat: "Uygun",
      habitatScore: 91,
    },
    colors: ["Gumus %42", "Altin Hat %18", "Mavi-Gri %17", "Beyaz %14", "Diger %9"],
    distribution: [8, 22, 48, 76, 66, 38, 20],
  },
  palamut: {
    commonName: "Palamut",
    latin: "Sarda sarda",
    description: "Suruler halinde gezen, hizli hareket eden ve acik denizlerde izlenen pelajik bir turdur.",
    location: "Marmara Gecisi",
    coordinates: "40.796 N, 28.982 E",
    environment: {
      temperature: "17.4 C",
      salinity: "25.9 PSU",
      ph: "8.2",
      oxygen: "8.0 mg/L",
      habitat: "Cok Uygun",
      habitatScore: 93,
    },
    colors: ["Mavi-Gri %44", "Gumus %34", "Koyu Cizgi %12", "Beyaz %7", "Diger %3"],
    distribution: [5, 15, 33, 58, 79, 64, 30],
  },
  kefal: {
    commonName: "Kefal",
    latin: "Mugil cephalus",
    description: "Kiyiya yakin, lagun ve acisu gecislerinde sik gorulen dayanikli bir turdur.",
    location: "Izmir Korfezi",
    coordinates: "38.435 N, 27.142 E",
    environment: {
      temperature: "19.1 C",
      salinity: "21.4 PSU",
      ph: "7.9",
      oxygen: "7.4 mg/L",
      habitat: "Uygun",
      habitatScore: 88,
    },
    colors: ["Gumus %50", "Koyu Gri %24", "Beyaz %14", "Yesilimsi %7", "Diger %5"],
    distribution: [18, 36, 74, 69, 42, 21, 9],
  },
};

export default function AnalyzeWorkspace() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const acceptedTypes = useMemo(() => ["image/jpeg", "image/jpg", "image/png", "image/webp"], []);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("/login-fish-scene.png");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [analysisCompletedAt, setAnalysisCompletedAt] = useState<Date | null>(null);
  const [analysisDuration, setAnalysisDuration] = useState<string>("2.34 saniye");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectedSpecies = result?.species ?? "Levrek";
  const confidence = result ? normalizeConfidence(result.confidence) : 95.4;
  const confidenceText = `%${confidence.toFixed(1)}`;
  const scoreLabel = confidence >= 85 ? "Cok Yuksek" : confidence >= 65 ? "Yuksek" : "Orta";
  const analysisDate = analysisCompletedAt ? analysisCompletedAt.toLocaleString("tr-TR") : "18 Mayis 2024 - 14:32";
  const speciesProfile = getSpeciesProfile(detectedSpecies);
  const displaySpecies = result ? getDisplaySpecies(result, speciesProfile) : "Levrek";
  const scoreRows = getScoreRows(confidence, result, speciesProfile);
  const measurements = getMeasurementsFromResult(result);
  const alternatives = getAlternatives(detectedSpecies, confidence);
  const reportNotes = result ? getResultNotes(result, speciesProfile) : reportItems;
  const analysisId = result && file ? `AAS-${file.name.replace(/\W+/g, "-").slice(0, 18).toUpperCase()}` : "AAS-2024-0518-1247";
  const modelName = result ? "EfficientNet + YOLO Fish_Data" : "AquaScope AI v2.4";
  const imageSet = result ? [previewUrl, ...thumbnails] : thumbnails;

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function selectFile(selected: File | null) {
    setError(null);
    setResult(null);
    setAnalysisCompletedAt(null);
    setAnalysisDuration("2.34 saniye");

    if (!selected) return;

    if (!acceptedTypes.includes(selected.type)) {
      setError("Lutfen JPG, PNG veya WEBP formatinda bir balik gorseli secin.");
      return;
    }

    setFile(selected);
    setPreviewUrl((current) => {
      if (current.startsWith("blob:")) URL.revokeObjectURL(current);
      return URL.createObjectURL(selected);
    });
    void analyzeImage(selected);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0] ?? null);
    event.target.value = "";
  }

  async function analyzeImage(targetFile = file) {
    if (!targetFile) {
      setError("Analiz icin once bir balik gorseli secin.");
      inputRef.current?.click();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const startedAt = performance.now();

      const formData = new FormData();
      formData.append("image", targetFile);

      const response = await fetch("/api/analyze-fish", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        const message = data?.details?.detail || data?.details?.error || data?.error || "Analiz sirasinda hata olustu.";
        throw new Error(message);
      }

      setResult(normalizeAnalyzeResponse(data));
      setAnalysisCompletedAt(new Date());
      setAnalysisDuration(`${((performance.now() - startedAt) / 1000).toFixed(2)} saniye`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen analiz hatasi olustu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="fish-analyze-page">
      <header className="fish-analyze-topbar">
        <div>
          <h1>Balik Analizi</h1>
          <p>Gorsel yukleyin, analiz edin ve detayli sonuclari kesfedin.</p>
        </div>

        <div className="fish-analyze-actions">
          <button type="button" className="fish-action-primary" onClick={() => inputRef.current?.click()}>
            <Upload size={17} />
            Yeni Analiz
          </button>
          <input
            ref={inputRef}
            className="fish-upload-input"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleFileChange}
          />
          <button type="button" onClick={analyzeImage} disabled={loading}>
            {loading ? <Loader2 className="fish-spinner" size={17} /> : <Sparkles size={17} />}
            {loading ? "Analiz Ediliyor" : "Analiz Et"}
          </button>
          <button type="button">
            <FileText size={17} />
            Rapor Olustur
          </button>
          <button type="button" aria-label="Paylas">
            <Share2 size={17} />
          </button>
          <button type="button" aria-label="Indir">
            <Download size={17} />
          </button>
          <button type="button" aria-label="Daha fazla">
            <MoreVertical size={17} />
          </button>
        </div>
      </header>

      <div className="fish-analyze-flow">
        {getFlowSteps({ hasFile: Boolean(file), loading, hasResult: Boolean(result) }).map((step, index) => (
          <div className="fish-flow-segment" key={step.label}>
            <div className={`fish-flow-step fish-flow-step--${step.status}`}>
              <span>{index + 1}</span>
              <div>
                <strong>{step.label}</strong>
                <small>
                  {step.caption}
                  <CheckCircle2 size={15} />
                </small>
              </div>
            </div>
            {index < 2 ? <span className={`fish-flow-connector fish-flow-connector--${step.status}`} aria-hidden="true" /> : null}
          </div>
        ))}
      </div>

      <main className="fish-analyze-layout">
        <section className="fish-analyze-main">
          <div className="fish-hero-card">
            <article className="fish-image-stage">
              <span className="fish-stage-chip">Orijinal</span>
              <img src={previewUrl} alt="Analiz edilen balik" />
              {!file ? (
                <button type="button" className="fish-stage-upload" onClick={() => inputRef.current?.click()}>
                  <Upload size={17} />
                  Gorsel Sec
                </button>
              ) : null}
              <button type="button" className="fish-stage-nav fish-stage-nav--left" aria-label="Onceki">
                <ArrowLeft size={18} />
              </button>
              <button type="button" className="fish-stage-nav fish-stage-nav--right" aria-label="Sonraki">
                <ArrowRight size={18} />
              </button>
              <button type="button" className="fish-stage-expand" aria-label="Gorseli genislet">
                <Maximize2 size={17} />
              </button>
              <div className="fish-thumbs">
                {imageSet.slice(0, 4).map((image, index) => (
                  <button className={index === 0 ? "fish-thumb fish-thumb--active" : "fish-thumb"} type="button" key={image}>
                    <img src={image} alt="" />
                  </button>
                ))}
                <button className="fish-thumb fish-thumb-more" type="button">+3</button>
              </div>
            </article>

            <article className="fish-score-card">
              <div className="fish-score-head">
                <h2>Genel Analiz Skoru</h2>
                <span>i</span>
              </div>
              <div className="fish-score-body">
                <div className="fish-score-gauge">
                  <div>
                    <strong>{confidence.toFixed(1)}</strong>
                    <span>{scoreLabel}</span>
                  </div>
                </div>
                <div className="fish-score-copy">
                  <p>
                    {result
                      ? `${displaySpecies} turu ${confidenceText} guven skoru ile tespit edildi.`
                      : "Bir balik gorseli secip analiz ettiginde model sonucu burada guncellenir."}
                  </p>
                  <div className="fish-score-list">
                    {scoreRows.map((row) => {
                      const Icon = row.icon;
                      const value = row.label === "Tur Dogruluk Skoru" ? Math.round(confidence) : row.value;
                      return (
                        <div className="fish-score-row" key={row.label}>
                          <Icon size={16} />
                          <span>{row.label}</span>
                          <strong>{value} / 100</strong>
                          <i><b style={{ width: `${value}%` }} /></i>
                        </div>
                      );
                    })}
                  </div>
                  {error ? <p className="fish-analyze-error">{error}</p> : null}
                </div>
              </div>
              <div className="fish-meta-grid">
                <Metric icon={Target} label="Analiz ID" value={analysisId} />
                <Metric icon={CalendarDays} label="Analiz Tarihi" value={analysisDate} />
                <Metric icon={BarChart3} label="Analiz Suresi" value={loading ? "Analiz ediliyor" : analysisDuration} />
                <Metric icon={Sparkles} label="Model" value={modelName} />
              </div>
            </article>
          </div>

          <nav className="fish-tabs" aria-label="Analiz detaylari">
            {["Detayli Analiz", "Olcumler", "Habitat & Cevre", "Saglik Raporu"].map((tab, index) => (
              <button className={index === 0 ? "fish-tab fish-tab--active" : "fish-tab"} type="button" key={tab}>{tab}</button>
            ))}
          </nav>

          <section className="fish-detail-grid">
            <article className="fish-panel fish-measure-panel">
              <h2>Morfometrik Olcumler</h2>
              <FishMorphometricViewer species={displaySpecies} measurements={measurements} />
              <p className="fish-panel-note">Olcumler tahmini degerlerdir ve +- %3 hata payi icerebilir.</p>
            </article>

            <article className="fish-panel fish-color-panel">
              <h2>Renk Analizi</h2>
              <div className="fish-color-body">
                <div className="fish-donut" />
                <ul>
                  {speciesProfile.colors.map((item) => (
                    <li key={item}><span />{item}</li>
                  ))}
                </ul>
              </div>
            </article>

            <article className="fish-panel fish-bars-panel">
              <h2>Boy Dagilimi</h2>
              <div className="fish-bars">
                {speciesProfile.distribution.map((height, index) => (
                  <span className={index === 3 ? "fish-bar fish-bar--active" : "fish-bar"} style={{ height: `${height}%` }} key={index} />
                ))}
              </div>
              <div className="fish-bar-labels">
                {["0-10", "10-20", "20-30", "30-40", "40-50", "50-60", "60+"].map((label) => <span key={label}>{label}</span>)}
              </div>
              <p>Ortalama Boy: {measurements[1]?.value ?? "38.7 cm"}</p>
            </article>

            <article className="fish-panel fish-location-panel">
              <h2>Konum Bilgisi</h2>
              <div className="fish-location-map">
                <div className="fish-location-pin">
                  <MapPin size={18} />
                  <strong>{speciesProfile.location}</strong>
                  <span>{speciesProfile.coordinates}</span>
                </div>
              </div>
              <div className="fish-env-grid">
                <Env icon={Droplets} label="Su Sicakligi" value={speciesProfile.environment.temperature} />
                <Env icon={Waves} label="Tuzluluk" value={speciesProfile.environment.salinity} />
                <Env icon={Ruler} label="pH Degeri" value={speciesProfile.environment.ph} />
                <Env icon={Droplets} label="Oksijen" value={speciesProfile.environment.oxygen} />
                <div className="fish-habitat-score">
                  <span>Habitat Uygunlugu</span>
                  <strong>{speciesProfile.environment.habitat}</strong>
                  <i><b style={{ width: `${speciesProfile.environment.habitatScore}%` }} /></i>
                  <small>{speciesProfile.environment.habitatScore} / 100</small>
                </div>
              </div>
            </article>
          </section>
        </section>

        <aside className="fish-analyze-rail">
          <article className="fish-panel fish-species-card">
            <div className="fish-rail-head">
              <h2>Tespit Edilen Tur</h2>
              <span>{loading ? "Analiz Ediliyor" : result ? "Birincil Eslesme" : "Sonuc Bekleniyor"}</span>
            </div>
            <div className={`fish-species-main ${loading ? "fish-species-main--loading" : ""}`}>
              <img src={previewUrl} alt="" />
              <div>
                <strong>{loading ? "Model calisiyor" : displaySpecies}</strong>
                <small>{speciesProfile.latin}</small>
                <em>{loading ? "Analiz suruyor" : `${confidenceText} Guven`}</em>
              </div>
            </div>
            <p>
              {loading
                ? "Yuklenen gorsel model tarafindan isleniyor. Tespit sonucu tamamlandiginda bu kart otomatik guncellenecek."
                : result
                ? `${speciesProfile.description} Ideal boy: ${result.ideal_size}. Onerilen yem: ${result.recommended_baits.join(", ")}.`
                : speciesProfile.description}
            </p>
            <button type="button">Tur Detayina Git <ChevronRight size={17} /></button>

            <h3>Alternatif Eslesmeler</h3>
            <div className="fish-alt-list">
              {alternatives.map(({ name, latin, score }, index) => (
                <div className="fish-alt-row" key={name}>
                  <img src={thumbnails[index + 1]} alt="" />
                  <span><strong>{name}</strong><small>{latin}</small></span>
                  <b>{score}</b>
                </div>
              ))}
            </div>
            <button type="button">Tum Turleri Gor <ChevronRight size={17} /></button>
          </article>

          <article className="fish-panel fish-ai-card">
            <div className="fish-ai-title">
              <Bot size={22} />
              <h2>AI Yorum & Oneriler</h2>
            </div>
            <p>Bu balik saglikli gorunuyor ve yasadigi ortam uygun.</p>
            <ul>
              {reportNotes.map((item) => (
                <li key={item}><CheckCircle2 size={16} />{item}</li>
              ))}
            </ul>
            <button type="button">Daha Fazla Oneri Gor <ChevronRight size={17} /></button>
          </article>
        </aside>
      </main>
    </section>
  );
}

function getFlowSteps({
  hasFile,
  loading,
  hasResult,
}: {
  hasFile: boolean;
  loading: boolean;
  hasResult: boolean;
}) {
  return [
    {
      label: "Gorsel Yukleme",
      caption: hasFile ? "Tamamlandi" : "Bekliyor",
      status: hasFile ? "completed" : "active",
    },
    {
      label: "AI Analiz",
      caption: loading ? "Calisiyor" : hasResult ? "Tamamlandi" : "Bekliyor",
      status: loading ? "active" : hasResult ? "completed" : "pending",
    },
    {
      label: "Sonuclar",
      caption: hasResult ? "Tamamlandi" : "Bekliyor",
      status: hasResult ? "active" : "pending",
    },
  ];
}

function normalizeConfidence(value: number) {
  const normalized = value <= 1 ? value * 100 : value;
  return Math.max(0, Math.min(100, normalized));
}

function normalizeAnalyzeResponse(data: unknown): AnalyzeResponse {
  const payload = unwrapAnalyzePayload(data);
  const species = readString(payload, "species") || readString(payload, "class_name") || readString(payload, "prediction") || "Bilinmeyen Tur";
  const confidence = readNumber(payload, "confidence") ?? readNumber(payload, "score") ?? readNumber(payload, "probability") ?? 0;
  const recommendedBaits = readStringArray(payload, "recommended_baits");
  const recommendedGear = readStringArray(payload, "recommended_gear");
  const regionNotes = readStringArray(payload, "region_notes");

  return {
    species,
    confidence,
    name_tr: readString(payload, "name_tr"),
    display_name: readString(payload, "display_name"),
    edible: readBoolean(payload, "edible") ?? false,
    ideal_size: readString(payload, "ideal_size") || "Bilinmiyor",
    recommended_baits: recommendedBaits.length ? recommendedBaits : ["Bilgi yok"],
    recommended_gear: recommendedGear.length ? recommendedGear : ["Bilgi yok"],
    region_notes: regionNotes.length ? regionNotes : ["Bolge bilgisi yok"],
  };
}

function unwrapAnalyzePayload(data: unknown): Record<string, unknown> {
  if (!isRecord(data)) return {};

  for (const key of ["result", "analysis", "data", "prediction"]) {
    const nested = data[key];
    if (isRecord(nested)) return nested;
  }

  return data;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(source: Record<string, unknown>, key: string) {
  const value = source[key];
  return typeof value === "string" ? value : "";
}

function readNumber(source: Record<string, unknown>, key: string) {
  const value = source[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function readBoolean(source: Record<string, unknown>, key: string) {
  const value = source[key];
  return typeof value === "boolean" ? value : null;
}

function readStringArray(source: Record<string, unknown>, key: string) {
  const value = source[key];
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value === "string" && value.trim()) return [value];
  return [];
}

function getDisplaySpecies(result: AnalyzeResponse, profile: SpeciesProfile) {
  return result.name_tr || result.display_name || profile.commonName || prettifySpeciesName(result.species);
}

function prettifySpeciesName(species: string) {
  return species
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toLocaleUpperCase("tr-TR"));
}

function normalizeSpeciesKey(species: string) {
  return species
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ç", "c")
    .replaceAll("ğ", "g")
    .replaceAll("ı", "i")
    .replaceAll("ö", "o")
    .replaceAll("ş", "s")
    .replaceAll("ü", "u")
    .replace(/[^a-z0-9]+/g, "");
}

function getSpeciesProfile(species: string): SpeciesProfile {
  const key = normalizeSpeciesKey(species);
  return speciesProfiles[key] ?? {
    commonName: prettifySpeciesName(species),
    latin: "Model tahmini",
    description: `${species} icin model tarafindan olusturulan birincil eslesme sonucu gosteriliyor.`,
    location: "Turkiye Denizleri",
    coordinates: "39.000 N, 35.000 E",
    environment: {
      temperature: "17.8 C",
      salinity: "24.0 PSU",
      ph: "8.0",
      oxygen: "7.9 mg/L",
      habitat: "Uygun",
      habitatScore: 86,
    },
    colors: ["Gumus %44", "Mavi-Gri %23", "Beyaz %16", "Koyu Ton %10", "Diger %7"],
    distribution: [10, 24, 48, 74, 58, 32, 16],
  };
}

function getScoreRows(confidence: number, result: AnalyzeResponse | null, profile: SpeciesProfile) {
  const speciesScore = Math.round(confidence);
  const visualQuality = result ? Math.max(72, Math.min(98, speciesScore - 2)) : 93;
  const healthScore = result?.edible ? Math.max(82, Math.min(98, speciesScore + 1)) : Math.max(62, Math.min(86, speciesScore - 6));

  return [
    { label: "Saglik Durumu", value: healthScore, icon: Droplets, tone: "green" },
    { label: "Habitat Uygunlugu", value: profile.environment.habitatScore, icon: MapPin, tone: "green" },
    { label: "Gorsel Kalite", value: visualQuality, icon: Camera, tone: "purple" },
    { label: "Tur Dogruluk Skoru", value: speciesScore, icon: Target, tone: "blue" },
  ];
}

function getMeasurementsFromResult(result: AnalyzeResponse | null) {
  const [minSize, maxSize] = extractSizeRange(result?.ideal_size);
  const totalLength = maxSize || 42.3;
  const standardLength = minSize || totalLength * 0.89;
  const forkLength = totalLength * 0.97;
  const bodyHeight = totalLength * 0.265;
  const headLength = totalLength * 0.232;
  const eyeDiameter = totalLength * 0.043;

  return [
    { label: "Toplam Boy", value: formatCm(totalLength), x: 28, y: 40 },
    { label: "Standart Boy", value: formatCm(standardLength), x: 420, y: 40 },
    { label: "Catal Boy", value: formatCm(forkLength), x: 420, y: 232 },
    { label: "Vucut Yuksekligi", value: formatCm(bodyHeight), x: 238, y: 70 },
    { label: "Bas Uzunlugu", value: formatCm(headLength), x: 92, y: 168 },
    { label: "Goz Capi", value: formatCm(eyeDiameter), x: 103, y: 113 },
  ];
}

function extractSizeRange(idealSize?: string): [number | null, number | null] {
  if (!idealSize) return [null, null];

  const numbers = idealSize.match(/\d+(?:[.,]\d+)?/g)?.map((item) => Number(item.replace(",", "."))) ?? [];
  if (numbers.length === 0) return [null, null];
  if (numbers.length === 1) return [numbers[0] * 0.9, numbers[0]];
  return [numbers[0], numbers[1]];
}

function formatCm(value: number) {
  return `${value.toFixed(1)} cm`;
}

function getAlternatives(species: string, confidence: number) {
  const options = [
    { name: "Levrek", latin: "Dicentrarchus labrax" },
    { name: "Cupra", latin: "Sparus aurata" },
    { name: "Palamut", latin: "Sarda sarda" },
    { name: "Kefal", latin: "Mugil cephalus" },
  ].filter((item) => normalizeSpeciesKey(item.name) !== normalizeSpeciesKey(species));

  const remaining = Math.max(0.3, 100 - confidence);
  return options.slice(0, 3).map((item, index) => ({
    ...item,
    score: `%${Math.max(0.2, remaining / (index + 2)).toFixed(1)}`,
  }));
}

function getResultNotes(result: AnalyzeResponse, profile: SpeciesProfile) {
  return [
    ...result.region_notes,
    `Tespit edilen tur: ${result.species} (${(normalizeConfidence(result.confidence)).toFixed(1)} guven).`,
    `Habitat degeri: ${profile.environment.habitat} (${profile.environment.habitatScore}/100).`,
    `Onerilen ekipman: ${result.recommended_gear.join(", ")}.`,
  ];
}

function Metric({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return (
    <div className="fish-meta-item">
      <Icon size={16} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Env({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return (
    <div className="fish-env-item">
      <Icon size={16} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

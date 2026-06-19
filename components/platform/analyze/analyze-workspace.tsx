"use client";

import type { ChangeEvent, DragEvent, ElementType } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Area, AreaChart, PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  Camera,
  ChevronRight,
  CloudSun,
  Database,
  Download,
  Droplets,
  FileText,
  ImageIcon,
  Loader2,
  MapPin,
  Map as MapIcon,
  Maximize2,
  MoreVertical,
  Plus,
  Ruler,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  Waves,
  X,
} from "lucide-react";

type AnalyzeResponse = {
  species: string;
  confidence: number;
  top_predictions: TopPrediction[];
  confidence_threshold: number;
  is_uncertain: boolean;
  name_tr?: string;
  display_name?: string;
  edible: boolean;
  ideal_size: string;
  recommended_baits: string[];
  recommended_gear: string[];
  region_notes: string[];
};

type TopPrediction = {
  species: string;
  confidence: number;
  name_tr?: string;
  display_name?: string;
};

type PredictionDisplay = {
  name: string;
  latin: string;
  score: string;
  isPrimary?: boolean;
};

type SpeciesProfile = {
  commonName: string;
  latin: string;
  description: string;
  weight?: string;
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

const speciesProfiles: Record<string, SpeciesProfile> = {
  levrek: {
    commonName: "Levrek",
    latin: "Dicentrarchus labrax",
    description: "Akdeniz, Ege ve Karadeniz kıyılarında yaygın görülen avcı bir deniz balık türüdür.",
    location: "Karadeniz, Sinop Açıkları",
    coordinates: "41.887 N, 34.868 E",
    environment: {
      temperature: "16.8 C",
      salinity: "18.6 PSU",
      ph: "8.1",
      oxygen: "8.2 mg/L",
      habitat: "Çok Uygun",
      habitatScore: 94,
    },
    colors: ["Gümüş %48", "Mavi-Gri %26", "Beyaz %15", "Koyu Gri %8", "Diğer %3"],
    distribution: [12, 28, 52, 82, 61, 34, 18],
  },
  cupra: {
    commonName: "Cupra",
    latin: "Sparus aurata",
    description: "Kıyısal kayalık, kumluk ve deniz çayı alanlarında gözlenen değerli bir deniz balık türüdür.",
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
    colors: ["Gümüş %42", "Altın Hat %18", "Mavi-Gri %17", "Beyaz %14", "Diğer %9"],
    distribution: [8, 22, 48, 76, 66, 38, 20],
  },
  palamut: {
    commonName: "Palamut",
    latin: "Sarda sarda",
    description: "Sürüler halinde gezen, hızlı hareket eden ve açık denizlerde izlenen pelajik bir türdür.",
    location: "Marmara Geçişi",
    coordinates: "40.796 N, 28.982 E",
    environment: {
      temperature: "17.4 C",
      salinity: "25.9 PSU",
      ph: "8.2",
      oxygen: "8.0 mg/L",
      habitat: "Çok Uygun",
      habitatScore: 93,
    },
    colors: ["Mavi-Gri %44", "Gümüş %34", "Koyu Çizgi %12", "Beyaz %7", "Diğer %3"],
    distribution: [5, 15, 33, 58, 79, 64, 30],
  },
  kefal: {
    commonName: "Kefal",
    latin: "Mugil cephalus",
    description: "Kıyıya yakın, lagün ve acı su geçişlerinde sık görülen dayanıklı bir türdür.",
    location: "İzmir Körfezi",
    coordinates: "38.435 N, 27.142 E",
    environment: {
      temperature: "19.1 C",
      salinity: "21.4 PSU",
      ph: "7.9",
      oxygen: "7.4 mg/L",
      habitat: "Uygun",
      habitatScore: 88,
    },
    colors: ["Gümüş %50", "Koyu Gri %24", "Beyaz %14", "Yeşilimsi %7", "Diğer %5"],
    distribution: [18, 36, 74, 69, 42, 21, 9],
  },
};

export default function AnalyzeWorkspace() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const acceptedTypes = useMemo(() => ["image/svg+xml", "image/jpeg", "image/jpg", "image/png", "image/gif"], []);
  const maxSizeMB = 2;
  const maxSize = maxSizeMB * 1024 * 1024;
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("/images/analyze-upload-underwater-bg.png");
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [analysisCompletedAt, setAnalysisCompletedAt] = useState<Date | null>(null);
  const [analysisDuration, setAnalysisDuration] = useState<string>("2.34 saniye");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(4);
  const [observationRange, setObservationRange] = useState<"month" | "week">("month");

  const detectedSpecies = result?.species ?? "Levrek";
  const confidence = result ? normalizeConfidence(result.confidence) : 95.4;
  const confidenceThreshold = result ? normalizeConfidence(result.confidence_threshold) : 45;
  const isUncertain = Boolean(result?.is_uncertain);
  const confidenceText = `%${confidence.toFixed(1)}`;
  const scoreLabel = isUncertain ? "Düşük Güven" : confidence >= 85 ? "Çok Yüksek" : confidence >= 65 ? "Yüksek" : "Orta";
  const analysisDate = analysisCompletedAt ? analysisCompletedAt.toLocaleString("tr-TR") : "18 Mayıs 2024 - 14:32";
  const speciesProfile = getSpeciesProfile(detectedSpecies);
  const displaySpecies = result ? getDisplaySpecies(result, speciesProfile) : "Levrek";
  const primarySpeciesLabel = isUncertain ? "Emin değilim" : displaySpecies;
  const scoreRows = getScoreRows(confidence, result, speciesProfile);
  const measurements = getMeasurementsFromResult(result);
  const topPredictionRows = result?.top_predictions.length ? getTopPredictionRows(result) : getFallbackPredictionRows(detectedSpecies, confidence);
  const analysisId = result && file ? `AAS-${file.name.replace(/\W+/g, "-").slice(0, 18).toUpperCase()}` : "AAS-2024-0518-1247";
  const modelName = result ? "EfficientNet + YOLO Fish_Data" : "AquaScope AI v2.4";
  const imageSet = result ? [previewUrl, ...thumbnails] : thumbnails;
  const stageImage = file ? imageSet[activeImageIndex] ?? previewUrl : previewUrl;
  const sizeLabels = ["0-10", "10-20", "20-30", "30-40", "40-50", "50-60", "60+"];
  const selectedSizeLabel = sizeLabels[selectedSizeIndex] ?? "40-50";
  const selectedSizeValue = speciesProfile.distribution[selectedSizeIndex] ?? 0;
  const scoreChartData = [{ name: "Genel Skor", value: confidence }];
  const scoreMetricRows = scoreRows.filter((row) => row.label !== "Tür Doğruluk Skoru");
  const metricSummaryRows = [
    { label: "Tahmini Boy", value: measurements[1]?.value ?? "42.3 cm", status: "Standart Boy", icon: TrendingUp },
    { label: "Tahmini Ağırlık", value: speciesProfile.weight ?? "1.68 kg", status: "Tahmini", icon: BarChart3 },
    { label: "Su Sıcaklığı", value: speciesProfile.environment.temperature, status: "Uygun", icon: Droplets },
    { label: "Tuzluluk", value: speciesProfile.environment.salinity, status: "Normal", icon: Waves },
    { label: "pH Değeri", value: speciesProfile.environment.ph, status: "Normal", icon: Ruler },
    { label: "Oksijen", value: speciesProfile.environment.oxygen, status: "İdeal", icon: Droplets },
  ];
  const observationActivity = [
    { date: "1 May", value: 6 },
    { date: "4 May", value: 24 },
    { date: "8 May", value: 39 },
    { date: "12 May", value: 44 },
    { date: "15 May", value: 62 },
    { date: "18 May", value: 78 },
    { date: "22 May", value: 51 },
    { date: "26 May", value: 57 },
    { date: "29 May", value: 43 },
  ];
  const mcpIntegrations = [
    { label: "Ocean Data", icon: Waves },
    { label: "Species DB", icon: Database },
    { label: "Weather API", icon: CloudSun },
    { label: "Marine Maps", icon: MapIcon },
    { label: "Water Quality", icon: Droplets },
    { label: "Conservation AI", icon: MapPin },
  ];

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!actionMessage) return;
    const timer = window.setTimeout(() => setActionMessage(null), 2600);
    return () => window.clearTimeout(timer);
  }, [actionMessage]);

  function selectFile(selected: File | null) {
    setIsDragging(false);
    setError(null);
    setResult(null);
    setAnalysisCompletedAt(null);
    setAnalysisDuration("2.34 saniye");

    if (!selected) return;

    if (!acceptedTypes.includes(selected.type)) {
      setError("Lütfen SVG, PNG, JPG veya GIF formatında bir görsel seçin.");
      return;
    }

    if (selected.size > maxSize) {
      setError(`Görsel boyutu en fazla ${maxSizeMB} MB olabilir.`);
      return;
    }

    setFile(selected);
    setActiveImageIndex(0);
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

  function handleDragEnter(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }

    setIsDragging(false);
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    selectFile(event.dataTransfer.files?.[0] ?? null);
  }

  function removeSelectedImage() {
    setFile(null);
    setResult(null);
    setAnalysisCompletedAt(null);
    setAnalysisDuration("2.34 saniye");
    setError(null);
    setActiveImageIndex(0);
    setIsImagePreviewOpen(false);
    setPreviewUrl((current) => {
      if (current.startsWith("blob:")) URL.revokeObjectURL(current);
      return "/images/analyze-upload-underwater-bg.png";
    });
  }

  async function analyzeImage(targetFile = file) {
    if (!targetFile) {
      setError("Analiz için önce bir balık görseli seçin.");
      inputRef.current?.click();
      return;
    }

    const startedAt = performance.now();

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("image", targetFile);

      const response = await fetch("/api/analyze-fish", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        const message = data?.details?.detail || data?.details?.error || data?.error || "Analiz sırasında hata oluştu.";
        throw new Error(message);
      }

      await waitForMinimumDuration(startedAt, 2000);
      setResult(normalizeAnalyzeResponse(data));
      setAnalysisCompletedAt(new Date());
      setAnalysisDuration(`${((performance.now() - startedAt) / 1000).toFixed(2)} saniye`);
    } catch (err) {
      await waitForMinimumDuration(startedAt, 2000);
      setError(err instanceof Error ? err.message : "Bilinmeyen analiz hatası oluştu.");
    } finally {
      setLoading(false);
    }
  }

  async function handleShareAnalysis() {
    const shareText = `${displaySpecies} analizi - ${confidenceText} güven skoru`;

    try {
      if (navigator.share) {
        await navigator.share({ title: "AquaLens Analiz", text: shareText });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setActionMessage("Analiz özeti panoya kopyalandı.");
      } else {
        setActionMessage("Paylaşım özeti hazırlandı.");
      }
    } catch {
      setActionMessage("Paylaşım iptal edildi.");
    }
  }

  function handleDownloadImage() {
    if (!file && !previewUrl.startsWith("blob:")) {
      setActionMessage("İndirmek için önce bir görsel seçin.");
      return;
    }

    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = file?.name ? `aquascope-${file.name}` : "aquascope-analysis-image.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setActionMessage("Görsel indirme başlatıldı.");
  }

  function handleCreateReport() {
    setActionMessage(result ? "Analiz raporu hazırlandı." : "Rapor için önce analiz sonucu gerekli.");
  }

  return (
    <section className="fish-analyze-page">
      <input
        ref={inputRef}
        className="fish-upload-input"
        type="file"
        accept="image/svg+xml,image/png,image/jpeg,image/jpg,image/gif"
        aria-label="Upload image file"
        onChange={handleFileChange}
      />

      <main className="fish-analyze-layout">
        <section className="fish-analyze-main">
          <div className={!file ? "fish-hero-card fish-hero-card--upload" : "fish-hero-card"}>
            <article
              className={`${!file ? "fish-image-stage fish-image-stage--empty" : "fish-image-stage"}${isDragging ? " fish-image-stage--dragging" : ""}`}
              data-dragging={isDragging || undefined}
              onClick={() => {
                if (!file) {
                  inputRef.current?.click();
                }
              }}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {file ? <span className="fish-stage-chip">Orijinal</span> : null}
              {file ? (
                <span className="fish-stage-secure">
                  <ShieldCheck size={17} />
                  Yüklemeleriniz güvenli ve gizlidir
                </span>
              ) : null}
              <img src={stageImage} alt="Analiz edilen balık" />
              {file ? (
                <button type="button" className="fish-stage-remove-image" onClick={removeSelectedImage} aria-label="Görseli kaldır">
                  <X size={16} />
                </button>
              ) : null}
              {!file ? (
                <div
                  className="fish-simple-dropzone"
                  onClick={(event) => {
                    event.stopPropagation();
                    inputRef.current?.click();
                  }}
                >
                  <span className="fish-upload-panel__icon" aria-hidden="true">
                    <ImageIcon size={18} />
                  </span>
                  <h2>Drop your image here</h2>
                  <p>SVG, PNG, JPG or GIF (max. {maxSizeMB}MB)</p>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      inputRef.current?.click();
                    }}
                  >
                    <Upload size={17} />
                    Select image
                  </button>
                  {error ? (
                    <div className="fish-upload-error" role="alert">
                      <AlertCircle size={14} />
                      <span>{error}</span>
                    </div>
                  ) : null}
                </div>
              ) : null}


              <button
                type="button"
                className="fish-stage-expand"
                aria-label="Gorseli genislet"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsImagePreviewOpen(true);
                }}
              >
                <Maximize2 size={17} />
              </button>
              <div className="fish-thumbs">
                {imageSet.slice(0, 4).map((image, index) => (
                  <button
                    className={index === activeImageIndex ? "fish-thumb fish-thumb--active" : "fish-thumb"}
                    type="button"
                    key={image}
                    onClick={(event) => {
                      event.stopPropagation();
                      setActiveImageIndex(index);
                    }}
                  >
                    <img src={image} alt="" />
                    {!file ? <span className="fish-thumb-remove" aria-hidden="true">x</span> : null}
                  </button>
                ))}
                <button className={!file ? "fish-thumb fish-thumb-add" : "fish-thumb fish-thumb-more"} type="button" onClick={() => inputRef.current?.click()}>
                  {!file ? <><Plus size={24} /> <span>Daha fazla ekle</span></> : "+3"}
                </button>
              </div>
            </article>

            <article className="fish-score-card fish-score-card--recharts">
              <div className="fish-score-recharts-layout">
                <section className="fish-score-recharts-main">
                  <div className="fish-score-recharts-head">
                    <div>
                      <h2>Genel Analiz Skoru</h2>
                    </div>
                    <span className="fish-score-info" tabIndex={0} aria-label="Genel analiz skoru açıklaması">
                      i
                      <span className="fish-score-info-tooltip" role="tooltip">
                        AI modelimiz, görseli analiz ederek habitat, tür özellikleri ve veri kalitesini değerlendirdi.
                      </span>
                    </span>
                  </div>

                  <div className="fish-score-chart-wrap">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        data={scoreChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius="74%"
                        outerRadius="96%"
                        startAngle={90}
                        endAngle={-270}
                      >
                        <defs>
                          <linearGradient id="fishScoreRadialGradient" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#25f4e6" />
                            <stop offset="48%" stopColor="#27b5ff" />
                            <stop offset="100%" stopColor="#2563ff" />
                          </linearGradient>
                        </defs>
                        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                        <RadialBar
                          dataKey="value"
                          background={{ fill: "rgba(35, 80, 132, 0.45)" }}
                          cornerRadius={18}
                          fill="url(#fishScoreRadialGradient)"
                          isAnimationActive
                          animationBegin={120}
                          animationDuration={1000}
                          animationEasing="ease-out"
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="fish-score-chart-center">
                      <strong>{confidence.toFixed(1)}</strong>
                      <span>{scoreLabel}</span>
                      <small>*****</small>
                    </div>
                  </div>

                  <div className="fish-score-mini-meta">
                    <span><CalendarDays size={15} />{analysisDate}</span>
                    <span><Sparkles size={15} />{modelName}</span>
                    <span><ShieldCheck size={15} />{isUncertain ? "Dusuk guven" : "Yuksek guven"}</span>
                  </div>
                </section>

                <section className="fish-score-recharts-side">
                  <div className="fish-score-recharts-metrics">
                    {scoreMetricRows.map((row) => {
                      const Icon = row.icon;
                      const value = row.label === "Tür Doğruluk Skoru" ? Math.round(confidence) : row.value;
                      const description = "description" in row ? row.description : getScoreDescription(row.label);
                      return (
                        <div className="fish-score-recharts-row" key={row.label}>
                          <span className="fish-score-recharts-icon"><Icon size={20} /></span>
                          <span className="fish-score-recharts-copy">
                            <strong>{row.label}</strong>
                            <small>{description}</small>
                          </span>
                          <b>{value} / 100</b>
                          <i><em style={{ width: `${value}%` }} /></i>
                        </div>
                      );
                    })}
                  </div>

                  <div className="fish-score-recharts-callout">
                    <Sparkles size={22} />
                    <span>
                      <strong>{isUncertain ? "Daha fazla veri gerekli" : "Harika bir analiz!"}</strong>
                    </span>
                    <TrendingUp size={20} />
                  </div>
                  {error ? <p className="fish-analyze-error">{error}</p> : null}
                </section>
              </div>
              <div className="fish-score-head">
                <h2>Genel Analiz Skoru</h2>
                <span>i</span>
              </div>
              <div className="fish-score-body">
                <div className="fish-score-gauge">
                  <div>
                    <strong>{confidence.toFixed(1)}</strong>
                    <span>{scoreLabel}</span>
                    <small className="fish-score-stars" aria-label="Beş yıldızlı analiz skoru">★★★★★</small>
                  </div>
                </div>
                <div className="fish-score-copy">
                  <p>
                    {result
                      ? isUncertain
                        ? `Model bu görsel için yeterli güvene ulaşamadı. En yakın tahmin ${displaySpecies} (${confidenceText}).`
                        : `${displaySpecies} türü ${confidenceText} güven skoru ile tespit edildi.`
                      : "Bir balik görseli seçip analiz ettiğinde model sonucu burada güncellenir."}
                  </p>
                  <div className="fish-score-list">
                    {scoreRows.map((row) => {
                      const Icon = row.icon;
                      const value = row.label === "Tür Doğruluk Skoru" ? Math.round(confidence) : row.value;
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
                <Metric icon={BarChart3} label="Analiz Süresi" value={loading ? "Analiz ediliyor" : analysisDuration} />
                <Metric icon={Sparkles} label="Model" value={modelName} />
              </div>
            </article>
          </div>

          <section className="fish-insights-board" aria-label="Analiz metrikleri">
            <article className="fish-insight-card fish-metric-summary-card">
              <h2>Metrik Özeti</h2>
              <div className="fish-metric-summary-grid">
                {metricSummaryRows.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div className="fish-metric-summary-item" key={item.label}>
                      <Icon size={19} />
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                      <small>{item.status}</small>
                    </div>
                  );
                })}
              </div>
            </article>

            <div className="fish-insight-mid-grid">
              <article className="fish-insight-card fish-size-distribution-card">
                <h2>Boy Dağılımı</h2>
                <span className="fish-axis-unit">(%)</span>
                <div className="fish-size-chart">
                  {speciesProfile.distribution.map((height, index) => (
                    <button
                      className={index === selectedSizeIndex ? "fish-size-column fish-size-column--active" : "fish-size-column"}
                      style={{ height: `${height}%` }}
                      key={index}
                      type="button"
                      onClick={() => setSelectedSizeIndex(index)}
                      aria-label={`${sizeLabels[index]} cm araligi, yuzde ${height}`}
                    >
                      {index === selectedSizeIndex ? <em>{selectedSizeLabel} cm<br /><b>%{selectedSizeValue}</b></em> : null}
                    </button>
                  ))}
                </div>
                <div className="fish-size-labels">
                  {sizeLabels.map((label) => <span className={label === selectedSizeLabel ? "fish-size-label--active" : ""} key={label}>{label}</span>)}
                  <small>(cm)</small>
                </div>
              </article>

              <article className="fish-insight-card fish-observation-card">
                <div className="fish-observation-head">
                  <h2>Gözlem Aktivitesi</h2>
                  <button type="button" onClick={() => setObservationRange((current) => current === "month" ? "week" : "month")}>
                    {observationRange === "month" ? "Bu Ay" : "Bu Hafta"} <ChevronRight size={14} />
                  </button>
                </div>
                <span className="fish-axis-unit">Gözlem Sayısı</span>
                <div className="fish-observation-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={observationActivity} margin={{ top: 8, right: 10, bottom: 0, left: -18 }}>
                      <defs>
                        <linearGradient id="fishObservationGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#16e1db" stopOpacity={0.46} />
                          <stop offset="100%" stopColor="#16e1db" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#8da5c6", fontSize: 10 }} interval={1} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#8da5c6", fontSize: 10 }} domain={[0, 80]} ticks={[0, 20, 40, 60]} />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#17e4de"
                        strokeWidth={2.2}
                        fill="url(#fishObservationGradient)"
                        dot={{ r: 3, fill: "#17e4de", stroke: "#07253e", strokeWidth: 1 }}
                        activeDot={{ r: 5, fill: "#67fff5", stroke: "#0b3152", strokeWidth: 2 }}
                        isAnimationActive
                        animationDuration={900}
                        animationEasing="ease-out"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </article>
            </div>

            <article className="fish-insight-card fish-mcp-card">
              <h2>MCP Entegrasyonları</h2>
              <div className="fish-mcp-grid">
                {mcpIntegrations.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div className="fish-mcp-item" key={item.label}>
                      <Icon size={21} />
                      <span>{item.label}</span>
                      <small><i />Aktif</small>
                    </div>
                  );
                })}
              </div>
            </article>
          </section>
        </section>

        <aside className="fish-analyze-rail">
          <div className="fish-rail-actions" aria-label="Analiz aksiyonları">
            <button type="button" className="fish-action-primary" onClick={() => analyzeImage()} disabled={loading} aria-label={loading ? "Analiz ediliyor" : "Analiz et"}>
              {loading ? <Loader2 className="fish-spinner" size={17} /> : <Sparkles size={17} />}
            </button>
            <button type="button" aria-label="Rapor oluştur" onClick={handleCreateReport}>
              <FileText size={17} />
            </button>
            <button type="button" aria-label="Paylaş" onClick={() => void handleShareAnalysis()}>
              <Share2 size={17} />
            </button>
            <button type="button" aria-label="İndir" onClick={handleDownloadImage}>
              <Download size={17} />
            </button>
            <button type="button" aria-label="Daha fazla" onClick={() => setIsMoreActionsOpen((current) => !current)}>
              <MoreVertical size={17} />
            </button>
            {isMoreActionsOpen ? (
              <div className="fish-more-actions" role="menu">
                <button type="button" onClick={() => { setActionMessage("Analiz arşive eklendi."); setIsMoreActionsOpen(false); }}>Arsive ekle</button>
                <button type="button" onClick={() => { setActionMessage("Karşılaştırma listesine eklendi."); setIsMoreActionsOpen(false); }}>Karsilastir</button>
              </div>
            ) : null}
          </div>
          <article className="fish-panel fish-species-card">
            <div className="fish-rail-head">
              <h2>Tespit Edilen Tür</h2>
              <span>{loading ? "Analiz Ediliyor" : result ? (isUncertain ? "Düşük Güven" : "Birincil Eşleşme") : "Sonuç Bekleniyor"}</span>
            </div>
            <div className={`fish-species-main ${loading ? "fish-species-main--loading" : ""}`}>
              <img src={previewUrl} alt="" />
              <div>
                <strong>{loading ? "Model çalışıyor" : primarySpeciesLabel}</strong>
                <small>{speciesProfile.latin}</small>
                <em className={isUncertain ? "fish-confidence-low" : ""}>
                  {loading ? "Analiz sürüyor" : isUncertain ? `${confidenceText} düşük güven` : `${confidenceText} Güven`}
                </em>
              </div>
            </div>
            <p>
              {loading
                ? "Yüklenen görsel model tarafından işleniyor. Tespit sonucu tamamlandığında bu kart otomatik güncellenecek."
                : result
                ? isUncertain
                  ? `Tahmin güveni %${confidenceThreshold.toFixed(0)} esiğinin altında. Sonucu doğrulamak için alternatif eşleşmeleri kontrol edin.`
                  : `${speciesProfile.description} İdeal boy: ${result.ideal_size}. Önerilen yem: ${result.recommended_baits.join(", ")}.`
                : speciesProfile.description}
            </p>
            <div className="fish-detection-summary">
              <span>
                Birincil tür
                <strong>{loading ? "Bekleniyor" : displaySpecies}</strong>
              </span>
              <span>
                Güven skoru
                <strong>{loading ? "-" : confidenceText}</strong>
              </span>
            </div>
            <div className={isUncertain ? "fish-confidence-state fish-confidence-state--low" : "fish-confidence-state"}>
              <span>Karar durumu</span>
              <strong>{loading ? "Analiz bekleniyor" : isUncertain ? "Emin değilim" : "Yeterli güven"}</strong>
              <small>
                {result
                  ? `Eşik %${confidenceThreshold.toFixed(0)} - birincil skor ${confidenceText}`
                  : "Sonuç geldiğinde model kararı burada görünür."}
              </small>
            </div>
            <button type="button" onClick={() => setActionMessage(`${displaySpecies} tur detayi acildi.`)}>Tür Detayına Git <ChevronRight size={17} /></button>

            <h3>Top-5 Tahminler</h3>
            <div className="fish-alt-list">
              {topPredictionRows.map(({ name, latin, score, isPrimary }, index) => (
                <div className={isPrimary ? "fish-alt-row fish-alt-row--primary" : "fish-alt-row"} key={`${name}-${index}`}>
                  <img src={thumbnails[(index + 1) % thumbnails.length]} alt="" />
                  <span><strong>{name}</strong><small>{latin}</small></span>
                  <b>{score}</b>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setActionMessage("Tür kütüphanesi bağlantısı hazır.")}>Tüm Türleri Gör <ChevronRight size={17} /></button>
          </article>
        </aside>
      </main>

      {isImagePreviewOpen ? (
        <div className="fish-preview-modal" role="dialog" aria-modal="true" aria-label="Görsel önizleme" onClick={() => setIsImagePreviewOpen(false)}>
          <button type="button" className="fish-preview-close" aria-label="Önizlemeyi kapat" onClick={() => setIsImagePreviewOpen(false)}>
            <X size={18} />
          </button>
          <button
            type="button"
            className="fish-preview-nav fish-preview-nav--left"
            aria-label="Önceki görsel"
            onClick={(event) => {
              event.stopPropagation();
              setActiveImageIndex((current) => (current <= 0 ? imageSet.length - 1 : current - 1));
            }}
          >
            <ChevronRight size={20} />
          </button>
          <img src={stageImage} alt="Büyük analiz görseli" onClick={(event) => event.stopPropagation()} />
          <button
            type="button"
            className="fish-preview-nav fish-preview-nav--right"
            aria-label="Sonraki görsel"
            onClick={(event) => {
              event.stopPropagation();
              setActiveImageIndex((current) => (current + 1) % imageSet.length);
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      ) : null}

      {actionMessage ? <div className="fish-action-toast" role="status">{actionMessage}</div> : null}
    </section>
  );
}

function waitForMinimumDuration(startedAt: number, minimumMs: number) {
  const remaining = minimumMs - (performance.now() - startedAt);
  if (remaining <= 0) return Promise.resolve();
  return new Promise((resolve) => window.setTimeout(resolve, remaining));
}

function normalizeConfidence(value: number) {
  const normalized = value <= 1 ? value * 100 : value;
  return Math.max(0, Math.min(100, normalized));
}

function normalizeAnalyzeResponse(data: unknown): AnalyzeResponse {
  const payload = unwrapAnalyzePayload(data);
  const species = readString(payload, "species") || readString(payload, "class_name") || readString(payload, "prediction") || "Bilinmeyen Tur";
  const confidence = readNumber(payload, "confidence") ?? readNumber(payload, "score") ?? readNumber(payload, "probability") ?? 0;
  const confidenceThreshold = readNumber(payload, "confidence_threshold") ?? 0.45;
  const normalizedConfidence = normalizeConfidence(confidence);
  const normalizedThreshold = normalizeConfidence(confidenceThreshold);
  const recommendedBaits = readStringArray(payload, "recommended_baits");
  const recommendedGear = readStringArray(payload, "recommended_gear");
  const regionNotes = readStringArray(payload, "region_notes");

  return {
    species,
    confidence,
    top_predictions: readTopPredictions(payload),
    confidence_threshold: confidenceThreshold,
    is_uncertain: readBoolean(payload, "is_uncertain") ?? normalizedConfidence < normalizedThreshold,
    name_tr: readString(payload, "name_tr"),
    display_name: readString(payload, "display_name"),
    edible: readBoolean(payload, "edible") ?? false,
    ideal_size: readString(payload, "ideal_size") || "Bilinmiyor",
    recommended_baits: recommendedBaits.length ? recommendedBaits : ["Bilgi yok"],
    recommended_gear: recommendedGear.length ? recommendedGear : ["Bilgi yok"],
    region_notes: regionNotes.length ? regionNotes : ["Bölge bilgisi yok"],
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

function readTopPredictions(source: Record<string, unknown>): TopPrediction[] {
  const value = source.top_predictions;
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!isRecord(item)) return null;
      const species = readString(item, "species") || readString(item, "class_name") || readString(item, "prediction");
      const confidence = readNumber(item, "confidence") ?? readNumber(item, "score") ?? readNumber(item, "probability");
      if (!species || confidence === null) return null;

      return {
        species,
        confidence,
        name_tr: readString(item, "name_tr"),
        display_name: readString(item, "display_name"),
      } as TopPrediction;
    })
    .filter((item): item is TopPrediction => item !== null);
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
    description: `${species} için model tarafından oluşturulan birincil eşleşme sonucu gösteriliyor.`,
    location: "Türk Denizleri",
    coordinates: "39.000 N, 35.000 E",
    environment: {
      temperature: "17.8 C",
      salinity: "24.0 PSU",
      ph: "8.0",
      oxygen: "7.9 mg/L",
      habitat: "Uygun",
      habitatScore: 86,
    },
    colors: ["Gümüş %44", "Mavi-Gri %23", "Beyaz %16", "Koyu Ton %10", "Diğer %7"],
    distribution: [10, 24, 48, 74, 58, 32, 16],
  };
}

function getScoreRows(confidence: number, result: AnalyzeResponse | null, profile: SpeciesProfile) {
  const speciesScore = Math.round(confidence);
  const visualQuality = result ? Math.max(72, Math.min(98, speciesScore - 2)) : 93;
  const healthScore = result?.edible ? Math.max(82, Math.min(98, speciesScore + 1)) : Math.max(62, Math.min(86, speciesScore - 6));

  return [
    { label: "Sağlık Durumu", value: healthScore, icon: Droplets, tone: "green" },
    { label: "Habitat Uygunluğu", value: profile.environment.habitatScore, icon: MapPin, tone: "green" },
    { label: "Görsel Kalite", value: visualQuality, icon: Camera, tone: "purple" },
    ];
}

function getScoreDescription(label: string) {
  const descriptions: Record<string, string> = {
    "Sağlık Durumu": "Kondisyon",
    "Habitat Uygunluğu": "Yaşam alanı",
    "Görsel Kalite": "Çözünürlük",
    "Tür Doğruluk Skoru": "Tur tahmininin dogruluk seviyesi",
  };

  return descriptions[label] ?? "Analiz metrik degeri";
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
    { label: "Çatal Boy", value: formatCm(forkLength), x: 420, y: 232 },
    { label: "Vücut Yuksekligi", value: formatCm(bodyHeight), x: 238, y: 70 },
    { label: "Baş Uzunlugu", value: formatCm(headLength), x: 92, y: 168 },
    { label: "Göz Çapı", value: formatCm(eyeDiameter), x: 103, y: 113 },
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

function getAlternatives(species: string, confidence: number): PredictionDisplay[] {
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

function getFallbackPredictionRows(species: string, confidence: number): PredictionDisplay[] {
  const profile = getSpeciesProfile(species);
  return [
    {
      name: profile.commonName || prettifySpeciesName(species),
      latin: profile.latin,
      score: `%${normalizeConfidence(confidence).toFixed(1)}`,
      isPrimary: true,
    },
    ...getAlternatives(species, confidence),
  ].slice(0, 5);
}

function getTopPredictionRows(result: AnalyzeResponse): PredictionDisplay[] {
  const primaryKey = normalizeSpeciesKey(result.species);
  const rows = result.top_predictions.slice(0, 5).map((prediction) => {
    const profile = getSpeciesProfile(prediction.species);
    const name = prediction.name_tr || prediction.display_name || profile.commonName || prettifySpeciesName(prediction.species);

    return {
      name,
      latin: profile.latin,
      score: `%${normalizeConfidence(prediction.confidence).toFixed(1)}`,
      isPrimary: normalizeSpeciesKey(prediction.species) === primaryKey,
    };
  });

  return rows.length ? rows : getFallbackPredictionRows(result.species, normalizeConfidence(result.confidence));
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

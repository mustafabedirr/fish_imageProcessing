import type { FishAnalysisResult, FishSpecies } from "../types/fish";
import type { MarinePoint } from "../types/map";
import type { Conversation, Message } from "../types/message";
import type { SocialPost } from "../types/post";
import type { AquaScopeUser } from "../types/user";

export const appName = "AquaScope";

export const defaultProfileAvatarUrl = "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=85";

export const demoUser: AquaScopeUser = {
  id: "u_001",
  name: "Deniz Arslan",
  handle: "@denizde",
  region: "İzmir Körfezi",
  level: "Kıyı avcısı",
  avatarUrl: defaultProfileAvatarUrl,
  catches: 48,
  analyses: 126,
};

export const fishSpecies: FishSpecies[] = [
  {
    id: "levrek",
    name: "Levrek",
    latinName: "Dicentrarchus labrax",
    edible: true,
    idealSize: "30+ cm",
    habitat: "Kıyı, lagün ve liman ağızları",
    season: "Sonbahar ve ilkbahar",
    riskLevel: "Orta",
    recommendedBaits: ["Silikon", "Sardalya", "Canlı yem"],
    recommendedGear: ["Spin takım", "LRF uyumlu hafif setup"],
    regionNotes: ["Ege kıyıları", "Akdeniz kıyıları", "Liman çevreleri"],
  },
  {
    id: "cupra",
    name: "Çupra",
    latinName: "Sparus aurata",
    edible: true,
    idealSize: "20+ cm",
    habitat: "Taşlık dip, kumluk geçiş ve iskele çevresi",
    season: "Yaz sonu ve sonbahar",
    riskLevel: "Düşük",
    recommendedBaits: ["Karides", "Mamun", "Sülünez"],
    recommendedGear: ["Surf casting", "Dip oltası"],
    regionNotes: ["Ege", "Akdeniz", "Kıyı taşlık alanlar"],
  },
  {
    id: "lufer",
    name: "Lüfer",
    latinName: "Pomatomus saltatrix",
    edible: true,
    idealSize: "18+ cm",
    habitat: "Akıntılı boğaz hattı ve açık kıyı",
    season: "Eylül - Aralık",
    riskLevel: "Yüksek",
    recommendedBaits: ["Zargana", "Sahte yem", "Kaşık"],
    recommendedGear: ["Spin takım", "Tekne sırtısı"],
    regionNotes: ["Marmara", "Boğaz hattı", "Karadeniz geçişleri"],
  },
];

export const recentAnalyses: FishAnalysisResult[] = [
  {
    id: "a_001",
    species: "Levrek",
    confidence: 0.92,
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80",
    location: "Urla",
    date: "Bugün",
    edible: true,
  },
  {
    id: "a_002",
    species: "Çupra",
    confidence: 0.88,
    imageUrl: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=900&q=80",
    location: "Foça",
    date: "Dün",
    edible: true,
  },
  {
    id: "a_003",
    species: "Lüfer",
    confidence: 0.81,
    imageUrl: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=900&q=80",
    location: "Karaburun",
    date: "2 gün önce",
    edible: true,
  },
];

export const marinePoints: MarinePoint[] = [
  {
    id: "m_001",
    name: "Urla İskele",
    region: "İzmir",
    coordinates: [38.36, 26.77],
    density: 82,
    trend: "Artıyor",
    dominantSpecies: "Levrek",
    waterTemp: 19,
  },
  {
    id: "m_002",
    name: "Foça Açıkları",
    region: "İzmir",
    coordinates: [38.67, 26.75],
    density: 64,
    trend: "Sabit",
    dominantSpecies: "Çupra",
    waterTemp: 18,
  },
  {
    id: "m_003",
    name: "Karaburun Burnu",
    region: "İzmir",
    coordinates: [38.64, 26.51],
    density: 73,
    trend: "Artıyor",
    dominantSpecies: "Lüfer",
    waterTemp: 17,
  },
];

export const conversations: Conversation[] = [
  {
    id: "c_001",
    name: "Ege Ekibi",
    role: "Bölge grubu",
    lastMessage: "Urla tarafında sabah suyu daha hareketliydi.",
    unread: 3,
    updatedAt: "10:42",
  },
  {
    id: "c_002",
    name: "Mert K.",
    role: "Balıkçı",
    lastMessage: "Fotoğraf analizini paylaşıyorum.",
    unread: 0,
    updatedAt: "09:18",
  },
];

export const messages: Message[] = [
  {
    id: "msg_001",
    conversationId: "c_001",
    author: "them",
    body: "Sabah 06:30 gibi levrek hareketi vardı.",
    createdAt: "10:35",
  },
  {
    id: "msg_002",
    conversationId: "c_001",
    author: "me",
    body: "Harita yoğunluğu da aynı hattı işaret ediyor.",
    createdAt: "10:38",
  },
  {
    id: "msg_003",
    conversationId: "c_001",
    author: "them",
    body: "Akşam üzeri tekrar kontrol ederiz.",
    createdAt: "10:42",
  },
];

export const socialPosts: SocialPost[] = [
  {
    id: "p_001",
    author: "Deniz Arslan",
    region: "Urla",
    body: "Sabah suyunda silikonla güzel bir levrek aldık. Akıntı hafifken sonuç daha iyi.",
    species: "Levrek",
    likes: 42,
    comments: 8,
    createdAt: "1 sa önce",
  },
  {
    id: "p_002",
    author: "Ece Marin",
    region: "Foça",
    body: "Çupra için dip takımı bugün daha verimliydi. Yem olarak karides öne çıktı.",
    species: "Çupra",
    likes: 31,
    comments: 5,
    createdAt: "3 sa önce",
  },
];

export const dashboardStats = [
  { label: "Analiz", value: "126", note: "son 30 gün" },
  { label: "Doğruluk", value: "%91", note: "model güven ortalaması" },
  { label: "Aktif bölge", value: "3", note: "Ege kıyı hattı" },
  { label: "Topluluk", value: "18", note: "son paylaşımlar" },
];

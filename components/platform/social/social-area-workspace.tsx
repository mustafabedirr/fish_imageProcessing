"use client";

import type { ReactNode } from "react";
import { useMemo, useRef, useState } from "react";
import {
  Award,
  BarChart3,
  Bell,
  Bookmark,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit,
  Film,
  Globe2,
  GripVertical,
  Heart,
  Info,
  Image as ImageIcon,
  Lock,
  MapPin,
  Maximize2,
  MessageCircle,
  MoreVertical,
  Navigation,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Share2,
  SlidersHorizontal,
  Smile,
  Tag,
  Trophy,
  Upload,
  UserPlus,
  Users,
  Video,
  X,
} from "lucide-react";
import AnimatedTabBar from "../../ui/animated-tab-bar";
import NotificationPopover from "../shell/notification-popover";

const avatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80";

type SocialPostKind = "text" | "photo" | "video" | "location" | "poll";
type SocialPost = {
  id: string;
  author: string;
  handle: string;
  time: string;
  avatar: string;
  kind: SocialPostKind;
  text: string;
  tags: string[];
  likes: number;
  comments: number;
  photos: string[];
  location?: string;
  poll?: {
    question: string;
    options: [string, number][];
    votes: number;
  };
};

const feedPosts: SocialPost[] = [
  {
    id: "flow-text-james",
    author: "James Mitchell",
    handle: "@jamesfishes",
    time: "2 hours ago",
    kind: "text",
    avatar,
    text: "Finally caught my first rainbow trout today! What an exhilarating experience! Do you have any tips for where else I can find them?",
    tags: ["#RainbowTrout", "#Fishing", "#ProudCatch"],
    likes: 37,
    comments: 12,
    photos: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85"],
  },
  {
    id: "flow-photo-lily",
    author: "Lily Edmonds",
    handle: "@lilyfishes",
    time: "4 hours ago",
    kind: "photo",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80",
    text: "Happy to land this nice largemouth bass today on a local lake.",
    tags: ["#BassFishing", "#FishingLife"],
    likes: 68,
    comments: 24,
    photos: ["https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=1200&q=85"],
  },
  {
    id: "flow-poll-david",
    author: "David Anderson",
    handle: "@davidcasts",
    time: "6 hours ago",
    kind: "poll",
    poll: {
      question: "Bu hafta sonu nerede balik tutmayi planliyorsunuz?",
      options: [
        ["Gol", 45],
        ["Nehir", 30],
        ["Deniz", 15],
        ["Fikrim yok", 10],
      ],
      votes: 97,
    },
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=96&q=80",
    text: "Hafta sonu icin rota secimi yapiyoruz.",
    tags: ["#Poll", "#Weekend", "#FishingPlan"],
    likes: 97,
    comments: 18,
    photos: [],
  },
  {
    id: "flow-video-sophia",
    author: "Sophia Turner",
    handle: "@sophiaturner",
    time: "8 hours ago",
    kind: "video",
    avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=96&q=80",
    text: "Bugunku dalis anlarindan kisa bir kesit.",
    tags: ["#Diving", "#Underwater", "#OceanLife"],
    likes: 54,
    comments: 5,
    photos: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=85"],
  },
  {
    id: "flow-location-alicia",
    author: "Alicia Vikander",
    handle: "@avikander",
    time: "5 hours ago",
    kind: "location",
    location: "Kas, Antalya",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=96&q=80",
    text: "Bugunku dalis noktasi sakin ve gorus mesafesi cok iyiydi.",
    tags: ["#Location", "#Kas", "#Diving"],
    likes: 64,
    comments: 9,
    photos: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85"],
  },
  {
    id: "flow-text-marcus",
    author: "Marcus Lee",
    handle: "@marcuslee",
    time: "7 hours ago",
    kind: "text",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80",
    text: "Sabahin bu saatinde denizde olmak bambaska bir huzur veriyor. Doga insana her zaman iyi geliyor.",
    tags: ["#FishingLife", "#MorningVibes", "#Ocean"],
    likes: 46,
    comments: 3,
    photos: [],
  },
  {
    id: "flow-photo-emma",
    author: "Emma Watson",
    handle: "@emmawaters",
    time: "10 hours ago",
    kind: "photo",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=96&q=80",
    text: "Ufak bir yakalama gunlugu. Renkler ve desenler gercekten etkileyici.",
    tags: ["#Catch", "#Gallery", "#Trout"],
    likes: 48,
    comments: 7,
    photos: [
      "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?auto=format&fit=crop&w=1100&q=85",
      "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=520&q=85",
      "https://images.unsplash.com/photo-1516685018646-5499d0a7d42f?auto=format&fit=crop&w=520&q=85",
    ],
  },
  {
    id: "flow-location-daniel",
    author: "Daniel Kim",
    handle: "@danielangler",
    time: "12 hours ago",
    kind: "location",
    location: "Uzungol, Trabzon",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=96&q=80",
    text: "Sisli hava, temiz su ve cok sakin bir rota.",
    tags: ["#Location", "#Uzungol", "#Route"],
    likes: 71,
    comments: 11,
    photos: ["https://images.unsplash.com/photo-1476611338391-6f395a0ebc7b?auto=format&fit=crop&w=1000&q=85"],
  },
  {
    id: "flow-video-lily-sunset",
    author: "Lily Edmonds",
    handle: "@lilyfishes",
    time: "13 hours ago",
    kind: "video",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80",
    text: "Gun batiminda kiyidan kisa bir olta denemesi. Isik harikaydi.",
    tags: ["#SunsetFishing", "#LakeLife", "#Video"],
    likes: 91,
    comments: 14,
    photos: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85"],
  },
  {
    id: "flow-poll-james-gear",
    author: "James Mitchell",
    handle: "@jamesfishes",
    time: "15 hours ago",
    kind: "poll",
    poll: {
      question: "En sevdiginiz olta takimi hangisi?",
      options: [
        ["Spin", 50],
        ["Fly Fishing", 25],
        ["Surf Casting", 15],
        ["Diger", 10],
      ],
      votes: 120,
    },
    avatar,
    text: "Yeni ekipman listesi icin topluluk fikri aliyorum.",
    tags: ["#Gear", "#Poll", "#Tackle"],
    likes: 120,
    comments: 20,
    photos: [],
  },
  {
    id: "flow-text-sophia-good-vibes",
    author: "Sophia Turner",
    handle: "@sophiaturner",
    time: "16 hours ago",
    kind: "text",
    avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=96&q=80",
    text: "Bugun harika bir gun gecirdik! Temiz hava, guzel insanlar ve bol kahkaha. Daha ne olsun?",
    tags: ["#GoodVibes", "#Friends", "#Nature"],
    likes: 38,
    comments: 2,
    photos: [],
  },
  {
    id: "flow-photo-marcus-fish",
    author: "Marcus Lee",
    handle: "@marcuslee",
    time: "18 hours ago",
    kind: "photo",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80",
    text: "Renkleriyle dikkat ceken guzel bir tur. Kisa bir gozlem notu olarak kaydettim.",
    tags: ["#Species", "#Color", "#Observation"],
    likes: 66,
    comments: 6,
    photos: ["https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?auto=format&fit=crop&w=950&q=85"],
  },
];

const suggestedFriends = [
  ["Julia Smith", "@juliasmith", "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=96&q=80"],
  ["Vermillion D. Gray", "@vermilliongray", avatar],
  ["Mai Senpai", "@maisenpai", "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=96&q=80"],
  ["Azunyan U. Wu", "@azunyardesu", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80"],
  ["Qarack Babarma", "@obama21", "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=96&q=80"],
];

const storyItems = [
  {
    name: "Your Story",
    handle: "Add to story",
    time: "Now",
    avatar,
    ownStory: true,
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=86",
    caption: "Start a new story from your latest catch.",
    location: "Lake Washington",
  },
  {
    name: "maieongu",
    handle: "maieongu",
    time: "1h ago",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80",
    ownStory: false,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=86",
    caption: "Clear water and calm wind at sunrise.",
    location: "Kas, Antalya",
  },
  {
    name: "sayfortwirl",
    handle: "sayfortwirl",
    time: "2h ago",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=96&q=80",
    ownStory: false,
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=86",
    caption: "Nothing beats a quiet morning by the lake.",
    location: "Lake Washington",
  },
  {
    name: "johndoe",
    handle: "johndoe",
    time: "3h ago",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=96&q=80",
    ownStory: false,
    image: "https://images.unsplash.com/photo-1476611338391-6f395a0ebc7b?auto=format&fit=crop&w=1200&q=86",
    caption: "Mountain route marked for the weekend.",
    location: "Uzungol",
  },
  {
    name: "maryjane2",
    handle: "maryjane2",
    time: "4h ago",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=96&q=80",
    ownStory: false,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=86",
    caption: "A short dive near the reef.",
    location: "North Aegean",
  },
  {
    name: "dbanna",
    handle: "dbanna",
    time: "5h ago",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=96&q=80",
    ownStory: false,
    image: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=1200&q=86",
    caption: "Catch log updated after a clean release.",
    location: "Aegean Bay",
  },
  {
    name: "x_ae-21b",
    handle: "x_ae-21b",
    time: "6h ago",
    avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=96&q=80",
    ownStory: false,
    image: "https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=1200&q=86",
    caption: "Bass activity was strong today.",
    location: "Blue Water Lake",
  },
] as const;

const featuredDemoPostIds = new Set([
  "flow-text-james",
  "flow-photo-lily",
  "flow-poll-david",
  "flow-video-sophia",
  "flow-location-alicia",
  "flow-text-marcus",
  "flow-photo-emma",
  "flow-location-daniel",
  "flow-video-lily-sunset",
  "flow-poll-james-gear",
  "flow-text-sophia-good-vibes",
  "flow-photo-marcus-fish",
]);

const topics = [
  ["# BassFishing", "12.3k posts"],
  ["# TroutFishing", "9.1k posts"],
  ["# FishingTips", "7.4k posts"],
  ["# TackleBox", "6.8k posts"],
  ["# CatchAndRelease", "6.1k posts"],
];

const members = [
  ["John Fisher", "2.4k pts", avatar],
  ["Lily Edmonds", "1.8k pts", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80"],
  ["Michael Thompson", "1.5k pts", "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=96&q=80"],
  ["James Mitchell", "1.2k pts", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80"],
  ["Sophia Martinez", "980 pts", "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=96&q=80"],
];

const interactionComments = [
  {
    author: "Lily Edmonds",
    time: "1 saat once",
    text: "Harika bir kare! Renkler ve netlik muthis.",
    likes: 3,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80",
  },
  {
    author: "James Mitchell",
    time: "45 dakika once",
    text: "Bu balik surusu inanilmaz! Nerede dalis yaptiniz?",
    likes: 2,
    avatar,
  },
  {
    author: "Sophia Turner",
    time: "20 dakika once",
    text: "Keske orada olabilseydim!",
    likes: 1,
    avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=96&q=80",
  },
];

const feedTabs = ["For You", "Following", "Popular", "Groups", "Saved"] as const;
type FeedTab = (typeof feedTabs)[number];
const feedTabLabels: Record<FeedTab, string> = {
  "For You": "For You",
  Following: "Following",
  Popular: "Popular",
  Groups: "Groups",
  Saved: "Saved",
};
type SocialModal = "create" | "media" | "video" | "location" | "poll" | "achievement" | "notifications" | "comments" | "share" | "friends" | "topics" | "members" | "events" | null;

const modalCopy: Record<Exclude<SocialModal, null>, { title: string; eyebrow: string; description: string }> = {
  create: {
    eyebrow: "Yeni Paylasim",
    title: "Toplulukla yeni bir av deneyimi paylas",
    description: "Metin, gorsel, konum ve hedef kitle bilgilerini tek akista duzenleyebilirsiniz.",
  },
  media: {
    eyebrow: "Medya Akisi",
    title: "Share Your Catch",
    description: "Add a photo or video from your fishing adventure.",
  },
  video: {
    eyebrow: "Video Akisi",
    title: "Share a Video",
    description: "Upload your fishing moments and share with the community.",
  },
  location: {
    eyebrow: "Konum",
    title: "Share Your Location",
    description: "Let others know where you are fishing.",
  },
  poll: {
    eyebrow: "Anket",
    title: "Create a Poll",
    description: "Ask a question to the community and see what they think.",
  },
  achievement: {
    eyebrow: "Basari",
    title: "Yakalama basarisini one cikar",
    description: "Skor, agirlik veya tur rozeti ekleyerek paylasiminizi daha belirgin hale getirin.",
  },
  notifications: {
    eyebrow: "Bildirimler",
    title: "Son topluluk hareketleri",
    description: "Yeni yorumlar, arkadas istekleri ve etkinlik hatirlatmalari burada listelenir.",
  },
  comments: {
    eyebrow: "Yorumlar",
    title: "Gonderi yorumlarini yonet",
    description: "Kisa bir yorum ekleyin veya mevcut yorum akisindaki geri bildirimleri inceleyin.",
  },
  share: {
    eyebrow: "Paylas",
    title: "Gonderiyi paylasim kanalina gonder",
    description: "AquaScope icinde, profilinizde veya harici baglanti olarak paylasabilirsiniz.",
  },
  friends: {
    eyebrow: "Arkadaslar",
    title: "Onerilen kullanicilari incele",
    description: "Ortak ilgi alanlarina gore onerilen balikcilari takip listenize ekleyin.",
  },
  topics: {
    eyebrow: "Trendler",
    title: "Populer konu etiketleri",
    description: "Sik kullanilan etiketleri inceleyin ve akis filtrelerinize uygulayin.",
  },
  members: {
    eyebrow: "Liderlik",
    title: "Topluluk siralamasini gor",
    description: "Bu haftanin en aktif uyelerini ve puan durumlarini takip edin.",
  },
  events: {
    eyebrow: "Etkinlikler",
    title: "Yaklasan etkinlik akisina katil",
    description: "Planlanan saha etkinliklerini goruntuleyin ve katilim durumunuzu yonetin.",
  },
};

export default function SocialAreaWorkspace() {
  const [posts, setPosts] = useState(feedPosts);
  const [activeTab, setActiveTab] = useState<FeedTab>("For You");
  const [searchQuery, setSearchQuery] = useState("");
  const [composerText, setComposerText] = useState("");
  const [audience, setAudience] = useState("Everyone");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [sharedPosts, setSharedPosts] = useState<Record<string, boolean>>({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Record<string, boolean>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [addedFriends, setAddedFriends] = useState<Record<string, boolean>>({});
  const [hiddenFriends, setHiddenFriends] = useState<Record<string, boolean>>({});
  const [joinedEvent, setJoinedEvent] = useState(false);
  const [notice, setNotice] = useState("Topluluk akisiniz hazir.");
  const [activeModal, setActiveModal] = useState<SocialModal>(null);
  const [activeFlowPostId, setActiveFlowPostId] = useState<string | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

  const visiblePosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const searched = posts.filter((post) => {
      if (!query) return true;
      return [post.author, post.handle, post.text, ...post.tags].some((value) => value.toLowerCase().includes(query));
    });

    if (activeTab === "Following") {
      return searched.filter((post) => ["Lily Edmonds", "James Mitchell"].includes(post.author));
    }

    if (activeTab === "Popular") {
      return [...searched].sort((a, b) => b.likes - a.likes);
    }

    if (activeTab === "Saved") {
      return searched.filter((post) => bookmarkedPosts[post.id]);
    }

    return [...searched].sort((a, b) => Number(featuredDemoPostIds.has(b.id)) - Number(featuredDemoPostIds.has(a.id)));
  }, [activeTab, bookmarkedPosts, posts, searchQuery]);

  const createPost = () => {
    const text = composerText.trim();
    if (!text) {
      setNotice("Paylasim yapmak icin once bir metin girin.");
      return;
    }

    const tags = Array.from(new Set(text.match(/#[\w-]+/g) ?? ["#AquaScope"]));
    setPosts((current) => [
      {
        id: `local-${Date.now()}`,
        author: "Derya Yilmaz",
        handle: "@deryayilmaz",
        time: "Just now",
        avatar,
        kind: "text",
        text,
        tags,
        likes: 0,
        comments: 0,
        photos: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=85"],
      },
      ...current,
    ]);
    setComposerText("");
    setActiveTab("For You");
    setNotice(`${audience} icin yeni paylasim yayinlandi.`);
  };

  const toggleAudience = () => {
    setAudience((current) => (current === "Everyone" ? "Followers" : "Everyone"));
  };

  const audienceLabel = audience === "Everyone" ? "Herkese Acik" : "Takipciler";

  const openModal = (modal: Exclude<SocialModal, null>, postId?: string) => {
    setActiveFlowPostId(postId ?? null);
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
    setActiveFlowPostId(null);
  };

  const closeStoryViewer = () => setActiveStoryIndex(null);
  const goToPreviousStory = () => setActiveStoryIndex((current) => {
    if (current === null) return null;
    return current === 0 ? storyItems.length - 1 : current - 1;
  });
  const goToNextStory = () => setActiveStoryIndex((current) => {
    if (current === null) return null;
    return current === storyItems.length - 1 ? 0 : current + 1;
  });

  return (
    <section className="social-area-page">
      <div className="social-area-content social-area-content--mockup">
        <main className="social-feed-panel">
          <header className="social-area-title">
            <div>
              <h1>Social Area</h1>
            </div>

            <div className="social-top-actions">
              <label className="social-search">
                <Search size={18} />
                <input
                  type="search"
                  placeholder="Search for friends, groups, pages..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                <span>Ctrl K</span>
              </label>
              <button type="button" className="social-create-button" onClick={() => openModal("create")}>
                <Edit size={16} />
                Create Post
                <ChevronDown size={15} />
              </button>
              <NotificationPopover buttonClassName="social-bell" iconSize={18} label="Notifications" />
              <FriendRequestsPopover
                addedFriends={addedFriends}
                hiddenFriends={hiddenFriends}
                onToggleAdd={(name) => setAddedFriends((current) => ({ ...current, [name]: !current[name] }))}
                onHide={(name) => setHiddenFriends((current) => ({ ...current, [name]: true }))}
              />
              <button type="button" className="social-profile-chip" aria-label="Open profile menu">
                <img src={avatar} alt="Derya Yilmaz" />
                <span />
                <ChevronDown size={14} />
              </button>
            </div>
          </header>

          <section className="social-composer">
            <div className="social-composer-row">
              <img src={avatar} alt="Derya Yilmaz" />
              <div className="social-composer-body">
                <textarea
                  placeholder="What's happening, Derya?"
                  aria-label="Share a post"
                  value={composerText}
                  onChange={(event) => setComposerText(event.target.value)}
                  onKeyDown={(event) => {
                    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") createPost();
                  }}
                  rows={2}
                />

                <div className="social-composer-tools">
                  <div className="social-composer-actions">
                    <button type="button" aria-label="Add photo" title="Photo" onClick={() => openModal("media")}>
                      <ImageIcon size={17} />
                      <span>Photo</span>
                    </button>
                    <button type="button" aria-label="Add video" title="Video" onClick={() => openModal("video")}>
                      <Video size={17} />
                      <span>Video</span>
                    </button>
                    <button type="button" aria-label="Add location" title="Location" onClick={() => openModal("location")}>
                      <MapPin size={17} />
                      <span>Location</span>
                    </button>
                    <button type="button" aria-label="Add poll" title="Poll" onClick={() => openModal("poll")}>
                      <SlidersHorizontal size={17} />
                      <span>Poll</span>
                    </button>
                    <button type="button" aria-label="Add feeling" title="Feeling">
                      <Smile size={17} />
                      <span>Feeling</span>
                    </button>
                  </div>
                  <button type="button" className="social-post-button" onClick={createPost}>
                      Post
                    <ChevronDown size={14} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="social-story-rail" aria-label="Stories">
            {storyItems.map((story, index) => (
              <button type="button" key={`${story.name}-${story.avatar}`} className={story.ownStory ? "social-story-item is-own" : "social-story-item"} onClick={() => setActiveStoryIndex(index)}>
                <span>
                  <img src={story.avatar} alt={story.name} />
                  {story.ownStory ? <b><Plus size={12} /></b> : null}
                </span>
                <small>{story.name}</small>
              </button>
            ))}
            <button type="button" className="social-story-next" aria-label="Next stories">
              <ChevronRight size={19} />
            </button>
          </section>

          <AnimatedTabBar
            ariaLabel="Social feed tabs"
            activeButtonClassName="is-active"
            activeValue={activeTab}
            buttonClassName="social-tab-button"
            className="social-tabs"
            layoutId="social-feed-active-tab"
            onChange={(value) => setActiveTab(value as FeedTab)}
            tabs={feedTabs.map((tab) => ({ title: feedTabLabels[tab], value: tab }))}
            trailingContent={
              <>
                <button type="button" className={filtersOpen ? "social-filter is-open" : "social-filter"} onClick={() => setFiltersOpen((open) => !open)}>
                  <SlidersHorizontal size={15} />
                  Filtreler
                  <ChevronDown size={15} />
                </button>
                {filtersOpen ? (
                  <div className="social-filter-menu">
                    <button type="button" onClick={() => setActiveTab("Popular")}>High engagement</button>
                    <button type="button" onClick={() => setSearchQuery("#Fishing")}>#Fishing</button>
                    <button type="button" onClick={() => setSearchQuery("")}>Clear filters</button>
                  </div>
                ) : null}
              </>
            }
          />

          <div className="social-post-stack" key={activeTab}>
            {visiblePosts.length ? visiblePosts.map((post) => (
              <article
                className={`social-post-card social-post-card--${post.kind ?? "photo"}`}
                key={post.id}
                role="button"
                tabIndex={0}
                onClick={() => openModal("comments", post.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openModal("comments", post.id);
                  }
                }}
              >
                <header>
                  <img src={post.avatar} alt={post.author} />
                  <div>
                    <strong>{post.author}</strong>
                    <span>{post.time}</span>
                  </div>
                  <button type="button" className="social-post-more" aria-label="Post options" onClick={(event) => event.stopPropagation()}>
                    <MoreVertical size={18} />
                  </button>
                  <button
                    className={bookmarkedPosts[post.id] ? "social-bookmark is-active" : "social-bookmark"}
                    type="button"
                    aria-label="Bookmark post"
                    onClick={(event) => {
                      event.stopPropagation();
                      setBookmarkedPosts((current) => ({ ...current, [post.id]: !current[post.id] }));
                    }}
                  >
                    <Bookmark size={18} />
                  </button>
                </header>

                {(post.kind ?? "photo") === "text" ? (
                  <div className="social-post-text-body">
                    <PostKindBadge kind="text" />
                    <p>{post.text}</p>
                    <PostTags tags={post.tags} />
                    {post.photos[0] ? (
                      <div className="social-post-photos">
                        <figure>
                          <img src={post.photos[0]} alt={`${post.author} shared moment`} />
                        </figure>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {post.kind === "poll" ? (
                  <div className="social-post-poll-body">
                    <PostKindBadge kind="poll" />
                    <p>{post.poll?.question ?? post.text}</p>
                    <div className="social-poll-options">
                      {post.poll?.options.map(([label, value]) => (
                        <span key={label}>
                          <b><em style={{ width: `${value}%` }} />{label}</b>
                          <strong>{value}%</strong>
                        </span>
                      ))}
                    </div>
                    <small>{post.poll?.votes ?? 0} votes</small>
                  </div>
                ) : null}

                {post.kind === "location" ? (
                  <div className="social-post-location-body">
                    <PostKindBadge kind="location" />
                    <h3>{post.location}</h3>
                    <span>Turkiye</span>
                    <p>{post.text}</p>
                    <figure>
                      <img src={post.photos[0]} alt={post.location ?? post.author} />
                    </figure>
                    <PostTags tags={post.tags} />
                  </div>
                ) : null}

                {(post.kind === "photo" || post.kind === "video" || !post.kind) ? (
                  <div className="social-post-media-body">
                    <PostKindBadge kind={post.kind === "video" ? "video" : "photo"} />
                    <p className="social-post-caption">{post.text}</p>
                    <PostTags tags={post.tags} />
                    <div className={post.photos.length > 1 ? "social-post-photos social-post-photos--grid" : "social-post-photos"}>
                      {post.photos.slice(0, 2).map((photo, index) => (
                        <figure key={photo}>
                          <img src={photo} alt={`${post.author} catch ${index + 1}`} />
                          {post.kind === "video" ? <span className="social-video-play"><Video size={26} /></span> : null}
                          {index === 1 && post.photos.length > 2 ? <figcaption>+{post.photos.length - 1}</figcaption> : null}
                        </figure>
                      ))}
                    </div>
                  </div>
                ) : null}

                <footer>
                  <button
                    className={likedPosts[post.id] ? "social-post-action is-active" : "social-post-action"}
                    type="button"
                    aria-pressed={Boolean(likedPosts[post.id])}
                    onClick={(event) => {
                      event.stopPropagation();
                      setLikedPosts((current) => ({ ...current, [post.id]: !current[post.id] }));
                    }}
                  >
                    <Heart size={18} />
                    <span className="social-reaction-stack" aria-hidden>
                      <img src={avatar} alt="" />
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=48&q=80" alt="" />
                      <img src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=48&q=80" alt="" />
                    </span>
                    {post.likes + (likedPosts[post.id] ? 1 : 0)}
                  </button>
                  <button
                    className="social-post-action"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openModal("comments", post.id);
                    }}
                  >
                    <MessageCircle size={18} />
                    {commentCounts[post.id] ?? post.comments} Comments
                  </button>
                  <button
                    className={sharedPosts[post.id] ? "social-post-action is-active" : "social-post-action"}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openModal("share", post.id);
                    }}
                  >
                    <Share2 size={18} />
                    {sharedPosts[post.id] ? "1" : post.id === "flow-text-james" ? "187" : ""}
                  </button>
                </footer>
              </article>
            )) : <div className="social-empty-state">Aramanizla eslesen paylasim bulunamadi.</div>}
          </div>
        </main>

        <aside className="social-interactions-panel">
          <SocialPanel title="Friend Suggestions" action="See All" onAction={() => openModal("friends")}>
            <div className="social-suggestion-list">
              {suggestedFriends.map(([name, handle, image]) => (
                <article key={name}>
                  <img src={image} alt={name} />
                  <div>
                    <strong>{name}</strong>
                    <span>{handle}</span>
                  </div>
                  <button type="button" aria-label={`Add ${name}`} onClick={() => setAddedFriends((current) => ({ ...current, [name]: !current[name] }))}>
                    <Plus size={16} />
                  </button>
                </article>
              ))}
            </div>
          </SocialPanel>

          <SocialPanel title="Profile Activity" action="" onAction={() => openModal("members")}>
            <div className="social-profile-activity-card">
              <div className="social-profile-activity-avatars">
                {members.slice(0, 5).map(([name, , image]) => (
                  <img key={name} src={image} alt={name} />
                ))}
                <span>+12</span>
              </div>
              <strong>+1,158 <span>Followers</span></strong>
              <p><b>23%</b> vs last month</p>
              <small>You gained a substantial amount of followers this month!</small>
            </div>
          </SocialPanel>

          <SocialPanel title="Upcoming Events" action="See All" onAction={() => openModal("events")}>
            <div className="social-event-card">
              <time>
                <span>MAY</span>
                25
              </time>
              <div>
                <strong>Lake Clean-up Day</strong>
                <span>May 25, 2024 - 09:00 AM</span>
                <small>Lake Washington</small>
              </div>
              <button type="button" aria-label="Previous event"><ChevronLeft size={16} /></button>
              <button type="button" className={joinedEvent ? "is-joined" : ""} onClick={() => setJoinedEvent((joined) => !joined)} aria-label="Join event">
                {joinedEvent ? "Joined" : <ChevronRight size={16} />}
              </button>
            </div>
          </SocialPanel>
        </aside>
      </div>

      {activeStoryIndex !== null ? (
        <StoryViewer
          activeIndex={activeStoryIndex}
          stories={storyItems}
          onClose={closeStoryViewer}
          onNext={goToNextStory}
          onPrevious={goToPreviousStory}
          onSelect={setActiveStoryIndex}
        />
      ) : null}

      {activeModal === "comments" ? (
        <PostInteractionModal
          post={visiblePosts.find((post) => post.id === activeFlowPostId) ?? visiblePosts[0] ?? posts[0] ?? feedPosts[0]}
          isBookmarked={Boolean(activeFlowPostId && bookmarkedPosts[activeFlowPostId])}
          isLiked={Boolean(activeFlowPostId && likedPosts[activeFlowPostId])}
          likeCount={(visiblePosts.find((post) => post.id === activeFlowPostId) ?? visiblePosts[0] ?? posts[0] ?? feedPosts[0]).likes + (activeFlowPostId && likedPosts[activeFlowPostId] ? 1 : 0)}
          commentCount={activeFlowPostId ? (commentCounts[activeFlowPostId] ?? (visiblePosts.find((post) => post.id === activeFlowPostId) ?? visiblePosts[0] ?? posts[0] ?? feedPosts[0]).comments) : 0}
          onClose={closeModal}
          onToggleBookmark={() => {
            const targetPostId = activeFlowPostId ?? visiblePosts[0]?.id ?? posts[0]?.id;
            if (!targetPostId) return;
            setBookmarkedPosts((current) => ({ ...current, [targetPostId]: !current[targetPostId] }));
          }}
          onToggleLike={() => {
            const targetPostId = activeFlowPostId ?? visiblePosts[0]?.id ?? posts[0]?.id;
            if (!targetPostId) return;
            setLikedPosts((current) => ({ ...current, [targetPostId]: !current[targetPostId] }));
          }}
          onSubmitComment={() => {
            const targetPostId = activeFlowPostId ?? visiblePosts[0]?.id ?? posts[0]?.id;
            if (!targetPostId) return;
            const targetPost = visiblePosts.find((post) => post.id === targetPostId) ?? posts.find((post) => post.id === targetPostId);
            setCommentCounts((current) => ({ ...current, [targetPostId]: (current[targetPostId] ?? targetPost?.comments ?? 0) + 1 }));
          }}
        />
      ) : activeModal ? (
        <SocialFlowModal
          modal={activeModal}
          audience={audience}
          composerText={composerText}
          onClose={closeModal}
          onCreate={() => {
            if (!composerText.trim()) {
              createPost();
              return;
            }
            createPost();
            closeModal();
          }}
          onApply={(modal) => {
            const targetPostId = activeFlowPostId ?? visiblePosts[0]?.id ?? "local";
            if (modal === "media" || modal === "video") {
              const current: SocialPost = {
                id: `${modal}-${Date.now()}`,
                author: "Derya Yilmaz",
                handle: "@derya",
                time: "Az once",
                avatar,
                kind: modal === "video" ? "video" : "photo",
                text: composerText.trim() || (modal === "video" ? "Yeni bir av videosu paylasti." : "Yeni bir av gorseli paylasti."),
                tags: modal === "video" ? ["#FishingVideo", "#AegeanSea"] : ["#Catch", "#Fishing"],
                likes: 0,
                comments: 0,
                photos: [
                  modal === "video"
                    ? "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=85"
                    : "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=1200&q=85",
                ],
              };
              setPosts((currentPosts) => [current, ...currentPosts]);
              setComposerText("");
              setActiveTab("For You");
            }
            if (modal === "location") setComposerText((current) => `${current}${current ? " " : ""}Lake Washington`);
            if (modal === "achievement") setComposerText((current) => `${current}${current ? " " : ""}#Achievement`);
            if (modal === "poll") setComposerText((current) => `${current}${current ? " " : ""}#CommunityPoll`);
            if (modal === "comments") {
              const targetPost = visiblePosts.find((post) => post.id === targetPostId);
              setCommentCounts((current) => ({ ...current, [targetPostId]: (current[targetPostId] ?? targetPost?.comments ?? 0) + 1 }));
            }
            if (modal === "share") setSharedPosts((current) => ({ ...current, [targetPostId]: true }));
            setNotice(`${modalCopy[modal].eyebrow} akisi uygulandi.`);
            closeModal();
          }}
          onSaveDraft={() => {
            setNotice("Taslak kaydedildi.");
            closeModal();
          }}
        />
      ) : null}
    </section>
  );
}

function PostKindBadge({ kind }: { kind: SocialPostKind }) {
  const badgeMap: Record<SocialPostKind, { label: string; Icon: typeof SlidersHorizontal }> = {
    text: { label: "Text", Icon: SlidersHorizontal },
    photo: { label: "Photo", Icon: ImageIcon },
    video: { label: "Video", Icon: Video },
    location: { label: "Location", Icon: MapPin },
    poll: { label: "Poll", Icon: BarChart3 },
  };
  const { label, Icon } = badgeMap[kind];

  return (
    <span className={`social-post-kind social-post-kind--${kind}`}>
      <Icon size={16} />
      {label}
    </span>
  );
}

function PostTags({ tags }: { tags: string[] }) {
  return (
    <div className="social-post-tags">
      {tags.map((tag) => (
        <span key={tag}>{tag}</span>
      ))}
    </div>
  );
}

function FriendRequestsPopover({
  addedFriends,
  hiddenFriends,
  onToggleAdd,
  onHide,
}: {
  addedFriends: Record<string, boolean>;
  hiddenFriends: Record<string, boolean>;
  onToggleAdd: (name: string) => void;
  onHide: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const visibleFriends = suggestedFriends.filter(([name]) => !hiddenFriends[name]);

  return (
    <div className="social-friend-popover">
      <button
        type="button"
        className={open ? "social-friend-trigger is-open" : "social-friend-trigger"}
        aria-label="Friend requests"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <UserPlus size={18} />
        {visibleFriends.length ? <b>{visibleFriends.length}</b> : null}
      </button>

      {open ? (
        <section className="social-friend-menu">
          <header>
            <div>
              <strong>Friend Requests</strong>
              <span>Suggested anglers and pending invites</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close friend requests">
              <X size={16} />
            </button>
          </header>

          <div className="social-friend-menu-list">
            {visibleFriends.map(([name, detail, image]) => (
              <article key={name}>
                <img src={image} alt={name} />
                <div>
                  <strong>{name}</strong>
                  <span>{detail}</span>
                </div>
                <button type="button" className={addedFriends[name] ? "is-added" : ""} onClick={() => onToggleAdd(name)}>
                  {addedFriends[name] ? "Added" : "Add"}
                </button>
                <button type="button" aria-label={`Dismiss ${name}`} onClick={() => onHide(name)}>
                  <X size={15} />
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function StoryViewer({
  activeIndex,
  stories,
  onClose,
  onNext,
  onPrevious,
  onSelect,
}: {
  activeIndex: number;
  stories: typeof storyItems;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSelect: (index: number) => void;
}) {
  const activeStory = stories[activeIndex];

  return (
    <div className="social-story-viewer-backdrop" role="dialog" aria-modal="true" aria-label={`${activeStory.name} story viewer`}>
      <section className="social-story-viewer">
        <aside className="social-story-list">
          <h2>Stories</h2>
          <div className="social-story-list-items">
            {stories.map((story, index) => (
              <button type="button" key={`${story.name}-${story.time}`} className={index === activeIndex ? "is-active" : ""} onClick={() => onSelect(index)}>
                <span>
                  <img src={story.avatar} alt={story.name} />
                  {story.ownStory ? <b><Plus size={12} /></b> : null}
                </span>
                <div>
                  <strong>{story.ownStory ? "Your Story" : story.name}</strong>
                  <small>{story.ownStory ? story.handle : story.time}</small>
                </div>
                {!story.ownStory && index === activeIndex ? <i /> : null}
              </button>
            ))}
          </div>
          <button type="button" className="social-story-view-all">View All Stories</button>
        </aside>

        <main className="social-story-stage">
          <div className="social-story-progress" aria-hidden>
            {stories.map((story, index) => (
              <span key={`${story.name}-progress`} className={index <= activeIndex ? "is-filled" : ""} />
            ))}
          </div>

          <header>
            <img src={activeStory.avatar} alt={activeStory.name} />
            <div>
              <strong>{activeStory.name}</strong>
              <span>{activeStory.time}</span>
            </div>
            <button type="button" aria-label="Story options">
              <MoreVertical size={19} />
            </button>
          </header>

          <figure>
            <img src={activeStory.image} alt={`${activeStory.name} story`} />
          </figure>

          <button type="button" className="social-story-nav social-story-nav--previous" aria-label="Previous story" onClick={onPrevious}>
            <ChevronLeft size={23} />
          </button>
          <button type="button" className="social-story-nav social-story-nav--next" aria-label="Next story" onClick={onNext}>
            <ChevronRight size={23} />
          </button>

          <div className="social-story-caption">
            <p>{activeStory.caption}</p>
            <span><MapPin size={14} />{activeStory.location}</span>
          </div>

          <label className="social-story-reply">
            <input type="text" placeholder="Reply..." />
            <button type="button" aria-label="Send reply">
              <Send size={20} />
            </button>
          </label>
        </main>

        <aside className="social-story-actions">
          <button type="button" className="social-story-close" aria-label="Close story viewer" onClick={onClose}>
            <X size={25} />
          </button>
          <button type="button" aria-label="Like story"><Heart size={24} /><span>142</span></button>
          <button type="button" aria-label="Comment story"><MessageCircle size={24} /><span>24</span></button>
          <button type="button" aria-label="Share story"><Send size={23} /><span>12</span></button>
          <button type="button" aria-label="Save story"><Bookmark size={23} /></button>
        </aside>
      </section>
    </div>
  );
}

function PostInteractionModal({
  post,
  isBookmarked,
  isLiked,
  likeCount,
  commentCount,
  onClose,
  onToggleBookmark,
  onToggleLike,
  onSubmitComment,
}: {
  post: (typeof feedPosts)[number];
  isBookmarked: boolean;
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
  onClose: () => void;
  onToggleBookmark: () => void;
  onToggleLike: () => void;
  onSubmitComment: () => void;
}) {
  const [comment, setComment] = useState("");
  const primaryPhoto = post.photos[0];
  const galleryCount = Math.max(6, post.photos.length || 1);
  const location = post.location ?? "Lake Washington";

  const handleSubmit = () => {
    if (!comment.trim()) return;
    onSubmitComment();
    setComment("");
  };

  return (
    <div className="social-post-detail-backdrop" role="dialog" aria-modal="true" aria-label={`${post.author} post detail`}>
      <section className="social-post-detail-modal">
        <div className="social-post-detail-media">
          <button type="button" className="social-post-detail-close" aria-label="Close detail" onClick={onClose}>
            <X size={22} />
          </button>

          <span className="social-post-detail-counter">1 / {galleryCount}</span>

          <button type="button" className="social-post-detail-nav social-post-detail-nav--prev" aria-label="Previous media">
            <ChevronLeft size={25} />
          </button>

          <figure>
            {primaryPhoto ? (
              <img src={primaryPhoto} alt={`${post.author} shared catch`} />
            ) : (
              <div className={`social-post-detail-placeholder social-post-detail-placeholder--${post.kind}`}>
                <PostKindBadge kind={post.kind} />
                {post.kind === "poll" ? (
                  <>
                    <h2>{post.poll?.question ?? post.text}</h2>
                    <div className="social-post-detail-poll">
                      {post.poll?.options.map(([label, value]) => (
                        <span key={label}>
                          <b>{label}</b>
                          <em><i style={{ width: `${value}%` }} /></em>
                          <strong>{value}%</strong>
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <h2>{post.text}</h2>
                )}
              </div>
            )}
          </figure>

          <button type="button" className="social-post-detail-nav social-post-detail-nav--next" aria-label="Next media">
            <ChevronRight size={25} />
          </button>

          <div className="social-post-detail-dots" aria-hidden>
            {Array.from({ length: galleryCount }).map((_, dot) => (
              <span className={dot === 0 ? "is-active" : ""} key={dot} />
            ))}
          </div>

          <button type="button" className="social-post-detail-expand" aria-label="Expand media">
            <Maximize2 size={18} />
          </button>
        </div>

        <aside className="social-post-detail-panel">
          <header className="social-post-detail-author">
            <img src={post.avatar} alt={post.author} />
            <div>
              <strong>{post.author}</strong>
              <span>{post.time}</span>
            </div>
            <button type="button" className="social-detail-follow">
              <Users size={15} />
              Follow
            </button>
            <button type="button" className="social-detail-more" aria-label="Post options">
              <MoreVertical size={19} />
            </button>
          </header>

          <div className="social-post-detail-copy">
            <p>{post.text}</p>

            <div className="social-post-detail-tags">
              {post.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            <span className="social-post-detail-location">
              <MapPin size={15} />
              {location}
            </span>
          </div>

          <div className="social-post-detail-stats">
            <button type="button" className={isLiked ? "is-active" : ""} onClick={onToggleLike}>
              <Heart size={24} />
              {likeCount}
            </button>
            <button type="button">
              <MessageCircle size={24} />
              {commentCount}
            </button>
            <button type="button">
              <Share2 size={23} />
              187
            </button>
            <button type="button" className={isBookmarked ? "is-active" : ""} aria-pressed={isBookmarked} aria-label="Bookmark post" onClick={onToggleBookmark}>
              <Bookmark size={23} />
            </button>
          </div>

          <section className="social-post-detail-comments">
            <div className="social-post-detail-comments-head">
              <h3>Comments ({commentCount})</h3>
              <button type="button">
                Most Recent
                <ChevronDown size={14} />
              </button>
            </div>
            {interactionComments.map((item) => (
              <article key={`${item.author}-${item.time}`}>
                <img src={item.avatar} alt={item.author} />
                <div>
                  <header>
                    <strong>{item.author}</strong>
                    <span>{item.time}</span>
                  </header>
                  <p>{item.text}</p>
                  <button type="button">Reply</button>
                </div>
                <button type="button" aria-label={`Like ${item.author} comment`}>
                  <Heart size={18} />
                  <span>{item.likes}</span>
                </button>
              </article>
            ))}
            <button type="button" className="social-post-detail-view-all">
              View all comments
              <ChevronDown size={14} />
            </button>
          </section>

          <div className="social-post-detail-input">
            <img src={avatar} alt="Derya Yilmaz" />
            <label>
              <input
                type="text"
                value={comment}
                placeholder="Write a comment..."
                onChange={(event) => setComment(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSubmit();
                }}
              />
              <button type="button" aria-label="Add emoji">
                <Smile size={17} />
              </button>
              <button type="button" aria-label="Attach image">
                <ImageIcon size={17} />
              </button>
              <button type="button" aria-label="Send comment" onClick={handleSubmit}>
                <Send size={17} />
              </button>
            </label>
          </div>
        </aside>
      </section>
    </div>
  );
}

function SocialPanel({ title, action, children, onAction }: { title: string; action: string; children: ReactNode; onAction: () => void }) {
  return (
    <section>
      <header>
        <h2>{title}</h2>
        {action ? <button type="button" onClick={onAction}>{action}</button> : null}
      </header>
      {children}
    </section>
  );
}

function SocialFlowModal({
  modal,
  audience,
  composerText,
  onClose,
  onCreate,
  onApply,
  onSaveDraft,
}: {
  modal: Exclude<SocialModal, null>;
  audience: string;
  composerText: string;
  onClose: () => void;
  onCreate: () => void;
  onApply: (modal: Exclude<SocialModal, null>) => void;
  onSaveDraft: () => void;
}) {
  const copy = modalCopy[modal];
  const isCreate = modal === "create";
  const isRichComposer = modal === "media" || modal === "video" || modal === "location" || modal === "poll";

  return (
    <div className="social-flow-backdrop" role="dialog" aria-modal="true" aria-labelledby="social-flow-title">
      <section className={isRichComposer ? `social-flow-modal social-flow-modal--${modal}` : "social-flow-modal"}>
        <header>
          <div className="social-flow-heading-icon">
            {modal === "media" ? <ImageIcon size={28} /> : null}
            {modal === "video" ? <Video size={28} /> : null}
            {modal === "location" ? <MapPin size={28} /> : null}
            {modal === "poll" ? <BarChart3 size={28} /> : null}
            {!isRichComposer && modal === "achievement" ? <Award size={28} /> : null}
            {!isRichComposer && modal === "notifications" ? <Bell size={28} /> : null}
            {!isRichComposer && modal === "comments" ? <MessageCircle size={28} /> : null}
            {!isRichComposer && modal === "share" ? <Share2 size={28} /> : null}
            {!isRichComposer && modal === "friends" ? <Users size={28} /> : null}
            {!isRichComposer && modal === "topics" ? <Search size={28} /> : null}
            {!isRichComposer && modal === "members" ? <Trophy size={28} /> : null}
            {!isRichComposer && modal === "events" ? <CalendarDays size={28} /> : null}
            {!isRichComposer && modal === "create" ? <Plus size={28} /> : null}
          </div>
          <div>
            <h2 id="social-flow-title">{copy.title}</h2>
            <p>{copy.description}</p>
          </div>
          <button type="button" aria-label="Close modal" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        {modal === "media" ? <PhotoShareModalContent /> : null}
        {modal === "video" ? <VideoShareModalContent /> : null}
        {modal === "location" ? <LocationShareModalContent /> : null}
        {modal === "poll" ? <PollShareModalContent /> : null}

        {!isRichComposer ? (
          <>
            <div className="social-flow-preview">
              <div className="social-flow-icon">
                {modal === "achievement" ? <Award size={28} /> : null}
                {modal === "notifications" ? <Bell size={28} /> : null}
                {modal === "comments" ? <MessageCircle size={28} /> : null}
                {modal === "share" ? <Share2 size={28} /> : null}
                {modal === "friends" ? <Users size={28} /> : null}
                {modal === "topics" ? <Search size={28} /> : null}
                {modal === "members" ? <Trophy size={28} /> : null}
                {modal === "events" ? <CalendarDays size={28} /> : null}
                {modal === "create" ? <Plus size={28} /> : null}
              </div>
              <div>
                <strong>{isCreate ? "Paylasim taslagi" : "Akis durumu"}</strong>
                <span>{isCreate ? composerText || "Henuz metin girilmedi." : "Hazir, onay verdiginizde akisa uygulanacak."}</span>
              </div>
            </div>

            <div className="social-flow-grid">
              <article>
                <span>Hedef Kitle</span>
                <strong>{audience}</strong>
              </article>
              <article>
                <span>Durum</span>
                <strong>{isCreate ? "Yayinlanabilir" : "Hazir"}</strong>
              </article>
            </div>
          </>
        ) : null}

        <footer>
          {isRichComposer ? (
            <button type="button" className="social-save-draft" onClick={onSaveDraft}>
              <Bookmark size={18} />
              Save as draft
            </button>
          ) : null}
          <div className="social-flow-footer-actions">
            <button type="button" onClick={onClose}>{isRichComposer ? "Cancel" : "Vazgec"}</button>
            <button type="button" onClick={isCreate ? onCreate : () => onApply(modal)}>
              {modal === "media" ? <><Upload size={18} /> Share Post</> : null}
              {modal === "video" ? <><Upload size={18} /> Share Video</> : null}
              {modal === "location" ? <><Navigation size={18} /> Share Location</> : null}
              {modal === "poll" ? <><BarChart3 size={18} /> Publish Poll</> : null}
              {!isRichComposer ? (isCreate ? "Paylas" : "Akisi Uygula") : null}
            </button>
          </div>
        </footer>

        {modal === "media" || modal === "video" ? (
          <div className="social-guidelines">
            <ShieldCheck size={16} />
            <strong>Community Guidelines</strong>
            <span>Be respectful and follow our community rules.</span>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function AudiencePills({ stacked = false }: { stacked?: boolean }) {
  const [selectedAudience, setSelectedAudience] = useState("Everyone");
  const options = [
    { label: "Everyone", detail: "Anyone on AquaScope", icon: Globe2 },
    { label: "Friends", detail: "Only your friends", icon: Users },
    { label: "Only me", detail: "Only you (private)", icon: Lock },
  ];

  return (
    <div className={stacked ? "social-audience-list" : "social-audience-pills"}>
      {options.map(({ label, detail, icon: Icon }) => (
        <button className={selectedAudience === label ? "is-selected" : ""} type="button" key={label} onClick={() => setSelectedAudience(label)}>
          <Icon size={18} />
          <span>
            <strong>{label}</strong>
            {stacked ? <small>{detail}</small> : null}
          </span>
        </button>
      ))}
    </div>
  );
}

function TagChips({ items = ["Big Catch", "Sea Bass", "Aegean Sea"] }: { items?: string[] }) {
  const [chips, setChips] = useState(items);

  return (
    <div className="social-modal-chip-row">
      {chips.map((item) => (
        <span key={item}>
          {item}
          <button type="button" aria-label={`Remove ${item}`} onClick={() => setChips((current) => current.filter((chip) => chip !== item))}>
            <X size={14} />
          </button>
        </span>
      ))}
      <ChevronDown size={17} />
    </div>
  );
}

function MiniAegeanMap({ large = false }: { large?: boolean }) {
  return (
    <div className={large ? "social-mini-map social-mini-map--large" : "social-mini-map"}>
      <span className="map-label map-label--greece">GREECE</span>
      <span className="map-label map-label--turkey">TURKIYE</span>
      <span className="map-label map-label--sea">Aegean Sea</span>
      <span className="map-label map-label--athens">Athens</span>
      <span className="map-label map-label--izmir">Izmir</span>
      <i className="map-pin-pulse" />
      {large ? (
        <>
          <div className="map-search">
            <Search size={20} />
            Search location...
          </div>
          <div className="map-zoom">
            <button type="button"><SlidersHorizontal size={18} /></button>
            <button type="button"><Plus size={20} /></button>
            <button type="button">-</button>
          </div>
          <div className="map-selected-card">
            <MapPin size={20} />
            <small>Selected location</small>
            <strong>North Aegean Region</strong>
            <span>39.2326Â° N, 26.4412Â° E</span>
            <button type="button">Edit</button>
          </div>
          <b>50 km</b>
        </>
      ) : null}
    </div>
  );
}

function CaptionBox({ placeholder = "Write a caption...", max = 500 }: { placeholder?: string; max?: number }) {
  const [value, setValue] = useState("");

  return (
    <label className="social-caption-box">
      <textarea placeholder={placeholder} value={value} maxLength={max} onChange={(event) => setValue(event.target.value)} />
      <span>{value.length} / {max}</span>
      <Smile size={18} />
    </label>
  );
}

function PhotoShareModalContent() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const recent = [
    "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=360&q=80",
    "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?auto=format&fit=crop&w=360&q=80",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=360&q=80",
    "https://images.unsplash.com/photo-1516685018646-5499d0a7d42f?auto=format&fit=crop&w=360&q=80",
  ];

  return (
    <div className="social-rich-modal-grid">
      <section className="social-upload-panel">
        <div className="social-dropzone">
          <div className="social-upload-art">
            <ImageIcon size={62} />
            <Upload size={24} />
          </div>
          <h3>Drag & drop your photo or video</h3>
          <p>or <button type="button" onClick={() => fileInputRef.current?.click()}>browse your files</button></p>
          <small>JPG, PNG, MP4, MOV up to 200MB</small>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,video/mp4,video/quicktime"
            hidden
            onChange={(event) => setSelectedFile(event.target.files?.[0]?.name ?? null)}
          />
        </div>
        {selectedFile ? <p className="social-selected-file"><CheckIcon /> {selectedFile}</p> : null}
        <div className="social-recent-upload-head">
          <strong>Recent uploads</strong>
          <button type="button">View all</button>
        </div>
        <div className="social-recent-uploads">
          {recent.map((src) => (
            <figure key={src}>
              <img src={src} alt="Recent upload" />
              <button type="button"><X size={15} /></button>
            </figure>
          ))}
        </div>
        <p className="social-upload-note"><Info size={16} /> You can add up to 5 photos or 1 video per post.</p>
      </section>

      <section className="social-modal-side">
        <CaptionBox />
        <div className="social-modal-card">
          <strong><Globe2 size={18} /> Who can see this?</strong>
          <AudiencePills />
        </div>
        <div className="social-modal-card">
          <strong><Tag size={18} /> Add tags</strong>
          <TagChips />
        </div>
        <div className="social-modal-card">
          <strong><MapPin size={18} /> Location (optional)</strong>
          <div className="social-location-input">North Aegean Region <X size={17} /></div>
          <MiniAegeanMap />
        </div>
      </section>
    </div>
  );
}

function VideoShareModalContent() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState("deep_sea_fishing.mp4");
  const thumbs = [
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=360&q=80",
    "https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?auto=format&fit=crop&w=360&q=80",
    "https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=360&q=80",
    "https://images.unsplash.com/photo-1544552866-d3ed42536cfd?auto=format&fit=crop&w=360&q=80",
  ];

  return (
    <div className="social-rich-modal-grid">
      <section className="social-upload-panel">
        <div className="social-dropzone social-dropzone--video">
          <div className="social-upload-art">
            <Film size={66} />
            <Upload size={24} />
          </div>
          <h3>Drag & drop your video here</h3>
          <p>or <button type="button" onClick={() => fileInputRef.current?.click()}>browse files</button></p>
          <small>MP4, MOV, WebM up to 500MB Â· Max 2 minutes</small>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            hidden
            onChange={(event) => setSelectedFile(event.target.files?.[0]?.name ?? "deep_sea_fishing.mp4")}
          />
        </div>
        <article className="social-video-file">
          <figure>
            <img src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=420&q=80" alt="Video preview" />
            <Video size={28} />
          </figure>
          <div>
            <strong>{selectedFile}</strong>
            <span>128 MB Â· 01:24</span>
            <i><b /></i>
          </div>
          <em>100%</em>
          <CheckIcon />
          <button type="button"><X size={20} /></button>
        </article>
        <section className="social-video-thumbs">
          <header>
            <div>
              <strong>Video thumbnail</strong>
              <Info size={16} />
              <small>Select a cover image for your video.</small>
            </div>
            <button type="button">Auto select</button>
          </header>
          <div>
            {thumbs.map((src, index) => (
              <figure className={index === 0 ? "is-selected" : ""} key={src}>
                <img src={src} alt="Video thumbnail" />
                {index === 0 ? <span><CheckIcon /></span> : null}
              </figure>
            ))}
          </div>
        </section>
      </section>

      <section className="social-modal-side">
        <CaptionBox />
        <div className="social-modal-card">
          <strong><Globe2 size={18} /> Who can see this?</strong>
          <AudiencePills />
        </div>
        <div className="social-modal-card">
          <strong><Tag size={18} /> Add tags</strong>
          <TagChips items={["Big Catch", "Offshore", "Aegean Sea"]} />
        </div>
        <div className="social-modal-card">
          <strong><MapPin size={18} /> Location (optional)</strong>
          <div className="social-location-input">North Aegean Region <X size={17} /></div>
          <MiniAegeanMap />
        </div>
        <div className="social-modal-card social-video-options">
          <strong><SlidersHorizontal size={18} /> Video options</strong>
          <label><input type="checkbox" defaultChecked /> Allow people to comment</label>
          <label><input type="checkbox" defaultChecked /> Show video in feed</label>
          <button type="button">HD (720p) <ChevronDown size={16} /></button>
        </div>
      </section>
    </div>
  );
}

function LocationShareModalContent() {
  const locationName = "North Aegean Region";
  const [duration, setDuration] = useState("1 Hour");

  return (
    <div className="social-location-layout">
      <section className="social-location-map-panel">
        <MiniAegeanMap large />
      </section>
      <section className="social-location-settings">
        <div className="social-modal-card">
          <strong><Globe2 size={18} /> Who can see this?</strong>
          <AudiencePills stacked />
        </div>
        <div className="social-modal-card">
          <strong><Clock3 size={18} /> Share for</strong>
          <button type="button" className="social-select-row" onClick={() => setDuration((current) => (current === "1 Hour" ? "24 Hours" : "1 Hour"))}>
            <CalendarDays size={18} /> {duration} <ChevronDown size={17} />
          </button>
          <p>Automatically stops sharing after {duration.toLowerCase()}.</p>
        </div>
        <div className="social-modal-card">
          <strong><MessageCircle size={18} /> Add a message (optional)</strong>
          <CaptionBox placeholder="Great fishing spot today!" max={200} />
        </div>
        <div className="social-location-alert">
          <ShieldCheck size={22} />
          <strong>Your location will be shared in real time.</strong>
          <span>You can stop sharing anytime from your profile.</span>
        </div>
      </section>
      <div className="social-location-ready">
        <span />
        <strong>Location ready</strong>
        <small>{locationName} Â· Accuracy: 25 m</small>
      </div>
    </div>
  );
}

function PollShareModalContent() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["Option 1", "Option 2", "Option 3"]);
  const [allowMultiple, setAllowMultiple] = useState(true);

  return (
    <div className="social-poll-layout">
      <section className="social-poll-builder">
        <div className="social-poll-question">
          <strong>Your question</strong>
          <label className="social-caption-box">
            <textarea placeholder="Write your question..." value={question} maxLength={200} onChange={(event) => setQuestion(event.target.value)} />
            <span>{question.length} / 200</span>
            <Smile size={18} />
          </label>
        </div>
        <div className="social-poll-options">
          <strong>Options</strong>
          {options.map((option, index) => (
            <div className="social-poll-option" key={`${index}-${option}`}>
              <GripVertical size={18} />
              <span>{index + 1}</span>
              <input value={option} onChange={(event) => setOptions((current) => current.map((item, optionIndex) => (optionIndex === index ? event.target.value : item)))} />
              <button type="button" aria-label={`Remove option ${index + 1}`} onClick={() => setOptions((current) => current.length > 2 ? current.filter((_, optionIndex) => optionIndex !== index) : current)}>
                <X size={19} />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setOptions((current) => [...current, `Option ${current.length + 1}`])}><Plus size={19} /> Add option</button>
        </div>
        <label className="social-toggle-row">
          <input type="checkbox" checked={allowMultiple} onChange={(event) => setAllowMultiple(event.target.checked)} />
          <span>
            <strong>Allow multiple answers</strong>
            <small>Users can select more than one option.</small>
          </span>
          <Info size={17} />
        </label>
        <div className="social-poll-media">
          <strong>Add media <span>(optional)</span></strong>
          <div>
            <button type="button"><ImageIcon size={30} /> Photo</button>
            <button type="button"><Video size={30} /> Video</button>
            <button type="button">GIF</button>
          </div>
        </div>
      </section>

      <section className="social-poll-side">
        <div className="social-modal-card">
          <strong>Audience</strong>
          <AudiencePills />
        </div>
        <div className="social-modal-card social-poll-settings">
          <strong>Poll settings</strong>
          <div className="social-select-row"><Clock3 size={18} /> Poll duration <span>24 hours</span><ChevronDown size={17} /></div>
          <div className="social-select-row"><Lock size={18} /> Who can see results <span>After voting</span><ChevronDown size={17} /></div>
          <label><input type="checkbox" defaultChecked /> <span><strong>Show vote counts</strong><small>Display number of votes for each option.</small></span></label>
        </div>
        <div className="social-poll-preview">
          <strong>Live preview</strong>
          <article>
            <header>
              <span><BarChart3 size={20} /></span>
              <div><strong>AquaScope</strong><small>Just now Â· Everyone</small></div>
            </header>
            <p>{question || "Your poll question will appear here..."}</p>
            {options.map((option) => (
              <label key={option}><input type="radio" name="poll-preview" /> {option}</label>
            ))}
            <footer><span>Like 0</span><span>Comment 0</span><span>Share 0</span></footer>
          </article>
        </div>
      </section>
    </div>
  );
}

function CheckIcon() {
  return <span className="social-check-icon">âœ“</span>;
}

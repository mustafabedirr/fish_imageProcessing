"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Award,
  Bell,
  Bookmark,
  CalendarDays,
  ChevronDown,
  Heart,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  Share2,
  SlidersHorizontal,
  Smile,
  Trophy,
  Users,
  Video,
  X,
} from "lucide-react";

const avatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80";

const feedPosts = [
  {
    id: "james-rainbow-trout",
    author: "James Mitchell",
    handle: "@jamesfishes",
    time: "7 minutes ago",
    avatar,
    text: "Finally caught my first rainbow trout today! What an exhilarating experience! Do you have any tips for where else I can find them?",
    tags: ["#RainbowTrout", "#Fishing", "#ProudCatch"],
    likes: 37,
    comments: 12,
    photos: [
      "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=520&q=85",
      "https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=520&q=85",
    ],
  },
  {
    id: "lily-bass",
    author: "Lily Edmonds",
    handle: "@lilyfishes",
    time: "2 hours ago",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80",
    text: "Happy to land this nice largemouth bass today on a local lake.",
    tags: ["#BassFishing", "#FishingLife"],
    likes: 54,
    comments: 5,
    photos: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=85"],
  },
  {
    id: "michael-tuna",
    author: "Michael Thompson",
    handle: "@michael_t",
    time: "4 hours ago",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=96&q=80",
    text: "Perfect day for some deep sea fishing! Caught this amazing tuna.",
    tags: ["#DeepSea", "#Tuna"],
    likes: 29,
    comments: 8,
    photos: ["https://images.unsplash.com/photo-1560275619-4662e36fa65c?auto=format&fit=crop&w=1200&q=85"],
  },
  {
    id: "sophia-morning-catch",
    author: "Sophia Martinez",
    handle: "@sophiacatches",
    time: "6 hours ago",
    avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=96&q=80",
    text: "Early morning session paid off. Clear water, calm wind and a healthy catch before sunrise.",
    tags: ["#MorningCatch", "#LakeLife"],
    likes: 42,
    comments: 10,
    photos: ["https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=85"],
  },
];

const suggestedFriends = [
  ["Kevin Hart", "12 mutual friends", avatar],
  ["Sarah Johnson", "8 mutual friends", "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=96&q=80"],
  ["Alex Rodriguez", "15 mutual friends", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&q=80"],
  ["Emma Davis", "6 mutual friends", "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=96&q=80"],
];

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

const feedTabs = ["For You", "Following", "Popular", "Groups", "New Posts"] as const;
type FeedTab = (typeof feedTabs)[number];
const feedTabLabels: Record<FeedTab, string> = {
  "For You": "For You",
  Following: "Following",
  Popular: "Popular",
  Groups: "Groups",
  "New Posts": "New Posts",
};
type SocialModal = "create" | "media" | "location" | "poll" | "achievement" | "notifications" | "comments" | "share" | "friends" | "topics" | "members" | "events" | null;

const modalCopy: Record<Exclude<SocialModal, null>, { title: string; eyebrow: string; description: string }> = {
  create: {
    eyebrow: "Yeni Paylasim",
    title: "Toplulukla yeni bir av deneyimi paylas",
    description: "Metin, gorsel, konum ve hedef kitle bilgilerini tek akista duzenleyebilirsiniz.",
  },
  media: {
    eyebrow: "Medya Akisi",
    title: "Fotograf veya video ekle",
    description: "Av gorsellerinizi yukleyin, kapak gorselini secin ve paylasima hazir hale getirin.",
  },
  location: {
    eyebrow: "Konum",
    title: "Av bolgesini paylasima ekle",
    description: "Gonderiye bolge etiketi ekleyerek diger kullanicilarin gozlem alanini takip etmesini saglayin.",
  },
  poll: {
    eyebrow: "Anket",
    title: "Topluluga hizli bir soru sor",
    description: "Secenekler ekleyerek ekipman, tur veya bolge hakkinda geri bildirim toplayin.",
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

    return searched;
  }, [activeTab, posts, searchQuery]);

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
        text,
        tags,
        likes: 0,
        comments: 0,
        photos: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=85"],
      },
      ...current,
    ]);
    setComposerText("");
    setActiveTab("New Posts");
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

  return (
    <section className="social-area-page">
      <div className="social-area-content social-area-content--mockup">
        <main className="social-feed-panel">
          <header className="social-area-title">
            <div>
              <h1>Social Area</h1>
              <p>Connect with anglers, share your catches and fishing experiences.</p>
            </div>

            <div className="social-top-actions">
              <label className="social-search">
                <Search size={18} />
                <input
                  type="search"
                  placeholder="Search posts, people, groups..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                <span>Ctrl K</span>
              </label>
              <button type="button" className="social-bell" aria-label="Notifications" onClick={() => openModal("notifications")}>
                <Bell size={18} />
                <b>3</b>
              </button>
              <button type="button" className="social-create" onClick={() => openModal("create")}>
                <Plus size={18} />
                Create Post
                <ChevronDown size={16} />
              </button>
            </div>
          </header>

          <nav className="social-tabs" aria-label="Social feed tabs">
            {feedTabs.map((tab) => (
              <button type="button" className={activeTab === tab ? "is-active" : ""} onClick={() => setActiveTab(tab)} key={tab}>
                {feedTabLabels[tab]}
              </button>
            ))}
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
          </nav>

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
                    <button type="button" aria-label="Add video" title="Video" onClick={() => openModal("media")}>
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
                  </button>
                </div>
              </div>
            </div>
          </section>

          <div className="social-post-stack">
            {visiblePosts.length ? visiblePosts.map((post) => (
              <article className="social-post-card" key={post.id}>
                <header>
                  <img src={post.avatar} alt={post.author} />
                  <div>
                    <strong>{post.author}</strong>
                    <span>{post.handle}</span>
                    <small>{post.time}</small>
                  </div>
                  <button
                    className={bookmarkedPosts[post.id] ? "social-bookmark is-active" : "social-bookmark"}
                    type="button"
                    aria-label="Bookmark post"
                    onClick={() => setBookmarkedPosts((current) => ({ ...current, [post.id]: !current[post.id] }))}
                  >
                    <Bookmark size={18} />
                  </button>
                </header>

                <p>{post.text}</p>
                <div className="social-post-tags">
                  {post.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>

                <div className={post.photos.length > 1 ? "social-post-photos social-post-photos--grid" : "social-post-photos"}>
                  {post.photos.slice(0, 2).map((photo, index) => (
                    <figure key={photo}>
                      <img src={photo} alt={`${post.author} catch ${index + 1}`} />
                      {index === 1 && post.photos.length > 2 ? <figcaption>+{post.photos.length - 1}</figcaption> : null}
                    </figure>
                  ))}
                </div>

                <footer>
                  <button
                    className={likedPosts[post.id] ? "social-post-action is-active" : "social-post-action"}
                    type="button"
                    aria-pressed={Boolean(likedPosts[post.id])}
                    onClick={() => setLikedPosts((current) => ({ ...current, [post.id]: !current[post.id] }))}
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
                    onClick={() => openModal("comments", post.id)}
                  >
                    <MessageCircle size={18} />
                    {commentCounts[post.id] ?? post.comments} Comments
                  </button>
                  <button
                    className={sharedPosts[post.id] ? "social-post-action is-active" : "social-post-action"}
                    type="button"
                    onClick={() => openModal("share", post.id)}
                  >
                    <Share2 size={18} />
                    {sharedPosts[post.id] ? "Paylasildi" : "Paylas"}
                  </button>
                </footer>
              </article>
            )) : <div className="social-empty-state">Aramanizla eslesen paylasim bulunamadi.</div>}
          </div>
        </main>

        <aside className="social-interactions-panel">
          <SocialPanel title="Suggested Friends" action="View All" onAction={() => openModal("friends")}>
            <div className="social-friend-list">
              {suggestedFriends.filter(([name]) => !hiddenFriends[name]).map(([name, detail, image]) => (
                <article key={name}>
                  <img src={image} alt={name} />
                  <div>
                    <strong>{name}</strong>
                    <span>{detail}</span>
                  </div>
                  <button type="button" className={addedFriends[name] ? "is-added" : ""} onClick={() => setAddedFriends((current) => ({ ...current, [name]: !current[name] }))}>
                    {addedFriends[name] ? "Added" : "Add"}
                  </button>
                  <button type="button" className="social-dismiss" aria-label={`Dismiss ${name}`} onClick={() => setHiddenFriends((current) => ({ ...current, [name]: true }))}>
                    <X size={16} />
                  </button>
                </article>
              ))}
            </div>
          </SocialPanel>

          <SocialPanel title="Trending Topics" action="View All" onAction={() => openModal("topics")}>
            <div className="topic-list">
              {topics.map(([topic, count]) => (
                <article key={topic} onClick={() => setSearchQuery(topic.replace(" ", ""))}>
                  <span>{topic}</span>
                  <small>{count}</small>
                </article>
              ))}
            </div>
          </SocialPanel>

          <SocialPanel title="Top Members" action="This Week" onAction={() => openModal("members")}>
            <div className="social-member-list">
              {members.map(([name, points, image], index) => (
                <article key={name}>
                  <b>{index + 1}</b>
                  <img src={image} alt={name} />
                  <strong>{name}</strong>
                  <span>{points}</span>
                </article>
              ))}
            </div>
          </SocialPanel>

          <SocialPanel title="Upcoming Events" action="View All" onAction={() => openModal("events")}>
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
              <button type="button" className={joinedEvent ? "is-joined" : ""} onClick={() => setJoinedEvent((joined) => !joined)}>
                {joinedEvent ? "Joined" : "Join Event"}
              </button>
            </div>
          </SocialPanel>
        </aside>
      </div>

      {activeModal ? (
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
        />
      ) : null}
    </section>
  );
}

function SocialPanel({ title, action, children, onAction }: { title: string; action: string; children: ReactNode; onAction: () => void }) {
  return (
    <section>
      <header>
        <h2>{title}</h2>
        <button type="button" onClick={onAction}>{action}</button>
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
}: {
  modal: Exclude<SocialModal, null>;
  audience: string;
  composerText: string;
  onClose: () => void;
  onCreate: () => void;
  onApply: (modal: Exclude<SocialModal, null>) => void;
}) {
  const copy = modalCopy[modal];
  const isCreate = modal === "create";

  return (
    <div className="social-flow-backdrop" role="dialog" aria-modal="true" aria-labelledby="social-flow-title">
      <section className="social-flow-modal">
        <header>
          <div>
            <span>{copy.eyebrow}</span>
            <h2 id="social-flow-title">{copy.title}</h2>
            <p>{copy.description}</p>
          </div>
          <button type="button" aria-label="Close modal" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        <div className="social-flow-preview">
          <div className="social-flow-icon">
            {modal === "media" ? <ImageIcon size={28} /> : null}
            {modal === "location" ? <MapPin size={28} /> : null}
            {modal === "poll" ? <SlidersHorizontal size={28} /> : null}
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

        <footer>
          <button type="button" onClick={onClose}>Vazgec</button>
          <button type="button" onClick={isCreate ? onCreate : () => onApply(modal)}>{isCreate ? "Paylas" : "Akisi Uygula"}</button>
        </footer>
      </section>
    </div>
  );
}

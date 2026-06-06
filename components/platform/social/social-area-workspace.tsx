"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Bell,
  Bookmark,
  ChevronDown,
  Heart,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Share2,
  SlidersHorizontal,
  Trophy,
  Users,
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
];

const suggestedFriends = [
  ["Kevin Hart", "8 mutual friends", avatar],
  ["Sarah Johnson", "12 mutual friends", "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=96&q=80"],
  ["Alex Rodriguez", "6 mutual friends", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&q=80"],
  ["Emma Davis", "9 mutual friends", "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=96&q=80"],
];

const topics = [
  ["# BassFishing", "1.2k posts"],
  ["# TroutFishing", "907 posts"],
  ["# FishingTips", "747 posts"],
  ["# TackleBox", "671 posts"],
  ["# CatchandRelease", "654 posts"],
];

const members = [
  ["John Fisher", "2.4k pts", avatar],
  ["Lily Edmonds", "1.8k pts", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80"],
  ["Michael Thompson", "1.5k pts", "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=96&q=80"],
  ["James Mitchell", "1.2k pts", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80"],
  ["Sophia Martinez", "980 pts", "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=96&q=80"],
];

const feedTabs = ["For You", "Following", "Popular", "Recent"] as const;
type FeedTab = (typeof feedTabs)[number];

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
    setActiveTab("Recent");
    setNotice(`${audience} icin yeni paylasim yayinlandi.`);
  };

  const toggleAudience = () => {
    setAudience((current) => (current === "Everyone" ? "Followers" : "Everyone"));
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
              <button type="button" className="social-bell" aria-label="Notifications" onClick={() => setNotice("Yeni bildiriminiz yok.")}>
                <Bell size={18} />
                <b>3</b>
              </button>
              <button type="button" className="social-create" onClick={createPost}>
                <Plus size={18} />
                Create Post
                <ChevronDown size={16} />
              </button>
            </div>
          </header>

          <section className="social-composer">
            <div className="social-composer-row">
              <img src={avatar} alt="Derya Yilmaz" />
              <input
                placeholder="Share your latest catch or fishing adventure..."
                aria-label="Share a post"
                value={composerText}
                onChange={(event) => setComposerText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") createPost();
                }}
              />
            </div>
            <div className="social-composer-tools">
              <button type="button" onClick={() => setNotice("Fotograf yukleme akisi hazirlandi.")}>
                <ImageIcon size={16} />
                Photo / Video
              </button>
              <button type="button" onClick={() => setComposerText((current) => `${current}${current ? " " : ""}Lake Washington`)}>
                <MapPin size={16} />
                Location
              </button>
              <button type="button" onClick={() => setNotice("Anket taslagi olusturuldu.")}>
                <SlidersHorizontal size={16} />
                Poll
              </button>
              <button type="button" onClick={() => setComposerText((current) => `${current}${current ? " " : ""}#Achievement`)}>
                <Trophy size={16} />
                Achievement
              </button>
              <span />
              <button type="button" className="social-audience" onClick={toggleAudience}>
                <Users size={16} />
                {audience}
                <ChevronDown size={15} />
              </button>
              <button type="button" className="social-post-button" onClick={createPost}>
                Post
              </button>
            </div>
            <p className="social-status-line">{notice}</p>
          </section>

          <nav className="social-tabs" aria-label="Social feed tabs">
            {feedTabs.map((tab) => (
              <button type="button" className={activeTab === tab ? "is-active" : ""} onClick={() => setActiveTab(tab)} key={tab}>
                {tab}
              </button>
            ))}
            <button type="button" className={filtersOpen ? "social-filter is-open" : "social-filter"} onClick={() => setFiltersOpen((open) => !open)}>
              <SlidersHorizontal size={15} />
              Filters
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
                  <MoreHorizontal size={19} />
                </header>

                <p>{post.text}</p>
                <div className="social-post-tags">
                  {post.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>

                <div className={post.photos.length > 1 ? "social-post-photos social-post-photos--grid" : "social-post-photos"}>
                  {post.photos.map((photo, index) => (
                    <figure key={photo}>
                      <img src={photo} alt={`${post.author} catch ${index + 1}`} />
                    </figure>
                  ))}
                </div>

                <footer>
                  <button
                    className={likedPosts[post.id] ? "social-post-action is-active" : "social-post-action"}
                    type="button"
                    onClick={() => setLikedPosts((current) => ({ ...current, [post.id]: !current[post.id] }))}
                  >
                    <Heart size={18} />
                    {post.likes + (likedPosts[post.id] ? 1 : 0)}
                  </button>
                  <button
                    className="social-post-action"
                    type="button"
                    onClick={() => setCommentCounts((current) => ({ ...current, [post.id]: (current[post.id] ?? post.comments) + 1 }))}
                  >
                    <MessageCircle size={18} />
                    {commentCounts[post.id] ?? post.comments}
                  </button>
                  <button
                    className={sharedPosts[post.id] ? "social-post-action is-active" : "social-post-action"}
                    type="button"
                    onClick={() => setSharedPosts((current) => ({ ...current, [post.id]: !current[post.id] }))}
                  >
                    <Share2 size={18} />
                    {sharedPosts[post.id] ? "Shared" : "Share"}
                  </button>
                  <button
                    className={bookmarkedPosts[post.id] ? "social-bookmark is-active" : "social-bookmark"}
                    type="button"
                    aria-label="Bookmark post"
                    onClick={() => setBookmarkedPosts((current) => ({ ...current, [post.id]: !current[post.id] }))}
                  >
                    <Bookmark size={18} />
                  </button>
                </footer>
              </article>
            )) : <div className="social-empty-state">Aramanizla eslesen paylasim bulunamadi.</div>}
          </div>
        </main>

        <aside className="social-interactions-panel">
          <SocialPanel title="Suggested Friends" action="View All" onAction={() => setNotice("Tum onerilen arkadaslar goruntuleniyor.")}>
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

          <SocialPanel title="Trending Topics" action="View All" onAction={() => setSearchQuery("#")}>
            <div className="topic-list">
              {topics.map(([topic, count]) => (
                <article key={topic} onClick={() => setSearchQuery(topic.replace(" ", ""))}>
                  <span>{topic}</span>
                  <small>{count}</small>
                </article>
              ))}
            </div>
          </SocialPanel>

          <SocialPanel title="Top Members" action="This Week" onAction={() => setNotice("Haftalik liderlik siralamasi acildi.")}>
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

          <SocialPanel title="Upcoming Events" action="View All" onAction={() => setNotice("Tum etkinlikler listeleniyor.")}>
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

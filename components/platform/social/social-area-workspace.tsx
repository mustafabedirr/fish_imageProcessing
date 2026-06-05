"use client";

import type { ReactNode } from "react";
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

export default function SocialAreaWorkspace() {
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
                <input type="search" placeholder="Search posts, people, groups..." />
                <span>Ctrl K</span>
              </label>
              <button type="button" className="social-bell" aria-label="Notifications">
                <Bell size={18} />
                <b>3</b>
              </button>
              <button type="button" className="social-create">
                <Plus size={18} />
                Create Post
                <ChevronDown size={16} />
              </button>
            </div>
          </header>

          <section className="social-composer">
            <div className="social-composer-row">
              <img src={avatar} alt="Derya Yilmaz" />
              <input placeholder="Share your latest catch or fishing adventure..." aria-label="Share a post" />
            </div>
            <div className="social-composer-tools">
              <button type="button">
                <ImageIcon size={16} />
                Photo / Video
              </button>
              <button type="button">
                <MapPin size={16} />
                Location
              </button>
              <button type="button">
                <SlidersHorizontal size={16} />
                Poll
              </button>
              <button type="button">
                <Trophy size={16} />
                Achievement
              </button>
              <span />
              <button type="button" className="social-audience">
                <Users size={16} />
                Everyone
                <ChevronDown size={15} />
              </button>
              <button type="button" className="social-post-button">
                Post
              </button>
            </div>
          </section>

          <nav className="social-tabs" aria-label="Social feed tabs">
            {["For You", "Following", "Popular", "Recent"].map((tab, index) => (
              <button type="button" className={index === 0 ? "is-active" : ""} key={tab}>
                {tab}
              </button>
            ))}
            <button type="button" className="social-filter">
              <SlidersHorizontal size={15} />
              Filters
              <ChevronDown size={15} />
            </button>
          </nav>

          <div className="social-post-stack">
            {feedPosts.map((post) => (
              <article className="social-post-card" key={post.author}>
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
                  <span>
                    <Heart size={18} />
                    {post.likes}
                  </span>
                  <span>
                    <MessageCircle size={18} />
                    {post.comments}
                  </span>
                  <span>
                    <Share2 size={18} />
                    Share
                  </span>
                  <Bookmark size={18} />
                </footer>
              </article>
            ))}
          </div>
        </main>

        <aside className="social-interactions-panel">
          <SocialPanel title="Suggested Friends" action="View All">
            <div className="social-friend-list">
              {suggestedFriends.map(([name, detail, image]) => (
                <article key={name}>
                  <img src={image} alt={name} />
                  <div>
                    <strong>{name}</strong>
                    <span>{detail}</span>
                  </div>
                  <button type="button">Add</button>
                  <X size={16} />
                </article>
              ))}
            </div>
          </SocialPanel>

          <SocialPanel title="Trending Topics" action="View All">
            <div className="topic-list">
              {topics.map(([topic, count]) => (
                <article key={topic}>
                  <span>{topic}</span>
                  <small>{count}</small>
                </article>
              ))}
            </div>
          </SocialPanel>

          <SocialPanel title="Top Members" action="This Week">
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

          <SocialPanel title="Upcoming Events" action="View All">
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
              <button type="button">Join Event</button>
            </div>
          </SocialPanel>
        </aside>
      </div>
    </section>
  );
}

function SocialPanel({ title, action, children }: { title: string; action: string; children: ReactNode }) {
  return (
    <section>
      <header>
        <h2>{title}</h2>
        <a href="/platform/social">{action}</a>
      </header>
      {children}
    </section>
  );
}

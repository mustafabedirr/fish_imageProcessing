"use client";

import type { UIEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { useInView } from "framer-motion";
import {
  Calendar,
  Camera,
  Check,
  Compass,
  Edit3,
  Fish,
  Heart,
  Image,
  Images,
  Info,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Mountain,
  Save,
  Share2,
  ShieldCheck,
  Star,
  Trophy,
  Waves,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import AnimatedTabBar from "../../ui/animated-tab-bar";

const avatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=180&q=80";

const badges = [
  ["Lunker Hunter", "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=140&q=80"],
  ["Super Angler", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=140&q=80"],
  ["Trophy Catch", "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=140&q=80"],
  ["Freshwater Pro", "https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=140&q=80"],
];

const following = [
  "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=90&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=90&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=90&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=90&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=90&q=80",
];

const achievements = [
  { icon: Fish, title: "Bass Pro", body: "25 Largemouth Bass caught" },
  { icon: Image, title: "New Record", body: "6.2 lb" },
  { icon: Trophy, title: "Master Angler", body: "19 challenges completed" },
];

const aboutItems = [
  { icon: Compass, label: "Home", value: "Seattle, Washington" },
  { icon: Trophy, label: "Favorite Technique", value: "Spinning" },
  { icon: Fish, label: "Target Species", value: "Bass, Trout, Salmon" },
  { icon: Camera, label: "Favorite Waters", value: "Lake Washington, Sammamish" },
];

const followingPeople = [
  { name: "James Mitchell", image: following[0] },
  { name: "Lily Edmonds", image: following[2] },
  { name: "Michael Thompson", image: following[1] },
  { name: "Sophia Martinez", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=90&q=80" },
  { name: "Daniel Anderson", image: following[4] },
];

const recentPhotos = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=320&q=80",
  "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=320&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=320&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=320&q=80",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=320&q=80",
  "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=320&q=80",
];

const posts = [
  {
    id: "catch-bass",
    text: "Last weekend's catch! Managed to reel in this 6.4 lb Largemouth Bass from Lake Sammamish.",
    time: "5 days ago",
    tags: ["#LargemouthBass", "#WeekendFishing"],
    image: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=1400&q=85",
    weight: "6.4 lb",
    likes: 64,
    comments: 17,
  },
  {
    id: "lake-washington",
    text: "Beautiful morning at Lake Washington.",
    time: "2 weeks ago",
    tags: [],
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85",
    likes: 48,
    comments: 12,
  },
];

const galleryColumns = [
  [
    {
      src: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=900&q=86",
      alt: "Largemouth bass on measuring board",
      ratio: 4 / 5,
      label: "Bass Catch",
    },
    {
      src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=86",
      alt: "Underwater reef and fish",
      ratio: 16 / 10,
      label: "Reef Dive",
    },
    {
      src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=86",
      alt: "Lake sunset from fishing boat",
      ratio: 3 / 4,
      label: "Lake Morning",
    },
  ],
  [
    {
      src: "https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=1000&q=86",
      alt: "Clear blue water surface",
      ratio: 16 / 9,
      label: "Blue Current",
    },
    {
      src: "https://images.unsplash.com/photo-1560275619-4662e36fa65c?auto=format&fit=crop&w=900&q=86",
      alt: "Fresh caught tuna",
      ratio: 4 / 5,
      label: "Deep Sea",
    },
    {
      src: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=900&q=86",
      alt: "Colorful aquarium fish",
      ratio: 1,
      label: "Species Study",
    },
  ],
  [
    {
      src: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=900&q=86",
      alt: "Angler holding catch near shore",
      ratio: 3 / 4,
      label: "Shore Catch",
    },
    {
      src: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?auto=format&fit=crop&w=1000&q=86",
      alt: "Fresh fish on ice",
      ratio: 16 / 10,
      label: "Fresh Record",
    },
    {
      src: "https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?auto=format&fit=crop&w=900&q=86",
      alt: "Underwater fish school",
      ratio: 4 / 5,
      label: "Fish School",
    },
  ],
];

const tabs = [
  { id: "posts", label: "Posts", icon: Image },
  { id: "achievements", label: "Achievements", icon: Star },
  { id: "photos", label: "Photos", icon: Images },
  { id: "trips", label: "Trips", icon: Mountain },
  { id: "gear", label: "Gear", icon: Camera },
  { id: "favorites", label: "Favorites", icon: Heart },
  { id: "about", label: "About", icon: Info },
] as const;

type ProfileTab = (typeof tabs)[number]["id"];

export default function UserProfileWorkspace() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [isProfileCollapsed, setIsProfileCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Alicia Vikander",
    handle: "@avikander",
    bio: "Passionate angler from Seattle, WA. Always on the lookout for the next big catch!",
  });
  const [draftProfile, setDraftProfile] = useState(profile);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [sharedPosts, setSharedPosts] = useState<Record<string, boolean>>({});

  const postStats = useMemo(
    () =>
      Object.fromEntries(
        posts.map((post) => [
          post.id,
          {
            likes: post.likes + (likedPosts[post.id] ? 1 : 0),
            shared: Boolean(sharedPosts[post.id]),
          },
        ])
      ),
    [likedPosts, sharedPosts]
  ) as Record<string, { likes: number; shared: boolean }>;

  const openEditProfile = () => {
    setDraftProfile(profile);
    setIsEditing(true);
  };

  const saveProfile = () => {
    setProfile({
      name: draftProfile.name.trim() || profile.name,
      handle: draftProfile.handle.trim().startsWith("@")
        ? draftProfile.handle.trim()
        : `@${draftProfile.handle.trim() || profile.handle.replace("@", "")}`,
      bio: draftProfile.bio.trim() || profile.bio,
    });
    setIsEditing(false);
  };

  const handleProfileScroll = (event: UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;

    if (scrollTop > 24 && !isProfileCollapsed) {
      setIsProfileCollapsed(true);
      return;
    }

    if (scrollTop <= 4 && isProfileCollapsed) {
      setIsProfileCollapsed(false);
    }
  };

  const selectTab = (tab: ProfileTab) => {
    setActiveTab(tab);
    setIsProfileCollapsed(false);
  };

  return (
    <section className="user-profile-page">
      <div className="user-profile-content user-profile-content--reference">
        <main className="user-profile-main">
          <section className={cn("profile-hero", isProfileCollapsed && "profile-hero--collapsed")}>
            <button type="button" className="profile-cover" aria-label="Kapak gorselini degistir" onClick={openEditProfile}>
              <span>
                <Camera size={16} />
                Kapak gorselini degistir
              </span>
            </button>
            <div className="profile-identity">
              <button type="button" className="profile-avatar-wrap" aria-label="Profil fotografini degistir" onClick={openEditProfile}>
                <img src={avatar} alt={profile.name} />
                <span className="profile-avatar-edit">
                  <Camera size={15} />
                  Degistir
                </span>
                <i>
                  <Check size={14} />
                </i>
              </button>
              <div className="profile-copy">
                <h1>
                  {profile.name}
                  <span className="profile-verified">
                    <Check size={14} />
                  </span>
                </h1>
                <p>{profile.handle}</p>
                <span>{profile.bio}</span>
                <div className="profile-meta-row">
                  <small>
                    <MapPin size={16} />
                    Seattle, WA
                  </small>
                  <small>
                    <Calendar size={16} />
                    Joined May 2021
                  </small>
                </div>
              </div>
            </div>

            <div className="profile-stats-row">
              <strong>
                452 <span>Followers</span>
              </strong>
              <strong>
                178 <span>Following</span>
              </strong>
              <strong>
                178 <span>Catches</span>
              </strong>
              <strong>
                24 <span>Trips</span>
              </strong>
              <div className="profile-hero-actions">
                <button type="button" onClick={openEditProfile}>
                  <Edit3 size={17} />
                  Edit Profile
                </button>
                <button type="button" aria-label="More profile actions">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>

            <AnimatedTabBar
              ariaLabel="Profile sections"
              activeButtonClassName="active"
              activeValue={activeTab}
              buttonClassName="profile-tab-button"
              className="profile-tabs"
              layoutId="profile-active-tab"
              onChange={selectTab}
              tabs={tabs.map(({ id, label, icon }) => ({ title: label, value: id, icon }))}
            />
          </section>

          <div className="profile-lower-grid">
            <div className="profile-primary-column">
              {activeTab === "posts" ? (
                <div className="profile-feed" onScroll={handleProfileScroll}>
                  {posts.map((post) => (
                    <article className="profile-post-card" key={post.text}>
                      <header>
                        <img src={avatar} alt={profile.name} />
                        <div>
                          <strong>{profile.name}</strong>
                          <span>{post.time}</span>
                          <small>Public</small>
                        </div>
                        <MoreHorizontal size={19} />
                      </header>

                      <p>{post.text}</p>

                      {post.tags.length > 0 ? (
                        <div className="profile-post-tags">
                          {post.tags.map((tag) => (
                            <span key={tag}>{tag}</span>
                          ))}
                        </div>
                      ) : null}

                      <figure className="profile-post-image">
                        <img src={post.image} alt="" />
                        {post.weight ? <figcaption>{post.weight}</figcaption> : null}
                      </figure>

                      <footer>
                        <div className="profile-reaction-stack" aria-hidden="true">
                          {following.slice(0, 3).map((image) => (
                            <img key={image} src={image} alt="" />
                          ))}
                        </div>
                        <button
                          className={likedPosts[post.id] ? "profile-action profile-action--active" : "profile-action"}
                          type="button"
                          onClick={() => setLikedPosts((current) => ({ ...current, [post.id]: !current[post.id] }))}
                        >
                          <Heart size={19} />
                          {postStats[post.id].likes}
                        </button>
                        <button className="profile-action" type="button">
                          <MessageCircle size={19} />
                          {post.comments} Comments
                        </button>
                        <button
                          className={postStats[post.id].shared ? "profile-action profile-action--active" : "profile-action"}
                          type="button"
                          onClick={() => setSharedPosts((current) => ({ ...current, [post.id]: !current[post.id] }))}
                        >
                          <Share2 size={18} />
                          {postStats[post.id].shared ? "Shared" : "Share"}
                        </button>
                      </footer>
                    </article>
                  ))}
                </div>
              ) : (
                <ProfileTabPanel activeTab={activeTab} onScroll={handleProfileScroll} />
              )}
            </div>

            <aside className="profile-insight-column">
              <section className="angler-level">
                <div>
                  <h2>Angler Level</h2>
                  <strong>12</strong>
                  <ShieldCheck size={17} />
                </div>
                <div className="level-arc">
                  <Waves size={28} />
                  <span>1540 / 1,800</span>
                  <small>XP</small>
                </div>
                <p>Keep going, you're making great progress!</p>
                <div className="profile-level-dots" aria-hidden="true">
                  <i />
                  <i className="active" />
                  <i />
                  <i />
                </div>
              </section>

              <section className="profile-achievements">
                <header>
                  <h2>Achievements</h2>
                  <a href="/platform/profile">View all</a>
                </header>
                {achievements.map(({ icon: Icon, title, body }) => (
                  <article key={title}>
                    <span>
                      <Icon size={19} />
                    </span>
                    <div>
                      <strong>{title}</strong>
                      <small>{body}</small>
                    </div>
                  </article>
                ))}
              </section>

              <section className="profile-badges">
                <header>
                  <h2>Badges</h2>
                  <a href="/platform/profile">View all</a>
                </header>
                <div>
                  {badges.map(([label, image]) => (
                    <figure key={label}>
                      <img src={image} alt={label} />
                      <figcaption>{label}</figcaption>
                    </figure>
                  ))}
                  <figure className="profile-more-badges">
                    <span>+12</span>
                    <figcaption>More</figcaption>
                  </figure>
                </div>
              </section>
            </aside>
          </div>
        </main>

        <aside className="profile-side-card">
          <section className="profile-about-card">
            <header>
              <h2>About Alicia</h2>
            </header>
            {aboutItems.map(({ icon: Icon, label, value }) => (
              <article key={label}>
                <span>
                  <Icon size={19} />
                </span>
                <div>
                  <strong>{label}</strong>
                  <small>{value}</small>
                </div>
              </article>
            ))}
            <button type="button">View Full Profile</button>
          </section>

          <section className="profile-following">
            <header>
              <h2>Following</h2>
              <a href="/platform/social">View all (178)</a>
            </header>
            <div className="profile-following-list">
              {followingPeople.map((person) => (
                <article key={person.name}>
                  <img src={person.image} alt={person.name} />
                  <strong>{person.name}</strong>
                  <button type="button">Following</button>
                </article>
              ))}
            </div>
          </section>

          <section className="profile-recent-photos">
            <header>
              <h2>Recent Photos</h2>
              <a href="/platform/profile">View all</a>
            </header>
            <div>
              {recentPhotos.map((image, index) => (
                <img key={image} src={image} alt={`Recent profile catch ${index + 1}`} />
              ))}
            </div>
          </section>
        </aside>
      </div>

      {isEditing ? (
        <div className="profile-modal-layer" role="dialog" aria-modal="true" aria-labelledby="profile-edit-title">
          <div className="profile-edit-modal">
            <header>
              <div>
                <h2 id="profile-edit-title">Edit Profile</h2>
                <p>Update the visible profile details.</p>
              </div>
              <button type="button" onClick={() => setIsEditing(false)} aria-label="Close edit profile">
                <MoreHorizontal size={20} />
              </button>
            </header>
            <label>
              Name
              <input value={draftProfile.name} onChange={(event) => setDraftProfile((current) => ({ ...current, name: event.target.value }))} />
            </label>
            <label>
              Handle
              <input value={draftProfile.handle} onChange={(event) => setDraftProfile((current) => ({ ...current, handle: event.target.value }))} />
            </label>
            <label>
              Bio
              <textarea value={draftProfile.bio} onChange={(event) => setDraftProfile((current) => ({ ...current, bio: event.target.value }))} />
            </label>
            <footer>
              <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
              <button type="button" onClick={saveProfile}>
                <Save size={17} />
                Save Changes
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ProfileTabPanel({ activeTab, onScroll }: { activeTab: ProfileTab; onScroll: (event: UIEvent<HTMLDivElement>) => void }) {
  if (activeTab === "achievements") {
    return (
      <div className="profile-tab-panel" onScroll={onScroll}>
        {achievements.map(({ icon: Icon, title, body }) => (
          <article key={title}>
            <span><Icon size={22} /></span>
            <div>
              <strong>{title}</strong>
              <p>{body}</p>
            </div>
          </article>
        ))}
      </div>
    );
  }

  if (activeTab === "photos") {
    return <ProfileImageGallery onScroll={onScroll} />;
  }

  if (activeTab === "trips") {
    return (
      <div className="profile-tab-panel" onScroll={onScroll}>
        {["Lake Washington sunrise route", "Sammamish bass run", "Puget Sound scouting day"].map((trip, index) => (
          <article key={trip}>
            <span><MapPin size={22} /></span>
            <div>
              <strong>{trip}</strong>
              <p>{index + 2} catch logs and water condition notes saved.</p>
            </div>
          </article>
        ))}
      </div>
    );
  }

  if (activeTab === "gear") {
    return (
      <div className="profile-tab-panel" onScroll={onScroll}>
        {["Medium spinning rod", "Clear water crankbait kit", "Compact sonar tracker"].map((gear) => (
          <article key={gear}>
            <span><Camera size={22} /></span>
            <div>
              <strong>{gear}</strong>
              <p>Preferred setup for clean freshwater sessions.</p>
            </div>
          </article>
        ))}
      </div>
    );
  }

  if (activeTab === "favorites" || activeTab === "about") {
    return (
      <div className="profile-tab-panel" onScroll={onScroll}>
        {aboutItems.map(({ icon: Icon, label, value }) => (
          <article key={label}>
            <span><Icon size={22} /></span>
            <div>
              <strong>{label}</strong>
              <p>{value}</p>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="profile-tab-panel" onScroll={onScroll}>
      {[
        "Keep your rod tip low when landing larger bass near cover.",
        "Track water temperature changes before choosing bait depth.",
        "Upload clear side-profile fish images for stronger AI measurements.",
      ].map((tip, index) => (
        <article key={tip}>
          <span>{index + 1}</span>
          <div>
            <strong>Pro Tip</strong>
            <p>{tip}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function ProfileImageGallery({ onScroll }: { onScroll: (event: UIEvent<HTMLDivElement>) => void }) {
  return (
    <div className="profile-gallery-shell" onScroll={onScroll}>
      <div className="profile-gallery-head">
        <div>
          <strong>Catch Gallery</strong>
          <p>Recent catches, field notes and underwater observations.</p>
        </div>
        <span>{galleryColumns.flat().length} photos</span>
      </div>

      <div className="profile-gallery-grid">
        {galleryColumns.map((column, columnIndex) => (
          <div className="profile-gallery-column" key={`gallery-column-${columnIndex}`}>
            {column.map((image, index) => (
              <AnimatedGalleryImage
                alt={image.alt}
                key={image.src}
                label={image.label}
                ratio={image.ratio}
                src={image.src}
                staggerIndex={columnIndex * 3 + index}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function AnimatedGalleryImage({
  alt,
  label,
  ratio,
  src,
  staggerIndex,
}: {
  alt: string;
  label: string;
  ratio: number;
  src: string;
  staggerIndex: number;
}) {
  const ref = useRef<HTMLFigureElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const [isLoading, setIsLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <figure
      className={cn("profile-gallery-item", isInView && !isLoading && "profile-gallery-item--visible")}
      ref={ref}
      style={{ aspectRatio: `${ratio}` }}
    >
      <img
        alt={alt}
        loading="lazy"
        onError={() => setImgSrc("https://placehold.co/900x1200/06182c/5bd6ff?text=AquaScope")}
        onLoad={() => setTimeout(() => setIsLoading(false), 90 + staggerIndex * 35)}
        src={imgSrc}
      />
      <figcaption>
        <span>{label}</span>
      </figcaption>
    </figure>
  );
}

"use client";

import type { CSSProperties, ChangeEvent, UIEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "framer-motion";
import {
  Camera,
  Check,
  Compass,
  Edit3,
  Fish,
  Heart,
  Image,
  Images,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Mountain,
  RotateCcw,
  Save,
  Share2,
  ShieldCheck,
  Star,
  Trophy,
  UploadCloud,
  Video,
  Waves,
  X,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { useCurrentUser } from "../../../hooks/use-current-user";
import AnimatedTabBar from "../../ui/animated-tab-bar";

const avatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=180&q=80";
type ProfileFeedPost = {
  id: string;
  userId?: string;
  body: string;
  tags?: string[];
  mediaUrls?: string[];
  likes: number;
  comments: number;
  createdAt: string;
  author: string;
  handle: string;
  avatar?: string;
  authorProfile?: {
    userId: string;
    name: string;
    handle: string;
    avatarUrl?: string;
  };
};

const defaultPostImage = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1400&q=85";

function formatProfilePostTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const diff = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

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

const galleryItems = [
  {
    id: "bass-catch",
    img: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=900&q=86",
    alt: "Largemouth bass on measuring board",
    label: "Bass Catch",
    height: 420,
  },
  {
    id: "reef-dive",
    img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=86",
    alt: "Underwater reef and fish",
    label: "Reef Dive",
    height: 300,
  },
  {
    id: "lake-morning",
    img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=86",
    alt: "Lake sunset from fishing boat",
    label: "Lake Morning",
    height: 520,
  },
  {
    id: "blue-current",
    img: "https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=1000&q=86",
    alt: "Clear blue water surface",
    label: "Blue Current",
    height: 280,
  },
  {
    id: "deep-sea",
    img: "https://images.unsplash.com/photo-1560275619-4662e36fa65c?auto=format&fit=crop&w=900&q=86",
    alt: "Fresh caught tuna",
    label: "Deep Sea",
    height: 455,
  },
  {
    id: "species-study",
    img: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=900&q=86",
    alt: "Colorful aquarium fish",
    label: "Species Study",
    height: 340,
  },
  {
    id: "shore-catch",
    img: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=900&q=86",
    alt: "Angler holding catch near shore",
    label: "Shore Catch",
    height: 500,
  },
  {
    id: "fresh-record",
    img: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?auto=format&fit=crop&w=1000&q=86",
    alt: "Fresh fish on ice",
    label: "Fresh Record",
    height: 315,
  },
  {
    id: "fish-school",
    img: "https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?auto=format&fit=crop&w=900&q=86",
    alt: "Underwater fish school",
    label: "Fish School",
    height: 470,
  },
  {
    id: "dock-light",
    img: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=86",
    alt: "Mountain lake at sunset",
    label: "Dock Light",
    height: 380,
  },
  {
    id: "coastal-rocks",
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=86",
    alt: "Rocky blue coastline",
    label: "Coastal Rocks",
    height: 290,
  },
  {
    id: "quiet-water",
    img: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=900&q=86",
    alt: "Quiet freshwater lake",
    label: "Quiet Water",
    height: 540,
  },
  {
    id: "field-camp",
    img: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=900&q=86",
    alt: "Camp by the water",
    label: "Field Camp",
    height: 410,
  },
  {
    id: "catch-board",
    img: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=900&q=86",
    alt: "Fishing catch on board",
    label: "Catch Board",
    height: 335,
  },
  {
    id: "surface-ripples",
    img: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?auto=format&fit=crop&w=900&q=86",
    alt: "Water surface ripples",
    label: "Surface Ripples",
    height: 465,
  },
];

const tabs = [
  { id: "posts", label: "Gönderiler", icon: Image },
  { id: "achievements", label: "Başarılar", icon: Star },
  { id: "photos", label: "Fotoğraflar", icon: Images },
  { id: "trips", label: "Geziler", icon: Mountain },
  { id: "gear", label: "Ekipman", icon: Camera },
  { id: "favorites", label: "Favoriler", icon: Heart },
] as const;

type ProfileTab = (typeof tabs)[number]["id"];

export default function UserProfileWorkspace() {
  const { user, updateUser } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [isProfileCollapsed, setIsProfileCollapsed] = useState(false);
  const profileCollapsedRef = useRef(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(avatar);
  const [profile, setProfile] = useState({
    name: "Alicia Vikander",
    handle: "@avikander",
    bio: "Diving is my therapy, the ocean is my home.",
  });
  const [draftProfile, setDraftProfile] = useState(profile);
  const [profilePosts, setProfilePosts] = useState<ProfileFeedPost[]>([]);
  const [profilePostsLoading, setProfilePostsLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) return;
    const nextProfile = {
      name: user.name,
      handle: user.handle,
      bio: user.bio ?? "AquaScope ile deniz verilerini ve tur kesiflerini takip ediyor.",
    };
    setProfile(nextProfile);
    setDraftProfile(nextProfile);
    if (user.avatarUrl) setAvatarSrc(user.avatarUrl);
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    setProfilePostsLoading(true);

    fetch("/api/posts")
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(String(data?.error ?? "Gonderiler yuklenemedi."));
        const apiPosts: ProfileFeedPost[] = Array.isArray(data?.posts) ? data.posts : [];
        const viewerPosts = apiPosts.filter((post) => {
          const authorId = post.userId ?? post.authorProfile?.userId;
          return authorId === user?.id || post.handle === user?.handle || post.author === user?.name;
        });

        if (!cancelled) setProfilePosts(viewerPosts);
      })
      .catch(() => {
        if (!cancelled) setProfilePosts([]);
      })
      .finally(() => {
        if (!cancelled) setProfilePostsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.handle, user?.id, user?.name]);

  const [sharedPosts, setSharedPosts] = useState<Record<string, boolean>>({});

  const postStats = useMemo(
    () =>
      Object.fromEntries(
        profilePosts.map((post) => [
          post.id,
          {
            likes: post.likes + (likedPosts[post.id] ? 1 : 0),
            shared: Boolean(sharedPosts[post.id]),
          },
        ])
      ),
    [likedPosts, profilePosts, sharedPosts]
  ) as Record<string, { likes: number; shared: boolean }>;

  const openEditProfile = () => {
    setDraftProfile(profile);
    setIsEditing(true);
  };

  const openAvatarEditor = () => {
    setIsAvatarEditorOpen(true);
  };

  const saveProfile = () => {
    const nextProfile = {
      name: draftProfile.name.trim() || profile.name,
      handle: draftProfile.handle.trim().startsWith("@")
        ? draftProfile.handle.trim()
        : `@${draftProfile.handle.trim() || profile.handle.replace("@", "")}`,
      bio: draftProfile.bio.trim() || profile.bio,
    };
    setProfile(nextProfile);
    updateUser(nextProfile);
    if (user?.id) {
      fetch(`/api/users/${user.id}/profile`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(nextProfile),
      }).catch(() => undefined);
    }
    setIsEditing(false);
  };

  const updateProfileCollapse = (scrollTop: number) => {
    const shouldCollapse = profileCollapsedRef.current ? scrollTop > 2 : scrollTop > 18;

    if (profileCollapsedRef.current === shouldCollapse) {
      return;
    }

    profileCollapsedRef.current = shouldCollapse;
    setIsProfileCollapsed(shouldCollapse);
  };

  const handleProfileScroll = (event: UIEvent<HTMLDivElement>) => {
    updateProfileCollapse(event.currentTarget.scrollTop);
  };

  const selectTab = (tab: ProfileTab) => {
    setActiveTab(tab);
    profileCollapsedRef.current = false;
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
                Kapak görselini değiştir
              </span>
            </button>
            <div className="profile-hero-actions">
              <button type="button" onClick={openEditProfile}>
                <Edit3 size={17} />
                Profilini Düzenle
              </button>
              <button type="button" aria-label="More profile actions">
                <MoreHorizontal size={20} />
              </button>
            </div>
            <div className="profile-identity">
              <button type="button" className="profile-avatar-wrap" aria-label="Profil fotografini degistir" onClick={openAvatarEditor}>
                <img src={avatarSrc} alt={profile.name} />
                <span className="profile-avatar-edit">
                  <Camera size={15} />
                  Değiştir
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
                    Seattle, Washington
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
                  Profilini Düzenle
                </button>
                <button type="button" aria-label="More profile actions">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>

          </section>

          <div className="profile-tabs-shell">
            <AnimatedTabBar
              ariaLabel="Profile sections"
              activeButtonClassName="active"
              activeValue={activeTab}
              buttonClassName="profile-tab-button"
              className="profile-tabs"
              layoutId="profile-active-tab"
              onChange={selectTab}
              tabs={tabs.map(({ id, label, icon }) => ({ title: label, value: id, icon: icon as any }))}
            />
          </div>

          <div className="profile-lower-grid">
            <div className="profile-primary-column">
              {activeTab === "posts" ? (
                <div className="profile-feed" onScroll={handleProfileScroll}>
                  {profilePostsLoading ? (
                    <div className="profile-empty-state">
                      <strong>Gonderiler yukleniyor</strong>
                      <span>Sosyal akis verisi kontrol ediliyor.</span>
                    </div>
                  ) : profilePosts.length ? (
                    profilePosts.map((post) => {
                      const postImage = post.mediaUrls?.[0] ?? defaultPostImage;
                      const tags = post.tags ?? [];

                      return (
                        <article className="profile-post-card" key={post.id}>
                          <header>
                            <img src={post.avatar ?? post.authorProfile?.avatarUrl ?? avatarSrc} alt={post.author} />
                            <div>
                              <strong>{post.author}</strong>
                              <span>{formatProfilePostTime(post.createdAt)}</span>
                              <small>Public</small>
                            </div>
                            <MoreHorizontal size={19} />
                          </header>

                          <p>{post.body}</p>

                          {tags.length > 0 ? (
                            <div className="profile-post-tags">
                              {tags.map((tag) => (
                                <span key={tag}>{tag}</span>
                              ))}
                            </div>
                          ) : null}

                          {postImage ? (
                            <figure className="profile-post-image">
                              <img src={postImage} alt="" />
                            </figure>
                          ) : null}

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
                              {postStats[post.id]?.likes ?? post.likes}
                            </button>
                            <button className="profile-action" type="button">
                              <MessageCircle size={19} />
                              {post.comments} Comments
                            </button>
                            <button
                              className={postStats[post.id]?.shared ? "profile-action profile-action--active" : "profile-action"}
                              type="button"
                              onClick={() => setSharedPosts((current) => ({ ...current, [post.id]: !current[post.id] }))}
                            >
                              <Share2 size={18} />
                              {postStats[post.id]?.shared ? "Shared" : "Share"}
                            </button>
                          </footer>
                        </article>
                      );
                    })
                  ) : (
                    <div className="profile-empty-state">
                      <strong>Henuz gonderi yok</strong>
                      <span>Bu alanda /social akisinda bu kullaniciya ait paylasimlar gorunecek.</span>
                    </div>
                  )}
                </div>
              ) : (
                <ProfileTabPanel activeTab={activeTab} onScroll={handleProfileScroll} />
              )}
            </div>
          </div>
        </main>

        <aside className="profile-side-card">
          <section className="profile-about-card">
            <header>
              <h2>Hakkında</h2>
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
            <button type="button">Tüm Profili Gör</button>
          </section>

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

          <section className="profile-following">
            <header>
              <h2>Takip Ettikleri <span>(178)</span></h2>
              <a href="/platform/social">Tümünü Gör</a>
            </header>
            <div className="profile-following-list">
              {followingPeople.map((person) => (
                <article key={person.name}>
                  <img src={person.image} alt={person.name} />
                  <strong>{person.name}</strong>
                  <button type="button">Takip Ediyor</button>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {isAvatarEditorOpen ? (
        <ProfileImagePickerModal
          currentImage={avatarSrc}
          onClose={() => setIsAvatarEditorOpen(false)}
          onSave={(nextImage) => {
            setAvatarSrc(nextImage);
            updateUser({ avatarUrl: nextImage });
            if (user?.id) {
              fetch(`/api/users/${user.id}/profile`, {
                method: "PATCH",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ avatarUrl: nextImage }),
              }).catch(() => undefined);
            }
            setIsAvatarEditorOpen(false);
          }}
        />
      ) : null}

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
            <div className="profile-edit-avatar-row">
              <img src={avatarSrc} alt={profile.name} />
              <div>
                <strong>Profil fotoğrafı</strong>
                <p>Fotoğraf yükleyin veya kamerayla yeni bir fotoğraf çekin.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setIsAvatarEditorOpen(true);
                }}
              >
                <Camera size={17} />
                Fotoğrafı değiştir
              </button>
            </div>
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

function ProfileImagePickerModal({
  currentImage,
  onClose,
  onSave,
}: {
  currentImage: string;
  onClose: () => void;
  onSave: (image: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [preview, setPreview] = useState(currentImage);
  const [mode, setMode] = useState<"upload" | "camera">("upload");
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraReady(false);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFileName(file.name);
    setMode("upload");
    stopCamera();

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    setMode("camera");
    setCameraError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Bu tarayici kamera erisimini desteklemiyor.");
      return;
    }

    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 960 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraReady(true);
    } catch {
      setCameraError("Kamera baslatilamadi. Tarayici izinlerini kontrol edin veya dosya yukleyin.");
      setCameraReady(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;

    if (!video || !cameraReady || video.videoWidth === 0 || video.videoHeight === 0) {
      return;
    }

    const canvas = document.createElement("canvas");
    const size = Math.min(video.videoWidth, video.videoHeight);
    const offsetX = (video.videoWidth - size) / 2;
    const offsetY = (video.videoHeight - size) / 2;

    canvas.width = 720;
    canvas.height = 720;
    canvas
      .getContext("2d")
      ?.drawImage(video, offsetX, offsetY, size, size, 0, 0, canvas.width, canvas.height);

    setPreview(canvas.toDataURL("image/jpeg", 0.9));
    setFileName("Kamera fotografı");
  };

  const resetPreview = () => {
    setPreview(currentImage);
    setFileName("");
  };

  return (
    <div className="profile-modal-layer profile-image-modal-layer" role="dialog" aria-modal="true" aria-labelledby="profile-image-title">
      <div className="profile-image-modal">
        <header>
          <div>
            <h2 id="profile-image-title">Profil fotoğrafını değiştir</h2>
            <p>Bir görsel yükleyin veya kamerayla yeni bir profil fotoğrafı çekin.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Profil fotoğrafı penceresini kapat">
            <X size={20} />
          </button>
        </header>

        <div className="profile-image-modal__content">
          <section className="profile-image-modal__preview">
            <div>
              <img src={preview} alt="Profil fotoğrafı önizleme" />
              <span>Önizleme</span>
            </div>
            <p>{fileName || "Mevcut profil fotoğrafı"}</p>
          </section>

          <section className="profile-image-modal__tools">
            <div className="profile-image-tool-tabs" role="tablist" aria-label="Profil fotoğrafı seçenekleri">
              <button type="button" className={mode === "upload" ? "active" : ""} onClick={() => { setMode("upload"); stopCamera(); }}>
                <UploadCloud size={18} />
                Yükle
              </button>
              <button type="button" className={mode === "camera" ? "active" : ""} onClick={startCamera}>
                <Video size={18} />
                Fotoğraf Çek
              </button>
            </div>

            {mode === "upload" ? (
              <button type="button" className="profile-upload-dropzone" onClick={() => fileInputRef.current?.click()}>
                <UploadCloud size={30} />
                <strong>Fotoğraf yükle</strong>
                <span>JPG, PNG veya WEBP dosyası seçin</span>
              </button>
            ) : (
              <div className="profile-camera-stage">
                {cameraReady ? (
                  <video ref={videoRef} playsInline muted />
                ) : (
                  <div>
                    <Video size={30} />
                    <span>{cameraError || "Kamera başlatılıyor..."}</span>
                  </div>
                )}
                <button type="button" onClick={capturePhoto} disabled={!cameraReady}>
                  <Camera size={18} />
                  Fotoğrafı Yakala
                </button>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} hidden />

            {cameraError ? <p className="profile-image-modal__error">{cameraError}</p> : null}
          </section>
        </div>

        <footer>
          <button type="button" onClick={resetPreview}>
            <RotateCcw size={17} />
            Sıfırla
          </button>
          <div>
            <button type="button" onClick={onClose}>Vazgeç</button>
            <button type="button" onClick={() => onSave(preview)}>
              <Check size={17} />
              Fotoğrafı Kaydet
            </button>
          </div>
        </footer>
      </div>
    </div>
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

  if (activeTab === "favorites") {
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
        <span>{galleryItems.length} photos</span>
      </div>

      <ProfileMasonry
        animateFrom="bottom"
        blurToFocus
        duration={0.6}
        ease="power3.out"
        hoverScale={0.95}
        items={galleryItems}
        scaleOnHover
        stagger={0.05}
      />
    </div>
  );
}

function ProfileMasonry({
  animateFrom,
  blurToFocus,
  duration,
  hoverScale,
  items,
  scaleOnHover,
  stagger,
}: {
  animateFrom: "bottom";
  blurToFocus: boolean;
  duration: number;
  ease: string;
  hoverScale: number;
  items: typeof galleryItems;
  scaleOnHover: boolean;
  stagger: number;
}) {
  return (
    <div
      className={cn(
        "profile-masonry-grid",
        blurToFocus && "profile-masonry-grid--blur",
        scaleOnHover && "profile-masonry-grid--scale"
      )}
      data-animate-from={animateFrom}
      style={{
        "--profile-masonry-duration": `${duration}s`,
        "--profile-masonry-hover-scale": hoverScale,
        "--profile-masonry-stagger": `${stagger}s`,
      } as CSSProperties}
    >
      {items.map((item, index) => (
        <AnimatedMasonryImage item={item} key={item.id} staggerIndex={index} />
      ))}
    </div>
  );
}

function AnimatedMasonryImage({
  item,
  staggerIndex,
}: {
  item: (typeof galleryItems)[number];
  staggerIndex: number;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const [isLoading, setIsLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState(item.img);

  return (
    <figure
      className={cn("profile-masonry-item", isInView && !isLoading && "profile-masonry-item--visible")}
      ref={ref}
      style={{
        "--profile-masonry-item-height": `${item.height}px`,
        "--profile-masonry-item-delay": `${staggerIndex} * var(--profile-masonry-stagger)`,
      } as CSSProperties}
    >
      <img
        alt={item.alt}
        loading="lazy"
        onError={() => setImgSrc("https://placehold.co/900x1200/06182c/5bd6ff?text=AquaScope")}
        onLoad={() => setTimeout(() => setIsLoading(false), 90 + staggerIndex * 35)}
        src={imgSrc}
      />
      <figcaption>
        <span>{item.label}</span>
      </figcaption>
    </figure>
  );
}

"use client";

import type { ChangeEvent, CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Award,
  Ban,
  BarChart3,
  Bell,
  Bookmark,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Film,
  Globe2,
  GripVertical,
  Heart,
  EyeOff,
  Info,
  Image as ImageIcon,
  Lock,
  ListPlus,
  MapPin,
  Maximize2,
  MessageCircle,
  MoreVertical,
  Pencil,
  Pin,
  Navigation,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Share2,
  SlidersHorizontal,
  Smile,
  Tag,
  Trash2,
  Trophy,
  Upload,
  UserPlus,
  Users,
  Video,
  VolumeX,
  X,
} from "lucide-react";
import AnimatedTabBar from "../../ui/animated-tab-bar";
import { useCurrentUser } from "../../../hooks/use-current-user";
import { defaultProfileAvatarUrl } from "../../../lib/constants";
import NotificationPopover from "../shell/notification-popover";

const avatar = defaultProfileAvatarUrl;

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
  likedByViewer?: boolean;
  savedByViewer?: boolean;
  authorFollowedByViewer?: boolean;
  photos: string[];
  location?: string;
  profile?: {
    userId: string;
    name: string;
    handle: string;
    avatarUrl?: string;
    coverUrl?: string;
    region?: string;
    level?: string;
    bio?: string;
  };
  poll?: {
    question: string;
    options: [string, number][];
    votes: number;
  };
};

type ApiFeedPost = {
  id: string;
  kind?: SocialPostKind;
  body: string;
  tags?: string[];
  mediaUrls?: string[];
  region?: string;
  likes: number;
  comments: number;
  likedByViewer?: boolean;
  savedByViewer?: boolean;
  authorFollowedByViewer?: boolean;
  createdAt: string;
  author: string;
  handle: string;
  avatar?: string;
  authorProfile?: SocialPost["profile"];
};



type SocialSearchUser = {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string;
  region?: string;
  level?: string;
};
type ApiPostComment = {
  id: string;
  postId?: string;
  userId?: string;
  body: string;
  createdAt: string;
  author?: string | null;
  handle?: string | null;
  avatar?: string | null;
  comments?: number;
};

type ComposerPhoto = {
  id: string;
  name: string;
  size: number;
  url: string;
  caption: string;
};

const MAX_COMPOSER_PHOTOS = 6;
const MAX_COMPOSER_PHOTO_SIZE = 5 * 1024 * 1024;

function readImageAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Image could not be read."));
    reader.readAsDataURL(file);
  });
}

function formatUploadSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatFeedTime(value: string) {
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

function mapApiPost(post: ApiFeedPost): SocialPost {
  const kind = post.kind ?? "text";
  return {
    id: post.id,
    author: post.author,
    handle: post.handle,
    time: formatFeedTime(post.createdAt),
    avatar: post.avatar ?? post.authorProfile?.avatarUrl ?? avatar,
    kind,
    text: post.body,
    tags: post.tags ?? [],
    likes: post.likes,
    comments: post.comments,
    likedByViewer: post.likedByViewer,
    savedByViewer: post.savedByViewer,
    authorFollowedByViewer: post.authorFollowedByViewer,
    photos: post.mediaUrls ?? [],
    location: post.region,
    profile: post.authorProfile,
  };
}

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
      question: "Bu hafta sonu nerede balık tutmayı planlıyorsunuz?",
      options: [
        ["Göl", 45],
        ["Nehir", 30],
        ["Deniz", 15],
        ["Fikrim yok", 10],
      ],
      votes: 97,
    },
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=96&q=80",
    text: "Hafta sonu için rota seçimi yapıyoruz.",
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
    text: "Bugünkü dalış anlarından kısa bir kesit.",
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
    text: "Bugünku dalış noktası sakin ve görüş mesafesi çok iyiydi.",
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
    text: "Sabahın bu saatinde denizde olmak bambaşka bir huzur veriyor. Doğa insana her zaman iyi geliyor.",
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
    text: "Ufak bir yakalama guünlüğü. Renkler ve desenler gerçekten etkileyici.",
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
    location: "Uzungöl, Trabzon",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=96&q=80",
    text: "Sisli hava, temiz su ve çok sakin bir rota.",
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
    text: "Gün batımında kıyıdan kısa bir olta denemesi. Işık harikaydı.",
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
      question: "En sevdiğiniz olta takımı hangisi?",
      options: [
        ["Spin", 50],
        ["Fly Fishing", 25],
        ["Surf Casting", 15],
        ["Diger", 10],
      ],
      votes: 120,
    },
    avatar,
    text: "Yeni ekipman listesi için topluluk fikri alıyorum.",
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
    text: "Bugün harika bir gün geçirdik! Temiz hava, güzel insanlar ve bol kahkaha. Daha ne olsun?",
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
    text: "Renkleriyle dikkat çeken güzel bir tur. Kısa bir gözlem notu olarak kaydettim.",
    tags: ["#Species", "#Color", "#Observation"],
    likes: 66,
    comments: 6,
    photos: ["https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?auto=format&fit=crop&w=950&q=85"],
  },
  {
    id: "flow-photo-nora-harbor",
    author: "Nora Chen",
    handle: "@noracasts",
    time: "19 hours ago",
    kind: "photo",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=96&q=80",
    text: "Harbor lights after a long evening session. Water was calm and clear.",
    tags: ["#Harbor", "#EveningCatch", "#CalmWater"],
    likes: 84,
    comments: 13,
    photos: ["https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1100&q=85"],
  },
  {
    id: "flow-text-owen-tip",
    author: "Owen Blake",
    handle: "@owenblake",
    time: "20 hours ago",
    kind: "text",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&q=80",
    text: "Small tip for early morning fishing: check wind direction first, then pick the quiet side of the bay.",
    tags: ["#FishingTips", "#Morning", "#Bay"],
    likes: 58,
    comments: 8,
    photos: [],
  },
  {
    id: "flow-location-maya-bay",
    author: "Maya Torres",
    handle: "@mayafishing",
    time: "21 hours ago",
    kind: "location",
    location: "Datca, Mugla",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=96&q=80",
    text: "A clean shore route with steady visibility. Marking this one for the next group trip.",
    tags: ["#Location", "#Datca", "#ShoreRoute"],
    likes: 73,
    comments: 10,
    photos: ["https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=950&q=85"],
  },
  {
    id: "flow-poll-nina-depth",
    author: "Nina Hart",
    handle: "@ninahart",
    time: "22 hours ago",
    kind: "poll",
    poll: {
      question: "Next demo layer should focus on which marine metric?",
      options: [
        ["Depth", 42],
        ["Temperature", 28],
        ["Current", 20],
        ["Chlorophyll", 10],
      ],
      votes: 142,
    },
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=96&q=80",
    text: "Choosing the next map layer with the community.",
    tags: ["#Poll", "#MarineData", "#AquaScope"],
    likes: 101,
    comments: 19,
    photos: [],
  },
  {
    id: "flow-video-kaan-dive",
    author: "Kaan Arslan",
    handle: "@kaanblue",
    time: "23 hours ago",
    kind: "video",
    avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=96&q=80",
    text: "Short reef pass from today's dive. The school moved right under the ledge.",
    tags: ["#Reef", "#DiveLog", "#Video"],
    likes: 88,
    comments: 15,
    photos: ["https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=1100&q=85"],
  },
  {
    id: "flow-photo-ella-camp",
    author: "Ella Martin",
    handle: "@ellacamps",
    time: "1 day ago",
    kind: "photo",
    avatar: "https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?auto=format&fit=crop&w=96&q=80",
    text: "Camp setup before sunrise. Coffee, charts and a quiet lake.",
    tags: ["#Camp", "#LakeLife", "#Sunrise"],
    likes: 92,
    comments: 16,
    photos: ["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1000&q=85"],
  },
];

const suggestedFriends = [
  ["Julia Smith", "@juliasmith", "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=96&q=80"],
  ["Vermillion D. Gray", "@vermilliongray", avatar],
  ["Mai Senpai", "@maisenpai", "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=96&q=80"],
  ["Azunyan U. Wu", "@azunyardesu", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80"],
  ["Qarack Babarma", "@obama21", "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=96&q=80"],
];

const storyActionDefaults = { likes: 142, comments: 24, shares: 12, liked: false, shared: false, saved: false };

type StoryItem = {
  name: string;
  handle: string;
  time: string;
  avatar: string;
  ownStory: boolean;
  image: string;
  caption: string;
  location: string;
};

const initialStoryItems: StoryItem[] = [
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
  {
    name: "harbor_nora",
    handle: "harbor_nora",
    time: "7h ago",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=96&q=80",
    ownStory: false,
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=86",
    caption: "Harbor lights after a quiet evening session.",
    location: "Izmir Marina",
  },
  {
    name: "owentides",
    handle: "owentides",
    time: "8h ago",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=96&q=80",
    ownStory: false,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=86",
    caption: "Low tide revealed a clean reef line.",
    location: "Aegean Coast",
  },
  {
    name: "maya_bay",
    handle: "maya_bay",
    time: "9h ago",
    avatar: "https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?auto=format&fit=crop&w=96&q=80",
    ownStory: false,
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=86",
    caption: "Sunset scouting before tomorrow's trip.",
    location: "Blue Water Lake",
  },
  {
    name: "kaan_dive",
    handle: "kaan_dive",
    time: "10h ago",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&q=80",
    ownStory: false,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=86",
    caption: "Visibility was perfect near the wall.",
    location: "North Aegean",
  },
];

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
  "flow-photo-nora-harbor",
  "flow-text-owen-tip",
  "flow-location-maya-bay",
  "flow-poll-nina-depth",
  "flow-video-kaan-dive",
  "flow-photo-ella-camp",
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
    text: "Harika bir kare! Renkler ve netlik müthiş.",
    likes: 3,
    avatar: "https://images.unsplash.com/photo-1494790108ö77-be9c29b29330?auto=format&fit=crop&w=96&q=80",
  },
  {
    author: "James Mitchell",
    time: "45 dakika önce",
    text: "Bu balık sürüsü inanılmaz! Nerede dalış yaptınız?",
    likes: 2,
    avatar,
  },
  {
    author: "Sophia Turner",
    time: "20 dakika önce",
    text: "Keşke orada olabilseydim!",
    likes: 1,
    avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=96&q=80",
  },
];

const feedTabs = ["For You", "Following", "Popular", "Groups", "Saved"] as const;
type FeedTab = (typeof feedTabs)[number];
const feedTabLabels: Record<FeedTab, string> = {
  "For You": "For you",
  Following: "Following",
  Popular: "Popular",
  Groups: "Groups",
  Saved: "Saved",
};
type SocialModal = "create" | "media" | "video" | "location" | "poll" | "achievement" | "notifications" | "comments" | "share" | "friends" | "topics" | "members" | "events" | null;

type SocialRuntimeSettings = {
  socialAllowComments: boolean;
  socialStoryReplies: boolean;
  socialDirectMessages: "everyone" | "followers" | "none";
  socialShareActivity: boolean;
  socialShowOnlineStatus: boolean;
  socialContentLanguage: "tr" | "en" | "both";
};

const defaultSocialRuntimeSettings: SocialRuntimeSettings = {
  socialAllowComments: true,
  socialStoryReplies: true,
  socialDirectMessages: "everyone",
  socialShareActivity: true,
  socialShowOnlineStatus: true,
  socialContentLanguage: "tr",
};

const modalCopy: Record<Exclude<SocialModal, null>, { title: string; eyebrow: string; description: string }> = {
  create: {
    eyebrow: "Yeni Paylaşım",
    title: "Toplulukla yeni bir av deneyimi paylaş",
    description: "Metin, görsel, konum ve hedef kitle bilgilerini tek akışta düzenleyebilirsiniz.",
  },
  media: {
    eyebrow: "Medya Akışı",
    title: "Share Your Catch",
    description: "Add a photo or video from your fishing adventure.",
  },
  video: {
    eyebrow: "Video Akışı",
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
    eyebrow: "Başarı",
    title: "Yakalama başarısını öne cıkar",
    description: "Skor, agirlik veya tur rozeti ekleyerek paylasiminizi daha belirgin hale getirin.",
  },
  notifications: {
    eyebrow: "Bildirimler",
    title: "Son topluluk hareketleri",
    description: "Yeni yorumlar, arkadaş istekleri ve etkinlik hatırlatmaları burada listelenir.",
  },
  comments: {
    eyebrow: "Yorumlar",
    title: "Gönderi yorumlarını yönet",
    description: "Kısa bir yorum ekleyin veya mevcut yorum akışındaki geri bildirimleri inceleyin.",
  },
  share: {
    eyebrow: "Paylaş",
    title: "Gönderiyi paylaşım kanalına gönder",
    description: "AquaScope içinde, profilinizde veya harici bağlanti olarak paylaşabilirsiniz.",
  },
  friends: {
    eyebrow: "Arkadaşlar",
    title: "Önerilen kullanıcıları incele",
    description: "Ortak ilgi alanlarina göre önerilen balıkçıları takip listenize ekleyin.",
  },
  topics: {
    eyebrow: "Trendler",
    title: "Popüler konu etiketleri",
    description: "Sık kullanılan etiketleri inceleyin ve akış filtrelerinize uygulayın.",
  },
  members: {
    eyebrow: "Liderlik",
    title: "Topluluk sıralamasını gör",
    description: "Bu haftanın en aktif üyelerini ve puan durumlarını takip edin.",
  },
  events: {
    eyebrow: "Etkinlikler",
    title: "Yaklaşan etkinlik akışına katıl",
    description: "Planlanan saha etkinliklerini göruntüleyin ve katılım durumunuzu yönetin.",
  }
};

export default function SocialAreaWorkspace() {
  const { user } = useCurrentUser();
  const currentUserName = user?.name ?? "Derya Y?lmaz";
  const currentUserHandle = user?.handle ?? "@deryayilmaz";
  const currentUserAvatar = user?.avatarUrl ?? avatar;
  const [posts, setPosts] = useState(feedPosts);
  const [activeTab, setActiveTab] = useState<FeedTab>("For You");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchUsers, setSearchUsers] = useState<SocialSearchUser[]>([]);
  const [composerText, setComposerText] = useState("");
  const [composerPhotos, setComposerPhotos] = useState<ComposerPhoto[]>([]);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [audience, setAudience] = useState("Everyone");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [sharedPosts, setSharedPosts] = useState<Record<string, boolean>>({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Record<string, boolean>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [postComments, setPostComments] = useState<Record<string, ApiPostComment[]>>({});
  const [addedFriends, setAddedFriends] = useState<Record<string, boolean>>({});
  const [followedUsers, setFollowedUsers] = useState<Record<string, boolean>>({});
  const [hiddenFriends, setHiddenFriends] = useState<Record<string, boolean>>({});
  const [openPostMenuId, setOpenPostMenuId] = useState<string | null>(null);
  const postMenuRef = useRef<HTMLDivElement | null>(null);
  const [dismissedPostIds, setDismissedPostIds] = useState<Record<string, boolean>>({});
  const [mutedHandles, setMutedHandles] = useState<Record<string, boolean>>({});
  const [blockedHandles, setBlockedHandles] = useState<Record<string, boolean>>({});
  const [listedPostIds, setListedPostIds] = useState<Record<string, boolean>>({});
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const [joinedEvent, setJoinedEvent] = useState(false);
  const [notice, setNotice] = useState("Topluluk akışınız hazır.");
  const [activeModal, setActiveModal] = useState<SocialModal>(null);
  const [activeFlowPostId, setActiveFlowPostId] = useState<string | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [storyItems, setStoryItems] = useState<StoryItem[]>(() =>
    initialStoryItems.map((story, index) => (index === 0 ? { ...story, avatar: currentUserAvatar } : story))
  );
  const storyRailRef = useRef<HTMLElement | null>(null);
  const storyInputRef = useRef<HTMLInputElement | null>(null);
  const [socialSettings, setSocialSettings] = useState<SocialRuntimeSettings>(defaultSocialRuntimeSettings);
  const commentsEnabled = socialSettings.socialAllowComments;
  const storyRepliesEnabled = socialSettings.socialStoryReplies;
  useEffect(() => {
    if (!profileMenuOpen) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (profileMenuRef.current?.contains(event.target as Node)) return;
      setProfileMenuOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [profileMenuOpen]);
  useEffect(() => {
    if (!openPostMenuId) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (postMenuRef.current?.contains(event.target as Node)) return;
      setOpenPostMenuId(null);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [openPostMenuId]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    fetch(`/api/users/${user.id}/settings`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error("settings_load_failed");
        if (!cancelled) setSocialSettings({ ...defaultSocialRuntimeSettings, ...data?.settings });
      })
      .catch(() => {
        if (!cancelled) setNotice("Sosyal ayarlar yuklenemedi, varsayilan davranis kullaniliyor.");
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    fetch("/api/users")
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(String(data?.error ?? "Kullanicilar yuklenemedi."));
        setSearchUsers(Array.isArray(data?.users) ? data.users : []);
      })
      .catch(() => setSearchUsers([]));
  }, []);
  useEffect(() => {
    let cancelled = false;
    const endpoint = activeTab === "Following" ? "/api/posts?feed=following" : "/api/posts";

    fetch(endpoint)
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(String(data?.error ?? "Feed yuklenemedi."));
        const rawPosts: ApiFeedPost[] = Array.isArray(data?.posts) ? data.posts : [];
        const apiPosts = rawPosts.map(mapApiPost);
        if (!cancelled) {
          setPosts(activeTab === "Following" ? apiPosts : (apiPosts.length ? apiPosts : feedPosts));
          setLikedPosts(Object.fromEntries(rawPosts.filter((post) => post.likedByViewer).map((post) => [post.id, true])));
          setBookmarkedPosts(Object.fromEntries(rawPosts.filter((post) => post.savedByViewer).map((post) => [post.id, true])));
          setFollowedUsers((current) => ({
            ...current,
            ...Object.fromEntries(rawPosts.filter((post) => post.authorFollowedByViewer && post.authorProfile?.userId).map((post) => [post.authorProfile!.userId, true])),
          }));
          setNotice(activeTab === "Following" && apiPosts.length === 0 ? "Takip ettiginiz kullanicilardan henuz paylasim yok." : "Topluluk akisiniz hazir.");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNotice(activeTab === "Following" ? "Takip akisini gormek icin oturum acin." : "Gercek feed verisi alinamadi, demo akisi gosteriliyor.");
          if (activeTab === "Following") setPosts([]);
          else setPosts(feedPosts);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const commentsLoadedForPost = activeModal === "comments" ? activeFlowPostId : null;
  useEffect(() => {
    if (!commentsLoadedForPost || postComments[commentsLoadedForPost]) return;

    fetch(`/api/posts/${commentsLoadedForPost}/comments`)
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(String(data?.error ?? "Yorumlar yuklenemedi."));
        const comments: ApiPostComment[] = Array.isArray(data?.comments) ? data.comments : [];
        setPostComments((current) => ({ ...current, [commentsLoadedForPost]: comments }));
      })
      .catch(() => setNotice("Yorumlar yuklenemedi."));
  }, [commentsLoadedForPost, postComments]);

  const userSearchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query.length < 2) return [];
    return searchUsers
      .filter((item) => item.id !== user?.id)
      .filter((item) => item.name.toLowerCase().includes(query) || item.handle.toLowerCase().includes(query))
      .slice(0, 6);
  }, [searchQuery, searchUsers, user?.id]);
  const visiblePosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const searched = posts.filter((post) => {
      if (dismissedPostIds[post.id] || mutedHandles[post.handle] || blockedHandles[post.handle]) return false;
      if (!query) return true;
      return [post.author, post.handle, post.text, ...post.tags].some((value) => value.toLowerCase().includes(query));
    });

    if (activeTab === "Popular") {
      return [...searched].sort((a, b) => b.likes - a.likes);
    }

    if (activeTab === "Saved") {
      return searched.filter((post) => bookmarkedPosts[post.id]);
    }

    return [...searched].sort((a, b) => Number(featuredDemoPostIds.has(b.id)) - Number(featuredDemoPostIds.has(a.id)));
  }, [activeTab, blockedHandles, bookmarkedPosts, dismissedPostIds, mutedHandles, posts, searchQuery]);


  const updatePostCount = (postId: string, patch: Partial<Pick<SocialPost, "likes" | "comments">>) => {
    setPosts((current) => current.map((post) => (post.id === postId ? { ...post, ...patch } : post)));
  };

  const togglePostLike = (postId: string) => {
    const nextActive = !likedPosts[postId];
    const targetPost = posts.find((post) => post.id === postId) ?? visiblePosts.find((post) => post.id === postId);
    setLikedPosts((current) => ({ ...current, [postId]: nextActive }));
    if (targetPost) updatePostCount(postId, { likes: Math.max(0, targetPost.likes + (nextActive ? 1 : -1)) });
    fetch(`/api/posts/${postId}/like`, nextActive ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: true }) } : { method: "DELETE" })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(String(data?.error ?? "Begeni kaydedilemedi."));
        if (typeof data?.likes === "number") updatePostCount(postId, { likes: data.likes });
      })
      .catch(() => setNotice("Begeni kaydedilemedi. Oturumunuzu kontrol edin."));
  };

  const togglePostSave = (postId: string) => {
    const nextActive = !bookmarkedPosts[postId];
    setBookmarkedPosts((current) => ({ ...current, [postId]: nextActive }));
    fetch(`/api/posts/${postId}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: nextActive }),
    }).catch(() => setNotice("Kaydetme islemi tamamlanamadi. Oturumunuzu kontrol edin."));
  };

  const submitPostComment = (postId: string, body: string) => {
    const targetPost = visiblePosts.find((post) => post.id === postId) ?? posts.find((post) => post.id === postId);
    const localId = `local-comment-${Date.now()}`;
    const optimisticComment: ApiPostComment = {
      id: localId,
      postId,
      body,
      createdAt: new Date().toISOString(),
      author: currentUserName,
      handle: currentUserHandle,
      avatar: currentUserAvatar,
    };

    setPostComments((current) => ({ ...current, [postId]: [...(current[postId] ?? []), optimisticComment] }));
    setCommentCounts((current) => ({ ...current, [postId]: (current[postId] ?? targetPost?.comments ?? 0) + 1 }));

    fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(String(data?.error ?? "Yorum kaydedilemedi."));
        if (data?.comment) {
          setPostComments((current) => ({
            ...current,
            [postId]: (current[postId] ?? []).map((comment) => comment.id === localId ? data.comment : comment),
          }));
        }
        if (typeof data?.comment?.comments === "number") {
          setCommentCounts((current) => ({ ...current, [postId]: data.comment.comments }));
          updatePostCount(postId, { comments: data.comment.comments });
        }
      })
      .catch(() => setNotice("Yorum kaydedilemedi. Oturumunuzu kontrol edin."));
  };

  const toggleAuthorFollow = (userId?: string) => {
    if (!userId) return;
    const nextActive = !followedUsers[userId];
    setFollowedUsers((current) => ({ ...current, [userId]: nextActive }));
    fetch("/api/follows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followingId: userId, active: nextActive }),
    }).catch(() => {
      setFollowedUsers((current) => ({ ...current, [userId]: !nextActive }));
      setNotice("Takip islemi tamamlanamadi. Oturumunuzu kontrol edin.");
    });
  };

  const handlePostMenuAction = (action: "dismiss" | "follow" | "list" | "mute" | "block" | "edit" | "pin" | "stats" | "share" | "delete", post: SocialPost) => {
    setOpenPostMenuId(null);

    if (action === "edit") {
      setComposerText(post.text);
      setNotice("Gonderi metni duzenleme alanina tasindi.");
      return;
    }

    if (action === "pin") {
      setPosts((current) => [post, ...current.filter((item) => item.id !== post.id)]);
      setNotice("Gonderi akisin en ustune sabitlendi.");
      return;
    }

    if (action === "stats") {
      setNotice(`${post.likes} begeni ve ${commentCounts[post.id] ?? post.comments} yorum goruntuleniyor.`);
      return;
    }

    if (action === "share") {
      setSharedPosts((current) => ({ ...current, [post.id]: true }));
      setNotice("Gonderi paylasim baglantisi hazirlandi.");
      return;
    }

    if (action === "delete") {
      setPosts((current) => current.filter((item) => item.id !== post.id));
      setNotice("Gonderi akistan kaldirildi.");
      return;
    }
    if (action === "dismiss") {
      setDismissedPostIds((current) => ({ ...current, [post.id]: true }));
      setNotice("Post akistan kaldirildi.");
      return;
    }

    if (action === "follow") {
      if (!post.profile?.userId) {
        setNotice("Bu kullanici icin takip bilgisi bulunamadi.");
        return;
      }
      toggleAuthorFollow(post.profile.userId);
      setNotice(`${post.handle} takip durumu guncellendi.`);
      return;
    }

    if (action === "list") {
      const nextListed = !listedPostIds[post.id];
      setListedPostIds((current) => ({ ...current, [post.id]: nextListed }));
      setNotice(nextListed ? "Post listeye eklendi." : "Post listeden kaldirildi.");
      return;
    }

    if (action === "mute") {
      setMutedHandles((current) => ({ ...current, [post.handle]: true }));
      setNotice(`${post.handle} sessize alindi.`);
      return;
    }

    setBlockedHandles((current) => ({ ...current, [post.handle]: true }));
    setNotice(`${post.handle} engellendi.`);
  };
  const openPhotoPicker = () => {
    photoInputRef.current?.click();
  };

  const openStoryComposer = () => {
    storyInputRef.current?.click();
  };

  const handleStoryFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/") || file.size > MAX_COMPOSER_PHOTO_SIZE) {
      setNotice("Story icin 5 MB altinda bir gorsel dosyasi secin.");
      return;
    }

    const imageUrl = await readImageAsDataUrl(file);
    const nextStory: StoryItem = {
      name: "Your Story",
      handle: "Your story",
      time: "Just now",
      avatar: currentUserAvatar,
      ownStory: true,
      image: imageUrl,
      caption: composerText.trim() || "Yeni bir story paylasti.",
      location: "AquaScope",
    };

    setStoryItems((current) => {
      const ownIndex = current.findIndex((story) => story.ownStory);
      if (ownIndex < 0) return [nextStory, ...current];
      const next = [...current];
      next[ownIndex] = nextStory;
      return next;
    });
    setActiveStoryIndex(0);
    setNotice("Story paylasildi.");
  };
  const handleComposerPhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!selectedFiles.length) return;

    const availableSlots = MAX_COMPOSER_PHOTOS - composerPhotos.length;
    if (availableSlots <= 0) {
      setNotice(`En fazla ${MAX_COMPOSER_PHOTOS} fotograf ekleyebilirsiniz.`);
      return;
    }

    const imageFiles = selectedFiles
      .filter((file) => file.type.startsWith("image/"))
      .filter((file) => file.size <= MAX_COMPOSER_PHOTO_SIZE)
      .slice(0, availableSlots);

    if (!imageFiles.length) {
      setNotice("Lutfen 5 MB altinda bir gorsel dosyasi secin.");
      return;
    }

    const photos = await Promise.all(
      imageFiles.map(async (file, index) => ({
        id: `${file.name}-${file.lastModified}-${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        url: await readImageAsDataUrl(file),
        caption: "",
      }))
    );

    setComposerPhotos((current) => [...current, ...photos]);
    setNotice(`${photos.length} fotograf paylasima eklendi.`);
  };

  const updateComposerPhotoCaption = (photoId: string, caption: string) => {
    setComposerPhotos((current) => current.map((photo) => (photo.id === photoId ? { ...photo, caption } : photo)));
  };

  const removeComposerPhoto = (photoId: string) => {
    setComposerPhotos((current) => current.filter((photo) => photo.id !== photoId));
  };
  const createPost = async () => {
    const text = composerText.trim();
    const photoCaptions = composerPhotos.map((photo) => photo.caption.trim()).filter(Boolean);
    const body = [text, ...photoCaptions].filter(Boolean).join("\n\n");

    if (!body && composerPhotos.length === 0) {
      setNotice("Paylasim yapmak icin once bir metin girin veya fotograf ekleyin.");
      return;
    }

    const tags = Array.from(new Set(body.match(/#[\w-]+/g) ?? [composerPhotos.length ? "#Photo" : "#AquaScope"]));
    const mediaUrls = composerPhotos.map((photo) => photo.url);
    const postKind: SocialPostKind = mediaUrls.length ? "photo" : "text";
    const optimisticPost: SocialPost = {
      id: `local-${Date.now()}`,
      author: currentUserName,
      handle: currentUserHandle,
      time: "Just now",
      avatar: currentUserAvatar,
      kind: postKind,
      text: body || "Yeni bir fotograf paylasti.",
      tags,
      likes: 0,
      comments: 0,
      photos: mediaUrls.length ? mediaUrls : ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=85"],
    };

    setPosts((current) => [optimisticPost, ...current]);
    setComposerText("");
    setComposerPhotos([]);
    setActiveTab("For You");
    setNotice(`${audience} icin yeni paylasim yayinlandi.`);

    if (user?.id) {
      fetch("/api/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: optimisticPost.text, kind: postKind, tags, mediaUrls }),
      })
        .then(async (response) => {
          const data = await response.json().catch(() => null);
          if (!response.ok) throw new Error(String(data?.error ?? "Paylasim kaydedilemedi."));
          if (data?.post) {
            const persistedPost = mapApiPost(data.post);
            setPosts((current) => current.map((post) => (post.id === optimisticPost.id ? persistedPost : post)));
          }
        })
        .catch(() => setNotice("Paylasim yerel olarak eklendi, backend kaydi daha sonra tekrar denenebilir."));
    }
  };
  const toggleAudience = () => {
    setAudience((current) => (current === "Everyone" ? "Followers" : "Everyone"));
  };

  const audienceLabel = audience === "Everyone" ? "Herkese Açık" : "Takipçiler";

  const openModal = (modal: Exclude<SocialModal, null>, postId?: string) => {
    setActiveFlowPostId(postId ?? null);
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
    setActiveFlowPostId(null);
  };

  const scrollStories = () => {
    const rail = storyRailRef.current;
    if (!rail) return;
    rail.scrollBy({ left: Math.min(rail.clientWidth - 96, 520), behavior: "smooth" });
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
          <section className="social-story-rail" aria-label="Stories" ref={storyRailRef}>
            <input ref={storyInputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={handleStoryFileChange} />
            {storyItems.map((story, index) => (
              <button type="button" key={`${story.name}-${story.avatar}`} className={story.ownStory ? "social-story-item is-own" : "social-story-item"} onClick={() => setActiveStoryIndex(index)}>
                <span>
                  <img src={story.avatar} alt={story.name} />
                  {story.ownStory ? (
                    <b
                      role="button"
                      tabIndex={0}
                      aria-label="Add to story"
                      onClick={(event) => {
                        event.stopPropagation();
                        openStoryComposer();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          openStoryComposer();
                        }
                      }}
                    >
                      <Plus size={12} />
                    </b>
                  ) : null}
                </span>
                <small>{story.name}</small>
              </button>
            ))}
            <button type="button" className="social-story-next" aria-label="Next stories" onClick={scrollStories}>
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
            <section className="social-composer">
              <div className="social-composer-row">
                <img src={currentUserAvatar} alt={currentUserName} />
                <div className="social-composer-body">
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/svg+xml,image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    multiple
                    className="social-composer-file-input"
                    aria-label="Upload image files"
                    onChange={handleComposerPhotoChange}
                  />
                  <textarea
                    placeholder={`What's happening, ${currentUserName.split(" ")[0] ?? "there"}?`}
                    aria-label="Share a post"
                    value={composerText}
                    onChange={(event) => setComposerText(event.target.value)}
                    onKeyDown={(event) => {
                      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") createPost();
                    }}
                    rows={2}
                  />

                  {composerPhotos.length ? (
                    <div className="social-composer-photo-list" aria-label="Selected photos">
                      {composerPhotos.map((photo) => (
                        <article className="social-composer-photo-card" key={photo.id}>
                          <div className="social-composer-photo-preview">
                            <img src={photo.url} alt={photo.name} />
                            <button
                              type="button"
                              className="social-composer-photo-remove"
                              aria-label={`${photo.name} gorselini kaldir`}
                              onClick={() => removeComposerPhoto(photo.id)}
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <label className="social-composer-photo-note">
                            <span>
                              <ImageIcon size={15} />
                              <strong>{photo.name}</strong>
                              <small>{formatUploadSize(photo.size)}</small>
                            </span>
                            <textarea
                              value={photo.caption}
                              onChange={(event) => updateComposerPhotoCaption(photo.id, event.target.value)}
                              placeholder="Bu fotograf icin aciklama ekle..."
                              rows={3}
                            />
                          </label>
                        </article>
                      ))}
                    </div>
                  ) : null}
                  <div className="social-composer-tools">
                    <div className="social-composer-actions">
                      <button type="button" aria-label="Add photo" title="Photo" onClick={openPhotoPicker}>
                        <ImageIcon size={17} />
                        <span>Photo</span>
                      </button>
                      <button type="button" aria-label="Add video" title="Video">
                        <Video size={17} />
                        <span>Video</span>
                      </button>
                      <button type="button" aria-label="Add location" title="Location">
                        <MapPin size={17} />
                        <span>Location</span>
                      </button>
                      <button type="button" aria-label="Add poll" title="Poll">
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
                    commentsEnabled ? openModal("comments", post.id) : setNotice("Yorumlar sosyal ayarlarinizda kapali.");
                  }
                }}
              >
                <header>
                  <img src={post.avatar} alt={post.author} />
                  <div>
                    <strong>{post.author}</strong>
                    <span>{post.time}</span>
                  </div>
                  <div className="social-post-more-wrap" ref={openPostMenuId === post.id ? postMenuRef : null} data-social-post-menu>
                    <button
                      type="button"
                      className={openPostMenuId === post.id ? "social-post-more is-open" : "social-post-more"}
                      aria-label="Post options"
                      aria-expanded={openPostMenuId === post.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenPostMenuId((current) => (current === post.id ? null : post.id));
                      }}
                    >
                      <MoreVertical size={18} />
                    </button>
                    {openPostMenuId === post.id ? (() => {
                      const isOwnPost = Boolean((user?.id && post.profile?.userId === user.id) || post.handle === currentUserHandle || post.author === currentUserName);

                      return isOwnPost ? (
                        <div className="social-post-options-menu social-post-options-menu--owner" role="menu" onClick={(event) => event.stopPropagation()}>
                          <div className="social-post-options-head">
                            <strong>Gonderi yonetimi</strong>
                            <span>Bu paylasim size ait</span>
                          </div>
                          <button type="button" role="menuitem" onClick={() => handlePostMenuAction("edit", post)}>
                            <Pencil size={17} />
                            <span>Gonderiyi duzenle</span>
                          </button>
                          <button type="button" role="menuitem" onClick={() => handlePostMenuAction("pin", post)}>
                            <Pin size={17} />
                            <span>Akisin ustune sabitle</span>
                          </button>
                          <button type="button" role="menuitem" onClick={() => handlePostMenuAction("stats", post)}>
                            <BarChart3 size={17} />
                            <span>Etkilesim istatistikleri</span>
                          </button>
                          <button type="button" role="menuitem" onClick={() => handlePostMenuAction("share", post)}>
                            <Share2 size={17} />
                            <span>Paylasim baglantisi</span>
                          </button>
                          <button type="button" role="menuitem" className="is-danger" onClick={() => handlePostMenuAction("delete", post)}>
                            <Trash2 size={17} />
                            <span>Gonderiyi kaldir</span>
                          </button>
                        </div>
                      ) : (
                        <div className="social-post-options-menu" role="menu" onClick={(event) => event.stopPropagation()}>
                          <button type="button" role="menuitem" onClick={() => handlePostMenuAction("dismiss", post)}>
                            <EyeOff size={17} />
                            <span>Not interested in this post</span>
                          </button>
                          <button type="button" role="menuitem" onClick={() => handlePostMenuAction("follow", post)}>
                            <UserPlus size={17} />
                            <span>{followedUsers[post.profile?.userId ?? ""] ? "Unfollow" : "Follow"} {post.handle}</span>
                          </button>
                          <button type="button" role="menuitem" onClick={() => handlePostMenuAction("list", post)}>
                            <ListPlus size={17} />
                            <span>{listedPostIds[post.id] ? "Remove from Lists" : "Add/remove from Lists"}</span>
                          </button>
                          <button type="button" role="menuitem" onClick={() => handlePostMenuAction("mute", post)}>
                            <VolumeX size={17} />
                            <span>Mute</span>
                          </button>
                          <button type="button" role="menuitem" className="is-danger" onClick={() => handlePostMenuAction("block", post)}>
                            <Ban size={17} />
                            <span>Block {post.handle}</span>
                          </button>
                        </div>
                      );
                    })() : null}
                  </div>
                  <button
                    className={bookmarkedPosts[post.id] ? "social-bookmark is-active" : "social-bookmark"}
                    type="button"
                    aria-label="Bookmark post"
                    onClick={(event) => {
                      event.stopPropagation();
                      togglePostSave(post.id);
                    }}
                  >
                    <Bookmark size={18} />
                  </button>
                </header>

                {(post.kind ?? "photo") === "text" ? (
                  <div className="social-post-text-body">
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
                      togglePostLike(post.id);
                    }}
                  >
                    <Heart size={18} />
                    <span className="social-reaction-stack" aria-hidden>
                      <img src={currentUserAvatar} alt="" />
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=48&q=80" alt="" />
                      <img src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=48&q=80" alt="" />
                    </span>
                    {post.likes}
                  </button>
                  <button
                    className="social-post-action"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      commentsEnabled ? openModal("comments", post.id) : setNotice("Yorumlar sosyal ayarlarinizda kapali.");
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
            )) : <div className="social-empty-state">Aramanızla eşleşen paylaşım bulunamadı.</div>}
          </div>
        </main>

        <aside className="social-interactions-panel">
          <div className="social-side-toolbar">
            <div className="social-search-wrap">
              <label className="social-search">
                <Search size={16} />
                <input
                  type="search"
                  placeholder="Search users, posts..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </label>
              {userSearchResults.length ? (
                <div className="social-user-search-results">
                  {userSearchResults.map((item) => (
                    <article key={item.id}>
                      <img src={item.avatarUrl ?? avatar} alt={item.name} />
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.handle} · {item.region ?? item.level ?? "AquaScope"}</span>
                      </div>
                      <button type="button" className={followedUsers[item.id] ? "is-active" : ""} onClick={() => toggleAuthorFollow(item.id)}>
                        {followedUsers[item.id] ? "Takipte" : "Takip Et"}
                      </button>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="social-side-actions">
              <NotificationPopover buttonClassName="social-bell" panelClassName="social-notification-panel" iconSize={17} label="Notifications" />
              <FriendRequestsPopover
                addedFriends={addedFriends}
                hiddenFriends={hiddenFriends}
                onToggleAdd={(name) => setAddedFriends((current) => ({ ...current, [name]: !current[name] }))}
                onHide={(name) => setHiddenFriends((current) => ({ ...current, [name]: true }))}
              />
              <div className="social-profile-menu-wrap" ref={profileMenuRef}>
                <button
                  type="button"
                  className={profileMenuOpen ? "social-profile-chip is-open" : "social-profile-chip"}
                  aria-label="Open profile menu"
                  aria-expanded={profileMenuOpen}
                  onClick={() => setProfileMenuOpen((open) => !open)}
                >
                  <img src={currentUserAvatar} alt={currentUserName} />
                  <span />
                  <ChevronDown size={13} />
                </button>
                {profileMenuOpen ? (
                  <div className="social-profile-menu" role="menu">
                    <a href="/platform/profile" role="menuitem" onClick={() => setProfileMenuOpen(false)}>
                      <img src={currentUserAvatar} alt="" />
                      <span><strong>{currentUserName}</strong><small>{currentUserHandle}</small></span>
                    </a>
                    <button type="button" role="menuitem" onClick={() => { setProfileMenuOpen(false); openModal("create"); }}>
                      <Plus size={15} /> Yeni paylasim
                    </button>
                    <button type="button" role="menuitem" onClick={() => { setProfileMenuOpen(false); setActiveTab("Following"); setNotice("Takip ettiginiz kullanicilarin akisi acildi."); }}>
                      <Users size={15} /> Takip akisi
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <SocialPanel title="Friend Suggestions" action="See All" onAction={() => openModal("friends")}>
            <div className="social-suggestion-list">
              {suggestedFriends.map(([name, handle, image]) => (
                <article
                  key={name}
                  role="button"
                  tabIndex={0}
                  onClick={() => openModal("friends")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openModal("friends");
                    }
                  }}
                >
                  <img src={image} alt={name} />
                  <div>
                    <strong>{name}</strong>
                    <span>{handle}</span>
                  </div>
                  <button
                    type="button"
                    className={addedFriends[name] ? "is-active" : ""}
                    aria-label={addedFriends[name] ? `Remove ${name}` : `Add ${name}`}
                    aria-pressed={Boolean(addedFriends[name])}
                    onClick={(event) => {
                      event.stopPropagation();
                      const nextActive = !addedFriends[name];
                      setAddedFriends((current) => ({ ...current, [name]: nextActive }));
                      setNotice(`${name} ${nextActive ? "arkadas listesine eklendi" : "onerilerden cikarildi"}.`);
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </article>
              ))}
            </div>
          </SocialPanel>

          <SocialPanel title="Profile Activity" action="" onAction={() => openModal("members")}>
            <div
              className="social-profile-activity-card"
              role="button"
              tabIndex={0}
              onClick={() => openModal("members")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openModal("members");
                }
              }}
            >
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
            <div
              className="social-event-card"
              role="button"
              tabIndex={0}
              onClick={() => openModal("events")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openModal("events");
                }
              }}
            >
              <time>
                <span>MAY</span>
                25
              </time>
              <div>
                <strong>Lake Clean-up Day</strong>
                <span>May 25, 2024 - 09:00 AM</span>
                <small>Lake Washington</small>
              </div>
              <button type="button" aria-label="Previous event" onClick={(event) => { event.stopPropagation(); setNotice("Onceki etkinlik icin etkinlik listesi acildi."); openModal("events"); }}><ChevronLeft size={16} /></button>
              <button type="button" className={joinedEvent ? "is-joined" : ""} onClick={(event) => { event.stopPropagation(); const nextJoined = !joinedEvent; setJoinedEvent(nextJoined); setNotice(nextJoined ? "Etkinlige katilim kaydedildi." : "Etkinlik katilimi kaldirildi."); }} aria-label="Join event">
                {joinedEvent ? "Joined" : <ChevronRight size={16} />}
              </button>
            </div>
          </SocialPanel>
        </aside>
      </div>
      {activeStoryIndex !== null ? (
        <SocialModalPortal>
          <StoryViewer
            activeIndex={activeStoryIndex}
            stories={storyItems}
            onClose={closeStoryViewer}
            onNext={goToNextStory}
            onPrevious={goToPreviousStory}
            onSelect={setActiveStoryIndex}
            repliesEnabled={storyRepliesEnabled}
            onNotice={setNotice}
          />
        </SocialModalPortal>
      ) : null}

      {activeModal === "comments" ? (
        <SocialModalPortal>
          <PostInteractionModal
            post={visiblePosts.find((post) => post.id === activeFlowPostId) ?? visiblePosts[0] ?? posts[0] ?? feedPosts[0]}
            isBookmarked={Boolean(activeFlowPostId && bookmarkedPosts[activeFlowPostId])}
            isLiked={Boolean(activeFlowPostId && likedPosts[activeFlowPostId])}
            likeCount={(visiblePosts.find((post) => post.id === activeFlowPostId) ?? visiblePosts[0] ?? posts[0] ?? feedPosts[0]).likes}
            commentCount={activeFlowPostId ? (commentCounts[activeFlowPostId] ?? (visiblePosts.find((post) => post.id === activeFlowPostId) ?? visiblePosts[0] ?? posts[0] ?? feedPosts[0]).comments) : 0}
            comments={activeFlowPostId ? (postComments[activeFlowPostId] ?? []) : []}
            isFollowing={Boolean((visiblePosts.find((post) => post.id === activeFlowPostId) ?? visiblePosts[0] ?? posts[0] ?? feedPosts[0]).profile?.userId && followedUsers[(visiblePosts.find((post) => post.id === activeFlowPostId) ?? visiblePosts[0] ?? posts[0] ?? feedPosts[0]).profile!.userId])}
            currentUserName={currentUserName}
            currentUserAvatar={currentUserAvatar}
            onClose={closeModal}
            onToggleBookmark={() => {
              const targetPostId = activeFlowPostId ?? visiblePosts[0]?.id ?? posts[0]?.id;
              if (!targetPostId) return;
              togglePostSave(targetPostId);
            }}
            onToggleLike={() => {
              const targetPostId = activeFlowPostId ?? visiblePosts[0]?.id ?? posts[0]?.id;
              if (!targetPostId) return;
              togglePostLike(targetPostId);
            }}
            onToggleFollow={() => toggleAuthorFollow((visiblePosts.find((post) => post.id === activeFlowPostId) ?? visiblePosts[0] ?? posts[0] ?? feedPosts[0]).profile?.userId)}
            commentsEnabled={commentsEnabled}
            onSubmitComment={(comment) => {
              const targetPostId = activeFlowPostId ?? visiblePosts[0]?.id ?? posts[0]?.id;
              if (!targetPostId) return;
              submitPostComment(targetPostId, comment);
            }}
          />
        </SocialModalPortal>
      ) : activeModal ? (
        <SocialModalPortal>
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
                  author: currentUserName,
                  handle: currentUserHandle,
                  time: "Az once",
                  avatar: currentUserAvatar,
                  kind: modal === "video" ? "video" : "photo",
                  text: composerText.trim() || (modal === "video" ? "Yeni bir av videosu paylaştı." : "Yeni bir av görseli paylaştı."),
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
              setNotice(`${modalCopy[modal].eyebrow} akışı uygulandı.`);
              closeModal();
            }}
            onSaveDraft={() => {
              setNotice("Taslak kaydedildi.");
              closeModal();
            }}
          />
        </SocialModalPortal>
      ) : null}
    </section>
  );
}

function SocialModalPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
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
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const visibleFriends = suggestedFriends.filter(([name]) => !hiddenFriends[name]);
  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (popoverRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div className="social-friend-popover" ref={popoverRef}>
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
  repliesEnabled,
  onNotice,
}: {
  activeIndex: number;
  stories: StoryItem[];
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSelect: (index: number) => void;
  repliesEnabled: boolean;
  onNotice: (message: string) => void;
}) {
  const activeStory = stories[activeIndex];
  const activeStoryOwnerKey = activeStory.ownStory ? "__own_story__" : activeStory.handle;
  const activeUserStories = useMemo(
    () =>
      stories
        .map((story, index) => ({ story, index }))
        .filter(({ story }) => (story.ownStory ? "__own_story__" : story.handle) === activeStoryOwnerKey),
    [activeStoryOwnerKey, stories]
  );
  const activeUserStoryPosition = Math.max(activeUserStories.findIndex(({ index }) => index === activeIndex), 0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [storyOptionsOpen, setStoryOptionsOpen] = useState(false);
  const [storyReply, setStoryReply] = useState("");
  const [storyActions, setStoryActions] = useState<Record<string, typeof storyActionDefaults>>({});
  const replyInputRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef(0);
  const storyDurationMs = 5200;

  const goToNextUserStory = () => {
    const nextStory = activeUserStories[activeUserStoryPosition + 1];
    if (nextStory) {
      onSelect(nextStory.index);
      return;
    }

    onNext();
  };

  const goToPreviousUserStory = () => {
    const previousStory = activeUserStories[activeUserStoryPosition - 1];
    if (previousStory) {
      onSelect(previousStory.index);
      return;
    }

    onPrevious();
  };

  useEffect(() => {
    progressRef.current = 0;
    setProgress(0);
    setStoryOptionsOpen(false);
  }, [activeIndex]);
  useEffect(() => {
    if (isPaused) return;
    const startedAt = performance.now() - (progressRef.current / 100) * storyDurationMs;
    let animationFrame = 0;

    const tick = (now: number) => {
      const nextProgress = Math.min(((now - startedAt) / storyDurationMs) * 100, 100);
      progressRef.current = nextProgress;
      setProgress(nextProgress);

      if (nextProgress >= 100) {
        goToNextUserStory();
        return;
      }

      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [activeIndex, activeUserStoryPosition, activeUserStories, isPaused, onNext, onSelect]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") goToNextUserStory();
      if (event.key === "ArrowLeft") goToPreviousUserStory();
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, activeUserStoryPosition, activeUserStories, onClose, onNext, onPrevious, onSelect]);

  const activeStoryKey = `${activeStory.handle}-${activeStory.time}-${activeStory.image}`;
  const activeStoryActions = storyActions[activeStoryKey] ?? storyActionDefaults;
  const updateStoryActions = (updater: (current: typeof storyActionDefaults) => typeof storyActionDefaults) => {
    setStoryActions((current) => ({
      ...current,
      [activeStoryKey]: updater(current[activeStoryKey] ?? storyActionDefaults),
    }));
  };
  const toggleStoryLike = () => {
    updateStoryActions((current) => {
      const liked = !current.liked;
      return { ...current, liked, likes: Math.max(0, current.likes + (liked ? 1 : -1)) };
    });
  };
  const focusStoryReply = () => {
    if (!repliesEnabled) {
      onNotice("Story yanitlari sosyal ayarlarinizda kapali.");
      return;
    }
    replyInputRef.current?.focus();
  };
  const toggleStoryShare = () => {
    updateStoryActions((current) => ({ ...current, shared: !current.shared, shares: current.shared ? Math.max(0, current.shares - 1) : current.shares + 1 }));
  };
  const toggleStorySave = () => updateStoryActions((current) => ({ ...current, saved: !current.saved }));
  const submitStoryReply = () => {
    if (!repliesEnabled) {
      onNotice("Story yanitlari sosyal ayarlarinizda kapali.");
      return;
    }
    if (!storyReply.trim()) {
      focusStoryReply();
      return;
    }
    updateStoryActions((current) => ({ ...current, comments: current.comments + 1 }));
    setStoryReply("");
  };

  const progressStyle = { "--story-progress": `${progress}%` } as CSSProperties;
  const pauseStory = () => setIsPaused(true);
  const resumeStory = () => setIsPaused(false);

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
                  {story.ownStory ? (<b><Plus size={12} /></b>) : null}
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
            {activeUserStories.map(({ story, index }, timelineIndex) => (
              <span
                key={`${story.handle}-${story.time}-${timelineIndex}-progress`}
                className={timelineIndex < activeUserStoryPosition ? "is-filled" : index === activeIndex ? "is-active" : ""}
                style={index === activeIndex ? progressStyle : undefined}
              >
                <i />
              </span>
            ))}
          </div>

          <div className="social-story-more">
            <button
              type="button"
              aria-label="Story options"
              aria-expanded={storyOptionsOpen}
              onClick={() => setStoryOptionsOpen((open) => !open)}
            >
              <MoreVertical size={21} />
            </button>
            {storyOptionsOpen ? (
              <div className="social-story-more-menu" role="menu">
                <button type="button" role="menuitem" onClick={() => setStoryOptionsOpen(false)}>Story details</button>
                <button type="button" role="menuitem" onClick={() => setStoryOptionsOpen(false)}>Share</button>
                <button type="button" role="menuitem" onClick={() => setStoryOptionsOpen(false)}>Report</button>
              </div>
            ) : null}
          </div>

          <figure className={isPaused ? "social-story-media is-paused" : "social-story-media"} key={`${activeStory.name}-${activeStory.image}`}>
            <img src={activeStory.image} alt={`${activeStory.name} story`} />
          </figure>

          <div
            className="social-story-tap-zones"
            onPointerDown={pauseStory}
            onPointerUp={resumeStory}
            onPointerCancel={resumeStory}
            onPointerLeave={resumeStory}
          >
            <button type="button" aria-label="Previous story content" onClick={goToPreviousUserStory} />
            <button type="button" aria-label="Next story content" onClick={goToNextUserStory} />
          </div>

          <button type="button" className="social-story-nav social-story-nav--previous" aria-label="Previous story" onClick={goToPreviousUserStory}>
            <ChevronLeft size={23} />
          </button>
          <button type="button" className="social-story-nav social-story-nav--next" aria-label="Next story" onClick={goToNextUserStory}>
            <ChevronRight size={23} />
          </button>

          <div className="social-story-caption">
            <p>{activeStory.caption}</p>
            <span><MapPin size={14} />{activeStory.location}</span>
          </div>

          <label className="social-story-reply" onPointerDown={(event) => event.stopPropagation()}>
            <input ref={replyInputRef} type="text" placeholder={repliesEnabled ? "Reply..." : "Story replies disabled"} value={storyReply} disabled={!repliesEnabled} onChange={(event) => setStoryReply(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") submitStoryReply(); }} />
            <button type="button" aria-label="Send reply" onClick={submitStoryReply}>
              <Send size={20} />
            </button>
          </label>
        </main>

        <aside className="social-story-actions">
          <button type="button" className="social-story-close" aria-label="Close story viewer" onClick={onClose}>
            <X size={25} />
          </button>
          <button type="button" className={activeStoryActions.liked ? "is-active" : ""} aria-label="Like story" aria-pressed={activeStoryActions.liked} onClick={toggleStoryLike}><Heart size={24} /><span>{activeStoryActions.likes}</span></button>
          <button type="button" aria-label="Comment story" onClick={focusStoryReply}><MessageCircle size={24} /><span>{activeStoryActions.comments}</span></button>
          <button type="button" className={activeStoryActions.shared ? "is-active" : ""} aria-label="Share story" aria-pressed={activeStoryActions.shared} onClick={toggleStoryShare}><Send size={23} /><span>{activeStoryActions.shares}</span></button>
          <button type="button" className={activeStoryActions.saved ? "is-active" : ""} aria-label="Save story" aria-pressed={activeStoryActions.saved} onClick={toggleStorySave}><Bookmark size={23} /><span>{activeStoryActions.saved ? "Saved" : "Save"}</span></button>
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
  comments,
  isFollowing,
  currentUserName,
  currentUserAvatar,
  commentsEnabled,
  onClose,
  onToggleBookmark,
  onToggleLike,
  onToggleFollow,
  onSubmitComment,
}: {
  post: (typeof feedPosts)[number];
  isBookmarked: boolean;
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
  comments: ApiPostComment[];
  isFollowing: boolean;
  currentUserName: string;
  currentUserAvatar: string;
  commentsEnabled: boolean;
  onClose: () => void;
  onToggleBookmark: () => void;
  onToggleLike: () => void;
  onToggleFollow: () => void;
  onSubmitComment: (comment: string) => void;
}) {
  const [comment, setComment] = useState("");
  const primaryPhoto = post.photos[0];
  const galleryCount = Math.max(6, post.photos.length || 1);
  const location = post.location ?? "Lake Washington";

  const handleSubmit = () => {
    if (!commentsEnabled) return;
    if (!comment.trim()) return;
    onSubmitComment(comment.trim());
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
            <button
              type="button"
              className={isFollowing ? "social-detail-follow is-active" : "social-detail-follow"}
              aria-label={isFollowing ? "Following" : "Follow"}
              aria-pressed={isFollowing}
              title={isFollowing ? "Following" : "Follow"}
              onClick={onToggleFollow}
            >
              <Users size={18} />
            </button>
            <button type="button" className="social-detail-more" aria-label="Post options" title="Post options">
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
            {(comments.length ? comments.map((comment) => ({
              author: comment.author ?? "AquaScope User",
              time: formatFeedTime(comment.createdAt),
              text: comment.body,
              likes: 0,
              avatar: comment.avatar ?? avatar,
            })) : interactionComments).map((item) => (
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
            <img src={currentUserAvatar} alt={currentUserName} />
            <label>
              <input
                type="text"
                value={comment}
                placeholder={commentsEnabled ? "Write a comment..." : "Comments disabled in settings"}
                disabled={!commentsEnabled}
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
              <button type="button" aria-label="Send comment" disabled={!commentsEnabled} onClick={handleSubmit}>
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
                <strong>{isCreate ? "Paylaşım taslağı" : "Akış durumu"}</strong>
                <span>{isCreate ? composerText || "Henüz metin girilmedi." : "Hazır, onay verdiğinizde akışa uygulanacak."}</span>
              </div>
            </div>

            <div className="social-flow-grid">
              <article>
                <span>Hedef Kitle</span>
                <strong>{audience}</strong>
              </article>
              <article>
                <span>Durum</span>
                <strong>{isCreate ? "Yayınlanabilir" : "Hazır"}</strong>
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
            <button type="button" onClick={onClose}>{isRichComposer ? "Cancel" : "Vazgeç"}</button>
            <button type="button" onClick={isCreate ? onCreate : () => onApply(modal)}>
              {modal === "media" ? <><Upload size={18} /> Share Post</> : null}
              {modal === "video" ? <><Upload size={18} /> Share Video</> : null}
              {modal === "location" ? <><Navigation size={18} /> Share Location</> : null}
              {modal === "poll" ? <><BarChart3 size={18} /> Publish Poll</> : null}
              {!isRichComposer ? (isCreate ? "Paylaş" : "Akışı Uygula") : null}
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
            <span>39.2326° N, 26.4412° E</span>
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
          <small>MP4, MOV, WebM up to 500MB · Max 2 minutes</small>
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
            <span>128 MB · 01:24</span>
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
        <small>{locationName} · Accuracy: 25 m</small>
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
              <div><strong>AquaScope</strong><small>Just now · Everyone</small></div>
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
  return <span className="social-check-icon">✓</span>;
}

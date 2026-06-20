import { createHash, randomBytes, timingSafeEqual } from "crypto";
import type { AquaScopeUser } from "../../types/user";
import { demoCredentials } from "../auth";
import { demoUser, socialPosts } from "../constants";
import { prisma } from "./prisma";
import type { Profile, User, UserSettings } from "@prisma/client";

export type StoredProfile = {
  id: string;
  userId: string;
  handle: string;
  region: string;
  level: string;
  bio: string;
  avatarUrl?: string;
  coverUrl?: string;
  interests: string[];
  experience: string;
  visibility: "public" | "followers" | "private";
  onboardingCompleted: boolean;
  catches: number;
  analyses: number;
  createdAt: string;
  updatedAt: string;
};

export type StoredSettings = {
  id: string;
  userId: string;
  addResultsToLibrary: boolean;
  densityAlerts: boolean;
  syncInterval: string;
  emailNotifications: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StoredSocialPost = {
  id: string;
  userId: string;
  kind: "text" | "photo" | "video" | "location" | "poll";
  body: string;
  tags: string[];
  mediaUrls: string[];
  region?: string;
  species?: string;
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
};

function id(prefix: string) {
  return `${prefix}_${Date.now()}_${randomBytes(4).toString("hex")}`;
}

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const digest = createHash("sha256").update(`${salt}:${password}`).digest("hex");
  return `${salt}:${digest}`;
}

function verifyPassword(password: string, passwordHash: string) {
  const [salt, expected] = passwordHash.split(":");
  if (!salt || !expected) return false;
  const actual = hashPassword(password, salt).split(":")[1];
  return timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

function normalizeHandle(name: string) {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 18) || "aquascope";
  return `@${base}`;
}

function toJson(value: unknown) {
  return JSON.stringify(value ?? []);
}

function normalizeVisibility(value: string | null | undefined): AquaScopeUser["visibility"] {
  return value === "followers" || value === "private" ? value : "public";
}

function normalizePostKind(value: string): StoredSocialPost["kind"] {
  return value === "photo" || value === "video" || value === "location" || value === "poll" ? value : "text";
}

function fromJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function compactPatch<T extends Record<string, unknown>>(patch: T): Partial<T> {
  return Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined)) as Partial<T>;
}

function mapUser(user: User, profile?: Profile | null): AquaScopeUser {
  return {
    id: user.id,
    name: user.name,
    handle: profile?.handle ?? normalizeHandle(user.name),
    email: user.email,
    region: profile?.region ?? "Bolge secilmedi",
    level: profile?.level ?? "Yeni uye",
    bio: profile?.bio,
    avatarUrl: profile?.avatarUrl ?? undefined,
    coverUrl: profile?.coverUrl ?? undefined,
    interests: fromJsonArray(profile?.interests),
    experience: profile?.experience,
    visibility: normalizeVisibility(profile?.visibility),
    onboardingCompleted: profile?.onboardingCompleted ?? false,
    createdAt: user.createdAt.toISOString(),
    catches: profile?.catches ?? 0,
    analyses: profile?.analyses ?? 0,
  };
}

function mapSettings(settings: UserSettings): StoredSettings {
  return {
    id: settings.id,
    userId: settings.userId,
    addResultsToLibrary: settings.addResultsToLibrary,
    densityAlerts: settings.densityAlerts,
    syncInterval: settings.syncInterval,
    emailNotifications: settings.emailNotifications,
    createdAt: settings.createdAt.toISOString(),
    updatedAt: settings.updatedAt.toISOString(),
  };
}

async function ensureSeedData() {
  const count = await prisma.user.count();
  if (count > 0) return;

  await prisma.user.create({
    data: {
      id: demoUser.id,
      email: demoCredentials.email,
      passwordHash: hashPassword(demoCredentials.password),
      name: demoUser.name,
      profile: {
        create: {
          id: id("profile"),
          handle: demoUser.handle,
          region: demoUser.region,
          level: demoUser.level,
          bio: demoUser.bio ?? "AquaScope demo profili.",
          avatarUrl: demoUser.avatarUrl,
          coverUrl: demoUser.coverUrl,
          interests: toJson(demoUser.interests ?? ["AI Analiz", "Harita Verisi"]),
          experience: demoUser.experience ?? "Deneyimli",
          visibility: demoUser.visibility ?? "public",
          onboardingCompleted: true,
          catches: demoUser.catches,
          analyses: demoUser.analyses,
        },
      },
      settings: {
        create: {
          id: id("settings"),
        },
      },
      posts: {
        create: socialPosts.map((post) => ({
          id: post.id,
          kind: "text",
          body: post.body,
          tags: toJson([post.species ? `#${post.species}` : "#AquaScope"]),
          mediaUrls: toJson([]),
          region: post.region,
          species: post.species,
          likes: post.likes,
          comments: post.comments,
        })),
      },
    },
  });
}

export async function listUsers() {
  await ensureSeedData();
  const users = await prisma.user.findMany({ include: { profile: true }, orderBy: { createdAt: "desc" } });
  return users.map((user) => mapUser(user, user.profile));
}

export async function registerUser(input: { name: string; email: string; password: string }) {
  await ensureSeedData();
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Bu e-posta ile kayitli bir hesap var.");

  const user = await prisma.user.create({
    data: {
      id: id("user"),
      email,
      passwordHash: hashPassword(input.password),
      name: input.name.trim(),
      profile: {
        create: {
          id: id("profile"),
          handle: normalizeHandle(input.name),
          region: "Bolge secilmedi",
          level: "Yeni uye",
          bio: "AquaScope topluluguna yeni katildi.",
          avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=85",
          coverUrl: "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=1400&q=80",
          interests: toJson([]),
          experience: "Baslangic",
          visibility: "public",
          onboardingCompleted: false,
        },
      },
      settings: {
        create: {
          id: id("settings"),
        },
      },
    },
    include: { profile: true },
  });

  return mapUser(user, user.profile);
}

export async function loginUser(email: string, password: string) {
  await ensureSeedData();
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() }, include: { profile: true } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new Error("E-posta veya sifre hatali.");
  }
  return mapUser(user, user.profile);
}

export async function updateProfile(userId: string, patch: Partial<StoredProfile> & { name?: string }) {
  await ensureSeedData();
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
  if (!user) throw new Error("Kullanici bulunamadi.");

  const profilePatch = compactPatch(patch);
  const handle = profilePatch.handle ? (String(profilePatch.handle).startsWith("@") ? String(profilePatch.handle) : `@${String(profilePatch.handle)}`) : undefined;

  const nextUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: patch.name ? patch.name.trim() : undefined,
      profile: {
        upsert: {
          create: {
            id: id("profile"),
            handle: handle ?? normalizeHandle(patch.name ?? user.name),
            region: String(profilePatch.region ?? "Bolge secilmedi"),
            level: String(profilePatch.level ?? "Yeni uye"),
            bio: String(profilePatch.bio ?? "AquaScope topluluguna yeni katildi."),
            avatarUrl: profilePatch.avatarUrl ? String(profilePatch.avatarUrl) : undefined,
            coverUrl: profilePatch.coverUrl ? String(profilePatch.coverUrl) : undefined,
            interests: toJson(profilePatch.interests),
            experience: String(profilePatch.experience ?? "Baslangic"),
            visibility: String(profilePatch.visibility ?? "public"),
            onboardingCompleted: Boolean(profilePatch.onboardingCompleted),
            catches: typeof profilePatch.catches === "number" ? profilePatch.catches : 0,
            analyses: typeof profilePatch.analyses === "number" ? profilePatch.analyses : 0,
          },
          update: {
            handle,
            region: profilePatch.region ? String(profilePatch.region) : undefined,
            level: profilePatch.level ? String(profilePatch.level) : undefined,
            bio: profilePatch.bio ? String(profilePatch.bio) : undefined,
            avatarUrl: profilePatch.avatarUrl ? String(profilePatch.avatarUrl) : undefined,
            coverUrl: profilePatch.coverUrl ? String(profilePatch.coverUrl) : undefined,
            interests: Array.isArray(profilePatch.interests) ? toJson(profilePatch.interests) : undefined,
            experience: profilePatch.experience ? String(profilePatch.experience) : undefined,
            visibility: profilePatch.visibility ? String(profilePatch.visibility) : undefined,
            onboardingCompleted: typeof profilePatch.onboardingCompleted === "boolean" ? profilePatch.onboardingCompleted : undefined,
            catches: typeof profilePatch.catches === "number" ? profilePatch.catches : undefined,
            analyses: typeof profilePatch.analyses === "number" ? profilePatch.analyses : undefined,
          },
        },
      },
    },
    include: { profile: true },
  });

  return mapUser(nextUser, nextUser.profile);
}

export async function getSettings(userId: string) {
  await ensureSeedData();
  const settings = await prisma.userSettings.upsert({
    where: { userId },
    create: { id: id("settings"), userId },
    update: {},
  });
  return mapSettings(settings);
}

export async function updateSettings(userId: string, patch: Partial<StoredSettings>) {
  await ensureSeedData();
  const settingsPatch = compactPatch(patch);
  const settings = await prisma.userSettings.upsert({
    where: { userId },
    create: {
      id: id("settings"),
      userId,
      addResultsToLibrary: settingsPatch.addResultsToLibrary as boolean | undefined,
      densityAlerts: settingsPatch.densityAlerts as boolean | undefined,
      syncInterval: settingsPatch.syncInterval ? String(settingsPatch.syncInterval) : undefined,
      emailNotifications: settingsPatch.emailNotifications as boolean | undefined,
    },
    update: {
      addResultsToLibrary: settingsPatch.addResultsToLibrary as boolean | undefined,
      densityAlerts: settingsPatch.densityAlerts as boolean | undefined,
      syncInterval: settingsPatch.syncInterval ? String(settingsPatch.syncInterval) : undefined,
      emailNotifications: settingsPatch.emailNotifications as boolean | undefined,
    },
  });
  return mapSettings(settings);
}

export async function listPosts() {
  await ensureSeedData();
  const posts = await prisma.socialPost.findMany({
    include: { user: { include: { profile: true } } },
    orderBy: { createdAt: "desc" },
  });

  return posts.map((post) => ({
    id: post.id,
    userId: post.userId,
    kind: normalizePostKind(post.kind),
    body: post.body,
    tags: fromJsonArray(post.tags),
    mediaUrls: fromJsonArray(post.mediaUrls),
    region: post.region ?? post.user.profile?.region ?? undefined,
    species: post.species ?? undefined,
    likes: post.likes,
    comments: post.comments,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    author: post.user.name,
    handle: post.user.profile?.handle ?? "@aquascope",
    avatar: post.user.profile?.avatarUrl ?? undefined,
    authorProfile: {
      userId: post.userId,
      name: post.user.name,
      handle: post.user.profile?.handle ?? "@aquascope",
      avatarUrl: post.user.profile?.avatarUrl ?? undefined,
      coverUrl: post.user.profile?.coverUrl ?? undefined,
      region: post.user.profile?.region ?? undefined,
      level: post.user.profile?.level ?? undefined,
      bio: post.user.profile?.bio ?? undefined,
    },
  }));
}

export async function createPost(input: { userId: string; body: string; kind?: StoredSocialPost["kind"]; tags?: string[]; mediaUrls?: string[]; region?: string; species?: string }) {
  await ensureSeedData();
  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user) throw new Error("Kullanici bulunamadi.");

  const post = await prisma.socialPost.create({
    data: {
      id: id("post"),
      userId: input.userId,
      kind: input.kind ?? "text",
      body: input.body,
      tags: toJson(input.tags ?? []),
      mediaUrls: toJson(input.mediaUrls ?? []),
      region: input.region,
      species: input.species,
    },
  });
  const posts = await listPosts();
  return posts.find((item) => item.id === post.id) ?? post;
}

export async function setFollow(followerId: string, followingId: string, active: boolean) {
  await ensureSeedData();
  if (followerId === followingId) throw new Error("Kullanici kendisini takip edemez.");

  if (active) {
    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId, followingId } },
      create: { id: id("follow"), followerId, followingId },
      update: {},
    });
  } else {
    await prisma.follow.deleteMany({ where: { followerId, followingId } });
  }

  return prisma.follow.findMany({ where: { followerId } });
}

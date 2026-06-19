import { promises as fs } from "fs";
import path from "path";
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import type { AquaScopeUser } from "../../types/user";
import { demoCredentials } from "../auth";
import { demoUser, socialPosts } from "../constants";

export type StoredUser = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

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

export type StoredFollow = {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
};

type AquaScopeDatabase = {
  users: StoredUser[];
  profiles: StoredProfile[];
  settings: StoredSettings[];
  socialPosts: StoredSocialPost[];
  follows: StoredFollow[];
};

const dbPath = path.join(process.cwd(), "data", "aquascope-db.json");

function now() {
  return new Date().toISOString();
}

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

function createProfile(user: StoredUser, patch: Partial<StoredProfile> = {}): StoredProfile {
  const createdAt = now();
  return {
    id: id("profile"),
    userId: user.id,
    handle: patch.handle ?? normalizeHandle(user.name),
    region: patch.region ?? "Bolge secilmedi",
    level: patch.level ?? "Yeni uye",
    bio: patch.bio ?? "AquaScope topluluguna yeni katildi.",
    avatarUrl: patch.avatarUrl ?? "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=85",
    coverUrl: patch.coverUrl ?? "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=1400&q=80",
    interests: patch.interests ?? [],
    experience: patch.experience ?? "Baslangic",
    visibility: patch.visibility ?? "public",
    onboardingCompleted: patch.onboardingCompleted ?? false,
    catches: patch.catches ?? 0,
    analyses: patch.analyses ?? 0,
    createdAt,
    updatedAt: createdAt,
  };
}

function createSettings(userId: string): StoredSettings {
  const createdAt = now();
  return {
    id: id("settings"),
    userId,
    addResultsToLibrary: true,
    densityAlerts: true,
    syncInterval: "15m",
    emailNotifications: true,
    createdAt,
    updatedAt: createdAt,
  };
}

function compactPatch<T extends Record<string, unknown>>(patch: T): Partial<T> {
  return Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined)) as Partial<T>;
}

function mapUser(user: StoredUser, profile?: StoredProfile): AquaScopeUser {
  return {
    id: user.id,
    name: user.name,
    handle: profile?.handle ?? normalizeHandle(user.name),
    email: user.email,
    region: profile?.region ?? "Bolge secilmedi",
    level: profile?.level ?? "Yeni uye",
    bio: profile?.bio,
    avatarUrl: profile?.avatarUrl,
    coverUrl: profile?.coverUrl,
    interests: profile?.interests ?? [],
    experience: profile?.experience,
    visibility: profile?.visibility,
    onboardingCompleted: profile?.onboardingCompleted ?? false,
    createdAt: user.createdAt,
    catches: profile?.catches ?? 0,
    analyses: profile?.analyses ?? 0,
  };
}

function seedDatabase(): AquaScopeDatabase {
  const createdAt = now();
  const user: StoredUser = {
    id: demoUser.id,
    email: demoCredentials.email,
    passwordHash: hashPassword(demoCredentials.password),
    name: demoUser.name,
    createdAt,
    updatedAt: createdAt,
  };
  const profile = createProfile(user, {
    handle: demoUser.handle,
    region: demoUser.region,
    level: demoUser.level,
    avatarUrl: demoUser.avatarUrl,
    coverUrl: demoUser.coverUrl,
    interests: demoUser.interests ?? ["AI Analiz", "Harita Verisi"],
    experience: demoUser.experience ?? "Deneyimli",
    onboardingCompleted: true,
    catches: demoUser.catches,
    analyses: demoUser.analyses,
  });
  return {
    users: [user],
    profiles: [profile],
    settings: [createSettings(user.id)],
    socialPosts: socialPosts.map((post) => ({
      id: post.id,
      userId: user.id,
      kind: "text",
      body: post.body,
      tags: [post.species ? `#${post.species}` : "#AquaScope"],
      mediaUrls: [],
      region: post.region,
      species: post.species,
      likes: post.likes,
      comments: post.comments,
      createdAt,
      updatedAt: createdAt,
    })),
    follows: [],
  };
}

async function ensureDbFile() {
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  try {
    await fs.access(dbPath);
  } catch {
    await fs.writeFile(dbPath, JSON.stringify(seedDatabase(), null, 2), "utf-8");
  }
}

export async function readDb(): Promise<AquaScopeDatabase> {
  await ensureDbFile();
  const raw = await fs.readFile(dbPath, "utf-8");
  return JSON.parse(raw) as AquaScopeDatabase;
}

async function writeDb(db: AquaScopeDatabase) {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), "utf-8");
}

export async function listUsers() {
  const db = await readDb();
  return db.users.map((user) => mapUser(user, db.profiles.find((profile) => profile.userId === user.id)));
}

export async function registerUser(input: { name: string; email: string; password: string }) {
  const db = await readDb();
  const email = input.email.trim().toLowerCase();
  if (db.users.some((user) => user.email === email)) {
    throw new Error("Bu e-posta ile kayitli bir hesap var.");
  }
  const createdAt = now();
  const user: StoredUser = {
    id: id("user"),
    email,
    passwordHash: hashPassword(input.password),
    name: input.name.trim(),
    createdAt,
    updatedAt: createdAt,
  };
  const profile = createProfile(user);
  db.users.push(user);
  db.profiles.push(profile);
  db.settings.push(createSettings(user.id));
  await writeDb(db);
  return mapUser(user, profile);
}

export async function loginUser(email: string, password: string) {
  const db = await readDb();
  const user = db.users.find((item) => item.email === email.trim().toLowerCase());
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new Error("E-posta veya sifre hatali.");
  }
  return mapUser(user, db.profiles.find((profile) => profile.userId === user.id));
}

export async function updateProfile(userId: string, patch: Partial<StoredProfile> & { name?: string }) {
  const db = await readDb();
  const user = db.users.find((item) => item.id === userId);
  if (!user) throw new Error("Kullanici bulunamadi.");
  if (patch.name) {
    user.name = patch.name.trim();
    user.updatedAt = now();
  }
  const profilePatch = compactPatch(patch);
  const profileIndex = db.profiles.findIndex((item) => item.userId === userId);
  const currentProfile = profileIndex >= 0 ? db.profiles[profileIndex] : createProfile(user);
  const nextProfile: StoredProfile = {
    ...currentProfile,
    ...profilePatch,
    handle: profilePatch.handle ? (String(profilePatch.handle).startsWith("@") ? String(profilePatch.handle) : `@${String(profilePatch.handle)}`) : currentProfile.handle,
    updatedAt: now(),
  };
  if (profileIndex >= 0) db.profiles[profileIndex] = nextProfile;
  else db.profiles.push(nextProfile);
  await writeDb(db);
  return mapUser(user, nextProfile);
}

export async function getSettings(userId: string) {
  const db = await readDb();
  let settings = db.settings.find((item) => item.userId === userId);
  if (!settings) {
    settings = createSettings(userId);
    db.settings.push(settings);
    await writeDb(db);
  }
  return settings;
}

export async function updateSettings(userId: string, patch: Partial<StoredSettings>) {
  const db = await readDb();
  const settingsPatch = compactPatch(patch);
  const index = db.settings.findIndex((item) => item.userId === userId);
  const current = index >= 0 ? db.settings[index] : createSettings(userId);
  const next = { ...current, ...settingsPatch, id: current.id, userId, updatedAt: now() };
  if (index >= 0) db.settings[index] = next;
  else db.settings.push(next);
  await writeDb(db);
  return next;
}

export async function listPosts() {
  const db = await readDb();
  return db.socialPosts
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((post) => {
      const user = db.users.find((item) => item.id === post.userId);
      const profile = db.profiles.find((item) => item.userId === post.userId);
      return {
        ...post,
        author: user?.name ?? "AquaScope User",
        handle: profile?.handle ?? "@aquascope",
        avatar: profile?.avatarUrl,
      };
    });
}

export async function createPost(input: { userId: string; body: string; kind?: StoredSocialPost["kind"]; tags?: string[]; mediaUrls?: string[]; region?: string; species?: string }) {
  const db = await readDb();
  if (!db.users.some((user) => user.id === input.userId)) throw new Error("Kullanici bulunamadi.");
  const createdAt = now();
  const post: StoredSocialPost = {
    id: id("post"),
    userId: input.userId,
    kind: input.kind ?? "text",
    body: input.body,
    tags: input.tags ?? [],
    mediaUrls: input.mediaUrls ?? [],
    region: input.region,
    species: input.species,
    likes: 0,
    comments: 0,
    createdAt,
    updatedAt: createdAt,
  };
  db.socialPosts.unshift(post);
  await writeDb(db);
  return (await listPosts()).find((item) => item.id === post.id) ?? post;
}

export async function setFollow(followerId: string, followingId: string, active: boolean) {
  const db = await readDb();
  if (followerId === followingId) throw new Error("Kullanici kendisini takip edemez.");
  const exists = db.follows.findIndex((item) => item.followerId === followerId && item.followingId === followingId);
  if (active && exists < 0) db.follows.push({ id: id("follow"), followerId, followingId, createdAt: now() });
  if (!active && exists >= 0) db.follows.splice(exists, 1);
  await writeDb(db);
  return db.follows.filter((item) => item.followerId === followerId);
}
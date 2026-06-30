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
  socialProfileVisibility: "public" | "followers" | "private";
  socialAllowComments: boolean;
  socialAllowMentions: boolean;
  socialStoryReplies: boolean;
  socialDirectMessages: "everyone" | "followers" | "none";
  socialShareActivity: boolean;
  socialShowOnlineStatus: boolean;
  socialContentLanguage: "tr" | "en" | "both";
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
  likedByViewer?: boolean;
  savedByViewer?: boolean;
  authorFollowedByViewer?: boolean;
  createdAt: string;
  updatedAt: string;
};
export type StoredLibraryArchiveItem = {
  id: string;
  userId: string;
  species: string;
  latin: string;
  score: number;
  records: number;
  photos: string[];
  tags: string[];
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


async function ensureInteractionTables() {
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "post_likes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "post_likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "SocialPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`);
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "post_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "post_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "SocialPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`);
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "post_saves" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "post_saves_postId_fkey" FOREIGN KEY ("postId") REFERENCES "SocialPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_saves_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "post_likes_postId_userId_key" ON "post_likes"("postId", "userId")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "post_comments_postId_createdAt_idx" ON "post_comments"("postId", "createdAt")`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "post_saves_postId_userId_key" ON "post_saves"("postId", "userId")`);
}
async function ensureLibraryArchiveTable() {
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "species_archive" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "latin" TEXT NOT NULL,
    "score" REAL NOT NULL DEFAULT 0,
    "records" INTEGER NOT NULL DEFAULT 0,
    "photos" TEXT NOT NULL DEFAULT '[]',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "species_archive_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "species_archive_userId_species_key" ON "species_archive"("userId", "species")`);
}
type SettingsRow = UserSettings & {
  socialProfileVisibility?: string | null;
  socialAllowComments?: boolean | number | null;
  socialAllowMentions?: boolean | number | null;
  socialStoryReplies?: boolean | number | null;
  socialDirectMessages?: string | null;
  socialShareActivity?: boolean | number | null;
  socialShowOnlineStatus?: boolean | number | null;
  socialContentLanguage?: string | null;
};

const defaultSocialSettings = {
  socialProfileVisibility: "public" as const,
  socialAllowComments: true,
  socialAllowMentions: true,
  socialStoryReplies: true,
  socialDirectMessages: "followers" as const,
  socialShareActivity: true,
  socialShowOnlineStatus: true,
  socialContentLanguage: "tr" as const,
};

function normalizeBoolean(value: boolean | number | null | undefined, fallback: boolean) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  return fallback;
}

function normalizeProfileVisibility(value: string | null | undefined): StoredSettings["socialProfileVisibility"] {
  return value === "followers" || value === "private" ? value : "public";
}

function normalizeDirectMessages(value: string | null | undefined): StoredSettings["socialDirectMessages"] {
  return value === "everyone" || value === "none" ? value : "followers";
}

function normalizeContentLanguage(value: string | null | undefined): StoredSettings["socialContentLanguage"] {
  return value === "en" || value === "both" ? value : "tr";
}

function ignoreDuplicateColumn(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (!message.toLowerCase().includes("duplicate column")) throw error;
}

async function ensureSettingsColumns() {
  await prisma.$executeRawUnsafe(`ALTER TABLE \"UserSettings\" ADD COLUMN \"socialProfileVisibility\" TEXT NOT NULL DEFAULT 'public'`).catch(ignoreDuplicateColumn);
  await prisma.$executeRawUnsafe('ALTER TABLE "UserSettings" ADD COLUMN "socialAllowComments" BOOLEAN NOT NULL DEFAULT 1').catch(ignoreDuplicateColumn);
  await prisma.$executeRawUnsafe('ALTER TABLE "UserSettings" ADD COLUMN "socialAllowMentions" BOOLEAN NOT NULL DEFAULT 1').catch(ignoreDuplicateColumn);
  await prisma.$executeRawUnsafe('ALTER TABLE "UserSettings" ADD COLUMN "socialStoryReplies" BOOLEAN NOT NULL DEFAULT 1').catch(ignoreDuplicateColumn);
  await prisma.$executeRawUnsafe(`ALTER TABLE \"UserSettings\" ADD COLUMN \"socialDirectMessages\" TEXT NOT NULL DEFAULT 'followers'`).catch(ignoreDuplicateColumn);
  await prisma.$executeRawUnsafe('ALTER TABLE "UserSettings" ADD COLUMN "socialShareActivity" BOOLEAN NOT NULL DEFAULT 1').catch(ignoreDuplicateColumn);
  await prisma.$executeRawUnsafe('ALTER TABLE "UserSettings" ADD COLUMN "socialShowOnlineStatus" BOOLEAN NOT NULL DEFAULT 1').catch(ignoreDuplicateColumn);
  await prisma.$executeRawUnsafe(`ALTER TABLE \"UserSettings\" ADD COLUMN \"socialContentLanguage\" TEXT NOT NULL DEFAULT 'tr'`).catch(ignoreDuplicateColumn);
}

async function readSettingsRow(userId: string, fallback: UserSettings) {
  const rows = await prisma.$queryRawUnsafe<SettingsRow[]>('SELECT * FROM "UserSettings" WHERE "userId" = ? LIMIT 1', userId);
  return rows[0] ?? fallback;
}

function mapSettings(settings: SettingsRow): StoredSettings {
  return {
    id: settings.id,
    userId: settings.userId,
    addResultsToLibrary: settings.addResultsToLibrary,
    densityAlerts: settings.densityAlerts,
    syncInterval: settings.syncInterval,
    emailNotifications: settings.emailNotifications,
    socialProfileVisibility: normalizeProfileVisibility(settings.socialProfileVisibility),
    socialAllowComments: normalizeBoolean(settings.socialAllowComments, defaultSocialSettings.socialAllowComments),
    socialAllowMentions: normalizeBoolean(settings.socialAllowMentions, defaultSocialSettings.socialAllowMentions),
    socialStoryReplies: normalizeBoolean(settings.socialStoryReplies, defaultSocialSettings.socialStoryReplies),
    socialDirectMessages: normalizeDirectMessages(settings.socialDirectMessages),
    socialShareActivity: normalizeBoolean(settings.socialShareActivity, defaultSocialSettings.socialShareActivity),
    socialShowOnlineStatus: normalizeBoolean(settings.socialShowOnlineStatus, defaultSocialSettings.socialShowOnlineStatus),
    socialContentLanguage: normalizeContentLanguage(settings.socialContentLanguage),
    createdAt: settings.createdAt.toISOString(),
    updatedAt: settings.updatedAt.toISOString(),
  };
}

async function ensureSeedData() {
  await ensureInteractionTables();
  await ensureLibraryArchiveTable();
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
  await ensureSettingsColumns();
  const settings = await prisma.userSettings.upsert({
    where: { userId },
    create: { id: id("settings"), userId },
    update: {},
  });
  return mapSettings(await readSettingsRow(userId, settings));
}

export async function updateSettings(userId: string, patch: Partial<StoredSettings>) {
  await ensureSeedData();
  await ensureSettingsColumns();
  const current = await getSettings(userId);
  const settingsPatch = compactPatch(patch);
  const next = {
    ...current,
    ...settingsPatch,
    socialProfileVisibility: normalizeProfileVisibility(settingsPatch.socialProfileVisibility ? String(settingsPatch.socialProfileVisibility) : current.socialProfileVisibility),
    socialDirectMessages: normalizeDirectMessages(settingsPatch.socialDirectMessages ? String(settingsPatch.socialDirectMessages) : current.socialDirectMessages),
    socialContentLanguage: normalizeContentLanguage(settingsPatch.socialContentLanguage ? String(settingsPatch.socialContentLanguage) : current.socialContentLanguage),
    socialAllowComments: typeof settingsPatch.socialAllowComments === "boolean" ? settingsPatch.socialAllowComments : current.socialAllowComments,
    socialAllowMentions: typeof settingsPatch.socialAllowMentions === "boolean" ? settingsPatch.socialAllowMentions : current.socialAllowMentions,
    socialStoryReplies: typeof settingsPatch.socialStoryReplies === "boolean" ? settingsPatch.socialStoryReplies : current.socialStoryReplies,
    socialShareActivity: typeof settingsPatch.socialShareActivity === "boolean" ? settingsPatch.socialShareActivity : current.socialShareActivity,
    socialShowOnlineStatus: typeof settingsPatch.socialShowOnlineStatus === "boolean" ? settingsPatch.socialShowOnlineStatus : current.socialShowOnlineStatus,
  } satisfies StoredSettings;
  const settings = await prisma.userSettings.upsert({
    where: { userId },
    create: {
      id: id("settings"),
      userId,
      addResultsToLibrary: next.addResultsToLibrary,
      densityAlerts: next.densityAlerts,
      syncInterval: next.syncInterval,
      emailNotifications: next.emailNotifications,
    },
    update: {
      addResultsToLibrary: next.addResultsToLibrary,
      densityAlerts: next.densityAlerts,
      syncInterval: next.syncInterval,
      emailNotifications: next.emailNotifications,
    },
  });
  await prisma.$executeRawUnsafe(
    'UPDATE "UserSettings" SET "socialProfileVisibility" = ?, "socialAllowComments" = ?, "socialAllowMentions" = ?, "socialStoryReplies" = ?, "socialDirectMessages" = ?, "socialShareActivity" = ?, "socialShowOnlineStatus" = ?, "socialContentLanguage" = ? WHERE "userId" = ?',
    next.socialProfileVisibility,
    next.socialAllowComments,
    next.socialAllowMentions,
    next.socialStoryReplies,
    next.socialDirectMessages,
    next.socialShareActivity,
    next.socialShowOnlineStatus,
    next.socialContentLanguage,
    userId,
  );
  return mapSettings(await readSettingsRow(userId, settings));
}

export async function listPosts(options: { viewerId?: string | null; followingOnly?: boolean } = {}) {
  await ensureSeedData();

  const followedUserIds = options.viewerId && options.followingOnly
    ? (await prisma.follow.findMany({ where: { followerId: options.viewerId }, select: { followingId: true } })).map((follow) => follow.followingId)
    : [];

  const posts = await prisma.socialPost.findMany({
    where: options.followingOnly ? { userId: { in: followedUserIds } } : undefined,
    include: { user: { include: { profile: true } } },
    orderBy: { createdAt: "desc" },
  });

  const postIds = posts.map((post) => post.id);
  const viewerLikeRows = options.viewerId ? await prisma.$queryRawUnsafe<{ postId: string }[]>("SELECT postId FROM post_likes WHERE userId = ?", options.viewerId) : [];
  const viewerLikes = new Set(viewerLikeRows.map((item) => item.postId).filter((postId) => postIds.includes(postId)));
  const viewerSaveRows = options.viewerId ? await prisma.$queryRawUnsafe<{ postId: string }[]>("SELECT postId FROM post_saves WHERE userId = ?", options.viewerId) : [];
  const viewerSaves = new Set(viewerSaveRows.map((item) => item.postId).filter((postId) => postIds.includes(postId)));
  const viewerFollowRows = options.viewerId ? await prisma.follow.findMany({ where: { followerId: options.viewerId }, select: { followingId: true } }) : [];
  const viewerFollows = new Set(viewerFollowRows.map((item) => item.followingId));

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
    likedByViewer: viewerLikes.has(post.id),
    savedByViewer: viewerSaves.has(post.id),
    authorFollowedByViewer: viewerFollows.has(post.userId),
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

export async function setPostLike(postId: string, userId: string, active: boolean) {
  await ensureSeedData();
  const post = await prisma.socialPost.findUnique({ where: { id: postId } });
  if (!post) throw new Error("Paylasim bulunamadi.");

  const existingRows = await prisma.$queryRawUnsafe<{ id: string }[]>(
    "SELECT id FROM post_likes WHERE postId = ? AND userId = ? LIMIT 1",
    postId,
    userId
  );
  const wasLiked = existingRows.length > 0;

  if (active) {
    await prisma.$executeRawUnsafe(
      "INSERT OR IGNORE INTO post_likes (id, postId, userId, createdAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
      id("like"),
      postId,
      userId
    );
  } else {
    await prisma.$executeRawUnsafe("DELETE FROM post_likes WHERE postId = ? AND userId = ?", postId, userId);
  }

  const nextLikes = active && !wasLiked ? post.likes + 1 : !active && wasLiked ? Math.max(0, post.likes - 1) : post.likes;
  await prisma.socialPost.update({ where: { id: postId }, data: { likes: nextLikes } });
  return { postId, liked: active, likes: nextLikes };
}
export async function setPostSave(postId: string, userId: string, active: boolean) {
  await ensureSeedData();
  const post = await prisma.socialPost.findUnique({ where: { id: postId } });
  if (!post) throw new Error("Paylasim bulunamadi.");

  if (active) {
    await prisma.$executeRawUnsafe(
      "INSERT OR IGNORE INTO post_saves (id, postId, userId, createdAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
      id("save"),
      postId,
      userId
    );
  } else {
    await prisma.$executeRawUnsafe("DELETE FROM post_saves WHERE postId = ? AND userId = ?", postId, userId);
  }

  return { postId, saved: active };
}

export async function listPostComments(postId: string) {
  await ensureSeedData();
  const post = await prisma.socialPost.findUnique({ where: { id: postId } });
  if (!post) throw new Error("Paylasim bulunamadi.");

  return prisma.$queryRawUnsafe<{
    id: string;
    postId: string;
    userId: string;
    body: string;
    createdAt: string;
    author: string | null;
    handle: string | null;
    avatar: string | null;
  }[]>(
    `SELECT pc.id, pc.postId, pc.userId, pc.body, pc.createdAt, u.name as author, p.handle as handle, p.avatarUrl as avatar
     FROM post_comments pc
     LEFT JOIN User u ON u.id = pc.userId
     LEFT JOIN Profile p ON p.userId = pc.userId
     WHERE pc.postId = ?
     ORDER BY pc.createdAt ASC`,
    postId
  );
}
export async function addPostComment(postId: string, userId: string, body: string) {
  await ensureSeedData();
  const content = body.trim();
  if (!content) throw new Error("Yorum bos olamaz.");
  const post = await prisma.socialPost.findUnique({ where: { id: postId } });
  if (!post) throw new Error("Paylasim bulunamadi.");

  const commentId = id("comment");
  await prisma.$executeRawUnsafe(
    "INSERT INTO post_comments (id, postId, userId, body, createdAt, updatedAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
    commentId,
    postId,
    userId,
    content
  );
  const rows = await prisma.$queryRawUnsafe<{ count: number }[]>("SELECT COUNT(*) as count FROM post_comments WHERE postId = ?", postId);
  const commentCount = Number(rows[0]?.count ?? 0);
  const nextComments = Math.max(post.comments + 1, commentCount);
  await prisma.socialPost.update({ where: { id: postId }, data: { comments: nextComments } });
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });

  return {
    id: commentId,
    postId,
    userId,
    body: content,
    createdAt: new Date().toISOString(),
    author: user?.name ?? "AquaScope User",
    handle: user?.profile?.handle ?? "@aquascope",
    avatar: user?.profile?.avatarUrl ?? undefined,
    comments: nextComments,
  };
}

function mapArchiveRow(row: {
  id: string;
  userId: string;
  species: string;
  latin: string;
  score: number;
  records: number;
  photos: string;
  tags: string;
  createdAt: string;
  updatedAt: string;
}): StoredLibraryArchiveItem {
  return {
    id: row.id,
    userId: row.userId,
    species: row.species,
    latin: row.latin,
    score: Number(row.score ?? 0),
    records: Number(row.records ?? 0),
    photos: fromJsonArray(row.photos),
    tags: fromJsonArray(row.tags),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listLibraryArchive(userId: string) {
  await ensureSeedData();
  const rows = await prisma.$queryRawUnsafe<{
    id: string;
    userId: string;
    species: string;
    latin: string;
    score: number;
    records: number;
    photos: string;
    tags: string;
    createdAt: string;
    updatedAt: string;
  }[]>(
    `SELECT id, userId, species, latin, score, records, photos, tags, createdAt, updatedAt
     FROM species_archive
     WHERE userId = ?
     ORDER BY updatedAt DESC`,
    userId
  );
  return rows.map(mapArchiveRow);
}

export async function archiveAnalyzedSpecies(input: {
  userId: string;
  species: string;
  latin?: string;
  score?: number;
  imageUrl?: string;
  tags?: string[];
}) {
  await ensureSeedData();
  const species = input.species.trim();
  if (!species) throw new Error("Tur adi bos olamaz.");

  const latin = input.latin?.trim() || "Bilimsel ad bekleniyor";
  const score = Math.max(0, Math.min(100, Number(input.score ?? 0)));
  const tags = input.tags?.filter(Boolean).length ? input.tags!.filter(Boolean) : ["Analiz", "Arsiv"];
  const existingRows = await prisma.$queryRawUnsafe<{
    id: string;
    userId: string;
    species: string;
    latin: string;
    score: number;
    records: number;
    photos: string;
    tags: string;
    createdAt: string;
    updatedAt: string;
  }[]>(
    `SELECT id, userId, species, latin, score, records, photos, tags, createdAt, updatedAt
     FROM species_archive
     WHERE userId = ? AND species = ?
     LIMIT 1`,
    input.userId,
    species
  );

  const existing = existingRows[0];
  if (existing) {
    const photos = fromJsonArray(existing.photos);
    const nextPhotos = input.imageUrl && !photos.includes(input.imageUrl) ? [input.imageUrl, ...photos].slice(0, 12) : photos;
    const nextTags = Array.from(new Set([...fromJsonArray(existing.tags), ...tags]));
    const nextScore = score > 0 ? Math.max(Number(existing.score ?? 0), score) : Number(existing.score ?? 0);

    await prisma.$executeRawUnsafe(
      `UPDATE species_archive
       SET latin = ?, score = ?, records = records + 1, photos = ?, tags = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      latin,
      nextScore,
      toJson(nextPhotos),
      toJson(nextTags),
      existing.id
    );
  } else {
    await prisma.$executeRawUnsafe(
      `INSERT INTO species_archive (id, userId, species, latin, score, records, photos, tags, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      id("archive"),
      input.userId,
      species,
      latin,
      score,
      toJson(input.imageUrl ? [input.imageUrl] : []),
      toJson(tags)
    );
  }

  const rows = await prisma.$queryRawUnsafe<{
    id: string;
    userId: string;
    species: string;
    latin: string;
    score: number;
    records: number;
    photos: string;
    tags: string;
    createdAt: string;
    updatedAt: string;
  }[]>(
    `SELECT id, userId, species, latin, score, records, photos, tags, createdAt, updatedAt
     FROM species_archive
     WHERE userId = ? AND species = ?
     LIMIT 1`,
    input.userId,
    species
  );
  return rows[0] ? mapArchiveRow(rows[0]) : null;
}

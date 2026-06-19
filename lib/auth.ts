import type { AquaScopeUser } from "../types/user";
import { demoUser } from "./constants";

export const demoCredentials = {
  email: "demo@aquascope.app",
  password: "aquascope123",
};

export type RegisterUserInput = {
  name: string;
  email: string;
};

export function createRegisteredUser({ name, email }: RegisterUserInput): AquaScopeUser {
  const normalizedName = name.trim() || "AquaScope User";
  const handleBase = normalizedName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 18) || "aquascope";

  return {
    id: `u_${Date.now()}`,
    name: normalizedName,
    handle: `@${handleBase}`,
    email: email.trim().toLowerCase(),
    region: "Bolge secilmedi",
    level: "Yeni uye",
    bio: "AquaScope topluluguna yeni katildi.",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=85",
    coverUrl: "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=1400&q=80",
    interests: [],
    experience: "Baslangic",
    visibility: "public",
    onboardingCompleted: false,
    createdAt: new Date().toISOString(),
    catches: 0,
    analyses: 0,
  };
}

export function getDemoSession() {
  return {
    user: {
      ...demoUser,
      email: demoCredentials.email,
      avatarUrl: demoUser.avatarUrl ?? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=85",
      coverUrl: demoUser.coverUrl ?? "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
      onboardingCompleted: true,
    },
    authenticated: true,
  };
}
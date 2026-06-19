export type AquaScopeUser = {
  id: string;
  name: string;
  handle: string;
  email?: string;
  region: string;
  level: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  interests?: string[];
  experience?: string;
  visibility?: "public" | "followers" | "private";
  onboardingCompleted?: boolean;
  createdAt?: string;
  catches: number;
  analyses: number;
};
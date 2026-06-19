import type { AquaScopeUser } from "../types/user";
import { createRegisteredUser, getDemoSession, type RegisterUserInput } from "./auth";

const sessionKey = "aquascope.currentUser";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getStoredUser(): AquaScopeUser | null {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(sessionKey);
    return raw ? (JSON.parse(raw) as AquaScopeUser) : null;
  } catch {
    return null;
  }
}

export function saveStoredUser(user: AquaScopeUser) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(sessionKey, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent("aquascope:user-changed", { detail: user }));
}

export function clearStoredUser() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(sessionKey);
  window.dispatchEvent(new CustomEvent("aquascope:user-changed", { detail: null }));
}

export function createAndStoreUser(input: RegisterUserInput) {
  const user = createRegisteredUser(input);
  saveStoredUser(user);
  return user;
}

export function storeDemoUser() {
  const { user } = getDemoSession();
  saveStoredUser(user);
  return user;
}

export function updateStoredUser(updater: (user: AquaScopeUser) => AquaScopeUser) {
  const current = getStoredUser();
  if (!current) return null;
  const next = updater(current);
  saveStoredUser(next);
  return next;
}
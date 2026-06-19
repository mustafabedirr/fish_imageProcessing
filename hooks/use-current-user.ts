"use client";

import { useCallback, useEffect, useState } from "react";
import type { AquaScopeUser } from "../types/user";
import { clearStoredUser, getStoredUser, saveStoredUser } from "../lib/user-session";

export function useCurrentUser() {
  const [user, setUser] = useState<AquaScopeUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    setReady(true);

    const handleUserChanged = (event: Event) => {
      const customEvent = event as CustomEvent<AquaScopeUser | null>;
      setUser(customEvent.detail ?? getStoredUser());
    };

    window.addEventListener("aquascope:user-changed", handleUserChanged);
    window.addEventListener("storage", handleUserChanged);

    return () => {
      window.removeEventListener("aquascope:user-changed", handleUserChanged);
      window.removeEventListener("storage", handleUserChanged);
    };
  }, []);

  const updateUser = useCallback((patch: Partial<AquaScopeUser>) => {
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };
      saveStoredUser(next);
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    clearStoredUser();
    setUser(null);
  }, []);

  return { user, ready, updateUser, logout };
}
"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface Stash {
  id: string;
  name: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  memberCount: number;
}

interface StashContextType {
  currentStash: Stash | null;
  stashes: Stash[];
  isLoading: boolean;
  setCurrentStash: (stash: Stash) => void;
  refreshStashes: () => Promise<void>;
  createStash: (name: string) => Promise<Stash | null>;
}

const StashContext = createContext<StashContextType | undefined>(undefined);

const STORAGE_KEY = "current-stash-id";

export function StashProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [stashes, setStashes] = useState<Stash[]>([]);
  const [currentStash, setCurrentStashState] = useState<Stash | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStashes = useCallback(async () => {
    if (!session?.user) {
      setStashes([]);
      setCurrentStashState(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/stashes");
      if (!response.ok) throw new Error("Failed to fetch stashes");

      const data: Stash[] = await response.json();
      setStashes(data);

      // Restore saved stash or select first one
      const savedStashId = localStorage.getItem(STORAGE_KEY);
      const savedStash = data.find((s) => s.id === savedStashId);

      if (savedStash) {
        setCurrentStashState(savedStash);
      } else if (data.length > 0) {
        setCurrentStashState(data[0]);
        localStorage.setItem(STORAGE_KEY, data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch stashes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    if (status === "loading") return;
    fetchStashes();
  }, [status, fetchStashes]);

  const setCurrentStash = useCallback((stash: Stash) => {
    setCurrentStashState(stash);
    localStorage.setItem(STORAGE_KEY, stash.id);
  }, []);

  const refreshStashes = useCallback(async () => {
    setIsLoading(true);
    await fetchStashes();
  }, [fetchStashes]);

  const createStash = useCallback(async (name: string): Promise<Stash | null> => {
    try {
      const response = await fetch("/api/stashes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) throw new Error("Failed to create stash");

      const newStash: Stash = await response.json();
      setStashes((prev) => [...prev, newStash]);
      setCurrentStash(newStash);
      return newStash;
    } catch (error) {
      console.error("Failed to create stash:", error);
      return null;
    }
  }, [setCurrentStash]);

  return (
    <StashContext.Provider
      value={{
        currentStash,
        stashes,
        isLoading,
        setCurrentStash,
        refreshStashes,
        createStash,
      }}
    >
      {children}
    </StashContext.Provider>
  );
}

export function useStash() {
  const context = useContext(StashContext);
  if (context === undefined) {
    throw new Error("useStash must be used within a StashProvider");
  }
  return context;
}

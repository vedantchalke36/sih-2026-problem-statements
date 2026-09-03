"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import { useLocalStorage } from "@/hooks/use-local-storage";

interface ShortlistContextValue {
  shortlisted: Set<string>;
  isShortlisted: (psNumber: string) => boolean;
  toggle: (psNumber: string) => void;
  clear: () => void;
}

const ShortlistContext = createContext<ShortlistContextValue | null>(null);

const KEY = "sih2026:shortlist";

export function ShortlistProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useLocalStorage<string[]>(KEY, []);
  const shortlisted = useMemo(() => new Set(raw), [raw]);

  const toggle = useCallback(
    (psNumber: string) => {
      setRaw((prev) =>
        prev.includes(psNumber)
          ? prev.filter((id) => id !== psNumber)
          : [...prev, psNumber],
      );
    },
    [setRaw],
  );

  const clear = useCallback(() => {
    setRaw([]);
  }, [setRaw]);

  const isShortlisted = useCallback(
    (psNumber: string) => shortlisted.has(psNumber),
    [shortlisted],
  );

  const value = useMemo(
    () => ({ shortlisted, isShortlisted, toggle, clear }),
    [shortlisted, isShortlisted, toggle, clear],
  );

  return (
    <ShortlistContext.Provider value={value}>
      {children}
    </ShortlistContext.Provider>
  );
}

export function useShortlist() {
  const ctx = useContext(ShortlistContext);
  if (!ctx) throw new Error("useShortlist must be used within ShortlistProvider");
  return ctx;
}

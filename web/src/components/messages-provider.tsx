"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

type Messages = Record<string, Record<string, string | Record<string, string>>>;

const MessagesContext = createContext<Messages | null>(null);

export function MessagesProvider({
  children,
  messages,
}: {
  children: ReactNode;
  messages: Messages;
}) {
  const value = useMemo(() => messages, [messages]);
  return (
    <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>
  );
}

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined) return path;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : path;
}

function interpolate(
  template: string,
  params: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in params ? String(params[key]) : `{${key}}`,
  );
}

export function useTranslations(namespace: string) {
  const messages = useContext(MessagesContext);
  if (!messages) {
    throw new Error("useTranslations must be used within MessagesProvider");
  }

  const ns = messages[namespace] as Record<string, string> | undefined;

  return useMemo(() => {
    return (key: string, params?: Record<string, string | number>): string => {
      const raw = ns ? getNestedValue(ns, key) : key;
      return params ? interpolate(raw, params) : raw;
    };
  }, [ns]);
}

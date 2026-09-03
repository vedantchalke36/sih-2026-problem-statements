import type { Metadata } from "next";

import { ShortlistView } from "@/components/shortlist-view";
import messages from "../../../messages/en.json";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://sih2026.vuce.in";

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined) return path;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : path;
}

function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => key in params ? String(params[key]) : `{${key}}`);
}

function t(key: string, params?: Record<string, string | number>): string {
  const raw = getNestedValue(messages as Record<string, unknown>, key);
  return params ? interpolate(raw, params) : raw;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: t("shortlist.title"),
    description: t("shortlist.subtitle"),
    alternates: {
      canonical: `${SITE_URL}/shortlist`,
    },
  };
}

export default function ShortlistPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="space-y-2 py-4">
        <h1 className="text-heading-32 sm:text-heading-40">{t("shortlist.title")}</h1>
        <p className="text-copy-14 text-muted-foreground">{t("shortlist.subtitle")}</p>
      </div>
      <ShortlistView />
    </div>
  );
}

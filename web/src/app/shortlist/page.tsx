import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n";

import { ShortlistView } from "@/components/shortlist-view";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://sih2026.vuce.in";

export const metadata: Metadata = {
  title: "My shortlist",
  description:
    "Saved problem statements are stored only in your browser. Use this page to compare and export your shortlisted SIH 2026 statements.",
  alternates: {
    canonical: `${SITE_URL}/shortlist`,
  },
};

export default async function ShortlistPage() {
  const t = await getTranslations("shortlist");

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="space-y-2 py-4">
        <h1 className="text-heading-32 sm:text-heading-40">{t("title")}</h1>
        <p className="text-copy-14 text-muted-foreground">{t("subtitle")}</p>
      </div>
      <ShortlistView />
    </div>
  );
}
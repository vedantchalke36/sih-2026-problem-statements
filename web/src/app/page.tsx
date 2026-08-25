import type { Metadata } from "next";
import { Box, CodeBracket, Globe, Router } from "@/components/icons/geist";
import { getTranslations } from "@/lib/i18n";
import { Suspense } from "react";

import { Explorer } from "@/components/explorer";
import { FreshnessBanner } from "@/components/freshness-banner";
import { JsonLd } from "@/components/json-ld";
import { SearchBar } from "@/components/search-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { StatsSection } from "@/components/stats-section";
import { stats } from "@/lib/ps";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://sih2026.vuce.in";

export const metadata: Metadata = {
  title: "SIH 2026 Problem Statements - Browse All 226",
  description:
    "Search, filter and shortlist all 226 Smart India Hackathon 2026 problem statements.",
  alternates: {
    canonical: `${SITE_URL}/`,
  },
};

export default async function HomePage() {
  const t = await getTranslations();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: "SIH 2026 Problem Statements",
          description:
            "All 226 Smart India Hackathon 2026 problem statements with titles, descriptions, organizations, themes and deadlines.",
          url: "https://sih2026.vuce.in",
          creator: {
            "@type": "Organization",
            name: "Smart India Hackathon",
            url: "https://sih.gov.in",
          },
          license: "https://creativecommons.org/licenses/by/4.0/",
          distribution: [
            {
              "@type": "DataDownload",
              encodingFormat: "application/json",
              contentUrl:
                "https://github.com/vedantchalke36/sih-2026-problem-statements/blob/main/data/sih2026_ps.json",
            },
            {
              "@type": "DataDownload",
              encodingFormat: "text/csv",
              contentUrl:
                "https://github.com/vedantchalke36/sih-2026-problem-statements/blob/main/data/sih2026_ps.csv",
            },
          ],
          variableMeasured: [
            "ps_number",
            "title",
            "description",
            "organization",
            "category",
            "theme",
            "deadline",
          ],
        }}
      />

      <section className="relative overflow-hidden border-b border-border/60 bg-radial-glow py-16 sm:py-24">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 text-center sm:px-6">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/90 px-3.5 py-1 text-label-12 font-medium text-muted-foreground shadow-2xs backdrop-blur-md">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-600 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-green-600" />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-foreground">
              {t("hero.badgeLive")}
            </span>
            <span className="text-border">|</span>
            <span className="text-muted-foreground">{t("hero.badgeAll")}</span>
          </div>

          {/* Heading */}
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-heading-32 sm:text-heading-56 text-balance bg-gradient-to-b from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
              {t("hero.title")}
            </h1>
            <p className="mx-auto max-w-2xl text-copy-18 text-muted-foreground">
              {t("hero.subtitle", {
                total: stats.total,
                software: stats.software,
                hardware: stats.hardware,
              })}
            </p>
          </div>

          {/* SearchBar */}
          <Suspense
            fallback={
              <div className="flex h-12 w-full max-w-2xl items-center justify-center rounded-xl border border-border/80 bg-muted/40">
                <Spinner className="size-4 text-muted-foreground" />
              </div>
            }
          >
            <SearchBar />
          </Suspense>

          {/* Stat Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-label-12 font-medium">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background/80 px-3 py-1.5 font-mono text-muted-foreground backdrop-blur-xs shadow-2xs">
              <Box className="size-3.5 text-gray-700 dark:text-gray-500" />
              <strong className="font-bold text-foreground">{stats.total}</strong>{" "}
              {t("hero.pillTotal")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background/80 px-3 py-1.5 font-mono text-muted-foreground backdrop-blur-xs shadow-2xs">
              <CodeBracket className="size-3.5 text-blue-700 dark:text-blue-600" />
              <strong className="font-bold text-foreground">{stats.software}</strong>{" "}
              {t("hero.pillSoftware")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background/80 px-3 py-1.5 font-mono text-muted-foreground backdrop-blur-xs shadow-2xs">
              <Router className="size-3.5 text-amber-700 dark:text-amber-500" />
              <strong className="font-bold text-foreground">{stats.hardware}</strong>{" "}
              {t("hero.pillHardware")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background/80 px-3 py-1.5 font-mono text-muted-foreground backdrop-blur-xs shadow-2xs">
              <Globe className="size-3.5 text-purple-700 dark:text-purple-500" />
              <strong className="font-bold text-foreground">{stats.orgs.length}</strong>{" "}
              {t("hero.pillOrgs")}
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">
        <FreshnessBanner />
      </div>

      <Suspense
        fallback={
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-4 py-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl border border-border" />
            ))}
          </div>
        }
      >
        <Explorer />
      </Suspense>

      <StatsSection />
    </>
  );
}

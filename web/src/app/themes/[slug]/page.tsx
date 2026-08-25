import type { Metadata } from "next";
import { Flag } from "@/components/icons/geist";
import { getTranslations } from "@/lib/i18n";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { PsCard } from "@/components/ps-card";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { stats } from "@/lib/ps";
import {
  themeBySlug,
  themePs,
  themes,
  themeSlugs,
} from "@/lib/routes";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://sih2026.vuce.in";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(themeBySlug).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const name = themeBySlug[slug];
  if (!name) return {};
  const ps = themePs(name);
  const t = await getTranslations("landing");

  return {
    title: `${name} - SIH 2026 Problem Statements (${ps.length})`,
    description: t("themeDesc", {
      count: ps.length,
      theme: name,
      software: ps.filter((p) => p.category === "Software").length,
      hardware: ps.filter((p) => p.category === "Hardware").length,
    }),
    alternates: {
      canonical: `${SITE_URL}/themes/${slug}`,
    },
  };
}

export default async function ThemePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTranslations("landing");
  const name = themeBySlug[slug];
  if (!name) notFound();

  const ps = themePs(name);
  const software = ps.filter((p) => p.category === "Software").length;
  const hardware = ps.filter((p) => p.category === "Hardware").length;
  const related = themes.filter((n) => n !== name).slice(0, 8);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${name} - SIH 2026 Problem Statements`,
          description: t("themeDesc", {
            count: ps.length,
            theme: name,
            software,
            hardware,
          }),
          url: `${SITE_URL}/themes/${slug}`,
          isPartOf: {
            "@type": "WebSite",
            name: "SIH 2026 Problem Statements",
          },
        }}
      />

      <Breadcrumb className="py-2 text-label-12">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              {t("breadcrumbAll")}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-6 border-b border-border/60 py-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="gap-1.5 px-2.5 py-1">
            <Flag className="size-3.5" />
            <span className="font-mono text-[11px] uppercase tracking-wider">
              {t("breadcrumbThemes")}
            </span>
          </Badge>
        </div>
        <h1 className="text-heading-32 sm:text-heading-40 text-foreground">
          {name}
        </h1>
        <p className="max-w-2xl text-copy-16 text-muted-foreground">
          {t("themeDesc", { count: ps.length, theme: name, software, hardware })}
        </p>
        <div className="flex flex-wrap items-center gap-2.5 text-label-12 font-medium">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background/80 px-3 py-1.5 font-mono text-muted-foreground">
            <strong className="font-bold text-foreground">{ps.length}</strong>{" "}
            {t("statementsCount", { count: ps.length })}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-600/30 bg-blue-600/10 px-3 py-1.5 font-mono text-blue-700 dark:text-blue-600">
            <strong className="font-bold">{software}</strong> {t("software")}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-600/30 bg-amber-600/10 px-3 py-1.5 font-mono text-amber-700 dark:text-amber-500">
            <strong className="font-bold">{hardware}</strong> {t("hardware")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 py-6 md:grid-cols-2 xl:grid-cols-3">
        {ps.map((p) => (
          <PsCard key={p.ps_number} ps={p} />
        ))}
      </div>

      <div className="space-y-3 border-t border-border/60 py-6">
        <h2 className="text-heading-16">{t("relatedThemes")}</h2>
        <div className="flex flex-wrap gap-2">
          {related.map((n) => (
            <Link
              key={n}
              href={`/themes/${themeSlugs[n]}`}
            >
              <Badge
                variant="outline"
                className="cursor-pointer px-2.5 py-1 font-normal transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {n}
                <span className="ml-1.5 font-mono text-[10px] text-muted-foreground">
                  {themePs(n).length}
                </span>
              </Badge>
            </Link>
          ))}
        </div>
        <Link
          href="/"
          className="inline-block text-label-13 font-medium text-blue-700 underline-offset-4 hover:underline dark:text-blue-600"
        >
          {t("viewAll")} ({stats.total})
        </Link>
      </div>
    </div>
  );
}
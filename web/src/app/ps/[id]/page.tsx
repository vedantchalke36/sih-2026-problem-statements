import type { Metadata } from "next";
import { Calendar, ChevronLeft, ChevronRight, Database, External, Flag, Globe } from "@/components/icons/geist";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DeadlineCountdown } from "@/components/deadline-countdown";
import { CopyPsButton } from "@/components/copy-ps-button";
import { Description } from "@/components/description";
import { JsonLd } from "@/components/json-ld";
import { NotesDialog } from "@/components/notes-dialog";
import { PsCard } from "@/components/ps-card";
import { PsOpenInChat } from "@/components/ps-open-in-chat";
import { ShareMenu } from "@/components/share-menu";
import { ShareWhatsAppButton } from "@/components/share-whatsapp";
import { ShortlistButton } from "@/components/shortlist-button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { themeSlugs, orgSlugs } from "@/lib/routes";
import {
  PS_BY_NUMBER,
  problemStatements,
  descriptionExcerpt,
  type ProblemStatement,
} from "@/lib/ps";
import messages from "../../../../messages/en.json";

interface Props {
  params: Promise<{ id: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sih2026.vuce.in";

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

function t(key: string, params?: Record<string, string | number>): string {
  const raw = getNestedValue(messages as Record<string, unknown>, key);
  return params ? interpolate(raw, params) : raw;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return problemStatements.map((ps) => ({ id: ps.ps_number }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const ps = PS_BY_NUMBER.get(id);
  if (!ps) return {};
  const title = `${ps.ps_number} · ${ps.title}`;

  return {
    title,
    description: descriptionExcerpt(ps, 160),
    alternates: {
      canonical: `${SITE_URL}/ps/${ps.ps_number}`,
    },
    openGraph: {
      title,
      description: descriptionExcerpt(ps, 200),
      url: `${SITE_URL}/ps/${ps.ps_number}`,
      type: "article",
    },
  };
}

function similarStatements(ps: ProblemStatement): ProblemStatement[] {
  const sameTheme = problemStatements.filter(
    (p) => p.ps_number !== ps.ps_number && p.theme === ps.theme,
  );
  const sameOrg = problemStatements.filter(
    (p) => p.ps_number !== ps.ps_number && p.org === ps.org,
  );
  const seen = new Set<string>();
  const out: ProblemStatement[] = [];
  for (const p of [...sameTheme, ...sameOrg]) {
    if (out.length >= 6) break;
    if (seen.has(p.ps_number)) continue;
    seen.add(p.ps_number);
    out.push(p);
  }
  return out;
}

export default async function PsPage({ params }: Props) {
  const { id } = await params;
  const ps = PS_BY_NUMBER.get(id);
  if (!ps) notFound();

  const index = problemStatements.findIndex((p) => p.ps_number === ps.ps_number);
  const prev = index > 0 ? problemStatements[index - 1] : null;
  const next = index < problemStatements.length - 1 ? problemStatements[index + 1] : null;
  const similar = similarStatements(ps);

  const meta = [
    { key: "labelOrg", value: ps.org },
    { key: "labelDept", value: ps.department },
    { key: "labelCategory", value: ps.category },
    { key: "labelTheme", value: ps.theme },
    { key: "labelDeadline", value: ps.deadline },
    { key: "labelIdeas", value: ps.ideas },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `${ps.ps_number} - ${ps.title}`,
          description: descriptionExcerpt(ps, 200),
          url: `${SITE_URL}/ps/${ps.ps_number}`,
          isPartOf: {
            "@type": "WebSite",
            name: "SIH 2026 Problem Statements",
          },
          mainEntity: {
            "@type": "CreativeWork",
            name: ps.title,
            identifier: ps.ps_number,
            creator: { "@type": "Organization", name: ps.org },
            about: ps.theme,
            datePublished: ps.scraped_at,
          },
        }}
      />

      <Breadcrumb className="py-2 text-label-12">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              {t("detail.breadcrumbAll")}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="truncate">{ps.theme}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap items-start justify-between gap-4 py-6 border-b border-border/60">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md border border-border/80 bg-muted/60 px-2.5 py-0.5 font-mono text-xs font-bold text-foreground">
              {ps.ps_number}
            </span>
            <DeadlineCountdown ps={ps} />
          </div>
          <h1 className="text-heading-32 sm:text-heading-40 text-foreground">
            {ps.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span
              className={
                ps.category === "Software"
                  ? "inline-flex items-center rounded-full border border-blue-600/30 bg-blue-600/10 px-2.5 py-0.5 font-mono text-[11px] font-medium text-blue-700 dark:text-blue-600"
                  : "inline-flex items-center rounded-full border border-amber-600/30 bg-amber-600/10 px-2.5 py-0.5 font-mono text-[11px] font-medium text-amber-700 dark:text-amber-500"
              }
            >
              {ps.category}
            </span>
            <Link href={`/themes/${themeSlugs[ps.theme]}`}>
              <Badge
                variant="secondary"
                className="gap-1 font-normal text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Flag className="size-3 text-muted-foreground" />
                {ps.theme}
              </Badge>
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <ShortlistButton psNumber={ps.ps_number} variant="outline" size="sm" />
          <CopyPsButton ps={ps} />
          <ShareWhatsAppButton
            text={`${ps.ps_number} · ${ps.title}\n\n${descriptionExcerpt(ps, 500)}\n\n${SITE_URL}/ps/${ps.ps_number}`}
          />
          <PsOpenInChat ps={ps} />
          <ShareMenu ps={ps} />
          <NotesDialog psNumber={ps.ps_number} title={ps.title} />
        </div>
      </div>

      <div className="grid gap-6 pt-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-6">
          <Card className="border-border/80 bg-card">
            <CardContent className="space-y-4 p-5">
              <h2 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                {t("detail.metadata")}
              </h2>
              {meta.map((m) => (
                <div key={m.key} className="space-y-0.5">
                  <p className="font-mono text-label-12 text-muted-foreground uppercase tracking-wider">
                    {t(`detail.${m.key}`)}
                  </p>
                  {m.key === "labelOrg" ? (
                    <Link
                      href={`/orgs/${orgSlugs[ps.org]}`}
                      className="text-label-14 font-semibold text-foreground leading-snug transition-colors hover:text-blue-700 dark:hover:text-blue-600"
                    >
                      {m.value}
                    </Link>
                  ) : (
                    <p className="text-label-14 font-semibold text-foreground leading-snug">
                      {m.value || t("detail.noData")}
                    </p>
                  )}
                </div>
              ))}
              <Separator className="bg-border/60" />
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 rounded-lg border-border/80 text-label-12 text-muted-foreground hover:text-foreground"
                  nativeButton={false}
                  render={
                    <a
                      href={`https://sih.gov.in/sih2026PS`}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <External className="size-3.5" />
                  {t("detail.openOnSih")}
                </Button>
                {ps.dataset_link.trim() && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 rounded-lg border-green-600/30 bg-green-600/10 text-label-12 font-medium text-green-700 dark:text-green-500 hover:bg-green-600/20"
                    nativeButton={false}
                    render={
                      <a
                        href={ps.dataset_link.trim().split(/\s+/)[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <Database className="size-3.5 text-green-700 dark:text-green-500" />
                    {t("detail.viewDataset")}
                  </Button>
                )}
                {ps.contact.trim() && (
                  <p className="text-xs text-muted-foreground">
                    {t("detail.contact", { contact: ps.contact })}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {(prev || next) && (
            <Card className="border-border/80 bg-card">
              <CardContent className="space-y-3 p-4">
                <h2 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {t("detail.quickNav")}
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {prev ? (
                    <Link href={`/ps/${prev.ps_number}`}>
                      <Button variant="ghost" size="sm" className="h-auto w-full flex-col items-start gap-0.5 rounded-lg px-2.5 py-2">
                        <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                          <ChevronLeft className="size-3" /> {t("detail.prev")}
                        </span>
                        <span className="line-clamp-1 font-mono text-xs font-semibold text-foreground">{prev.ps_number}</span>
                      </Button>
                    </Link>
                  ) : (
                    <span />
                  )}
                  {next ? (
                    <Link href={`/ps/${next.ps_number}`}>
                      <Button variant="ghost" size="sm" className="h-auto w-full flex-col items-end gap-0.5 rounded-lg px-2.5 py-2">
                        <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                          {t("detail.next")} <ChevronRight className="size-3" />
                        </span>
                        <span className="line-clamp-1 font-mono text-xs font-semibold text-foreground">{next.ps_number}</span>
                      </Button>
                    </Link>
                  ) : (
                    <span />
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="min-w-0 space-y-6">
          <Card className="border-border/80 bg-card">
            <CardContent className="p-6">
              <h2 className="mb-4 font-mono text-label-12 font-semibold uppercase tracking-wider text-foreground">
                {t("detail.description")}
              </h2>
              <Description text={ps.description} />
            </CardContent>
          </Card>

          {similar.length > 0 && (
            <div className="space-y-4 pt-4">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground flex items-center justify-between">
                <span>{t("detail.similarTitle")}</span>
                <span className="font-sans text-xs font-normal text-muted-foreground">
                  {t("detail.similarSub")}
                </span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {similar.map((p) => (
                  <PsCard key={p.ps_number} ps={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="mt-12 flex items-center justify-center gap-2 border-t border-border/60 pt-6 font-mono text-label-12 text-muted-foreground">
        <Globe className="size-3.5" />
        {t("detail.footerOrg", {
          org: ps.org,
          category: ps.category,
          deadline: ps.deadline,
        })}
        <Calendar className="ml-1 size-3.5" />
      </p>
    </div>
  );
}

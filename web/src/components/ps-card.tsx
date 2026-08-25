"use client";

import { Database, External, Flag, Globe } from "@/components/icons/geist";
import { useTranslations } from "@/lib/i18n";
import { useMemo } from "react";

import { Link } from "@/lib/i18n";

import { DeadlineCountdown } from "@/components/deadline-countdown";
import { Highlight, markQuery } from "@/components/highlight";
import { ShortlistButton } from "@/components/shortlist-button";
import { Card, CardContent } from "@/components/ui/card";
import { descriptionExcerpt, type ProblemStatement } from "@/lib/ps";

export function PsCard({
  ps,
  query = "",
  variant = "grid",
}: {
  ps: ProblemStatement;
  query?: string;
  variant?: "grid" | "list";
}) {
  const title = useMemo(() => markQuery(ps.title, query), [ps.title, query]);
  const excerpt = useMemo(
    () => markQuery(descriptionExcerpt(ps, variant === "list" ? 260 : 180), query),
    [ps, query, variant],
  );

  const isSoftware = ps.category === "Software";
  const t = useTranslations("card");

  const cardClass =
    "group relative overflow-hidden rounded-xl border border-border/70 bg-card/80 transition-all duration-200 hover:border-foreground/25 hover:shadow-lg dark:hover:border-foreground/30 dark:hover:shadow-primary/5" +
    (variant === "grid" ? " flex h-full flex-col" : "");

  const categoryPill = (
    <span
      className={
        isSoftware
          ? "inline-flex items-center rounded-md border border-blue-600/30 bg-blue-600/10 px-2 py-0.5 font-mono text-[11px] font-medium text-blue-700 dark:text-blue-600"
          : "inline-flex items-center rounded-md border border-amber-600/30 bg-amber-600/10 px-2 py-0.5 font-mono text-[11px] font-medium text-amber-700 dark:text-amber-500"
      }
    >
      {ps.category}
    </span>
  );

  const themeTag = (
    <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] font-normal text-muted-foreground transition-colors group-hover:border-border/80">
      <Flag className="size-3 text-muted-foreground/70 shrink-0" />
      <span className="truncate max-w-[150px] sm:max-w-[180px]">{ps.theme}</span>
    </span>
  );

  const datasetTag =
    ps.dataset_link.trim() ? (
      <span className="inline-flex items-center gap-1 rounded-md border border-green-600/30 bg-green-600/10 px-2 py-0.5 font-mono text-[10.5px] font-medium text-green-700 dark:text-green-500">
        <Database className="size-3 text-green-700 dark:text-green-500 shrink-0" />
        Dataset
      </span>
    ) : null;

  const actions = (
    <div className="flex items-center gap-1 shrink-0">
      <div onClick={(e) => e.preventDefault()}>
        <ShortlistButton psNumber={ps.ps_number} variant="outline" size="icon" />
      </div>
    </div>
  );

  if (variant === "list") {
    return (
      <Card className={cardClass}>
        <Link href={`/ps/${ps.ps_number}`} className="flex h-full flex-col">
          <CardContent className="flex flex-1 items-start gap-4 p-5">
            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-md border border-border/60 bg-muted/70 px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground tracking-tight">
                  {ps.ps_number}
                </span>
                {categoryPill}
                {themeTag}
                {datasetTag}
              </div>

              <h3 className="line-clamp-2 text-heading-16 text-foreground transition-colors group-hover:text-primary flex items-start justify-between gap-2">
                <span>
                  <Highlight text={title} />
                </span>
                <External className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </h3>

              <p className="line-clamp-2 text-copy-14 text-muted-foreground">
                <Highlight text={excerpt} />
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5 text-label-12 text-muted-foreground">
                <span className="flex items-center gap-1.5 truncate max-w-[280px]" title={ps.org}>
                  <Globe className="size-3.5 shrink-0 text-muted-foreground/70" />
                  <span className="truncate">{ps.org}</span>
                </span>
                <span className="shrink-0 font-mono text-[11px]">
                  {t("deadline", { deadline: ps.deadline })}
                </span>
                {ps.ideas && (
                  <span className="shrink-0 font-mono text-[11px]">{t("ideas", { ideas: ps.ideas })}</span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2.5">
              <DeadlineCountdown ps={ps} />
              {actions}
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  }

  return (
    <Card className={cardClass}>
      <Link href={`/ps/${ps.ps_number}`} className="flex h-full flex-col">
        <CardContent className="flex flex-1 flex-col justify-between gap-4 p-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center rounded-md border border-border/60 bg-muted/70 px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground tracking-tight shadow-2xs">
                {ps.ps_number}
              </span>
              <div className="flex items-center gap-1.5">
                <DeadlineCountdown ps={ps} />
                {actions}
              </div>
            </div>

            <div className="space-y-2.5">
              <h3 className="line-clamp-2 text-heading-16 text-foreground transition-colors group-hover:text-primary flex items-start justify-between gap-2 leading-snug">
                <span>
                  <Highlight text={title} />
                </span>
                <External className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </h3>

              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {categoryPill}
                {themeTag}
                {datasetTag}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border/40 pt-3 text-xs text-muted-foreground">
            <span
              className="flex items-center gap-1.5 min-w-0 flex-1 text-muted-foreground/90 group-hover:text-foreground/90 transition-colors"
              title={ps.org}
            >
              <Globe className="size-3.5 shrink-0 text-muted-foreground/70" />
              <span className="truncate text-[12px] font-medium">{ps.org}</span>
            </span>
            <span className="shrink-0 font-mono text-[11px] text-muted-foreground/80">{ps.deadline}</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

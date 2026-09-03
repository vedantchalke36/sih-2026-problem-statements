import { Box, ChevronRight, CodeBracket, Router } from "@/components/icons/geist";
import messages from "../../messages/en.json";

import Link from "next/link";
import { stats } from "@/lib/ps";
import { orgSlugs, orgPs, themeSlugs, themePs } from "@/lib/routes";

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

export async function SiteFooter() {

  const themes = Object.entries(themeSlugs).slice(0, 8);
  const orgs = Object.entries(orgSlugs).slice(0, 8);

  const navLink =
    "inline-flex items-center gap-1 text-label-13 text-muted-foreground transition-colors hover:text-foreground";

  return (
    <footer className="mt-auto border-t border-border/80 bg-background/80 backdrop-blur-xs">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-heading-14">{t("header.brand")}</span>
              <span className="hidden text-muted-foreground sm:inline">/</span>
              <span className="hidden text-label-13 text-muted-foreground sm:inline">
                {t("header.brandSub")}
              </span>
            </div>
            <p className="max-w-md text-label-13 text-muted-foreground leading-relaxed">
              {t("footer.desc", {
                count: stats.total,
              })}{" "}
              <a
                href="https://sih.gov.in/sih2026PS"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline underline-offset-3 hover:text-primary transition-colors"
              >
                SIH 2026 Problem Statements
              </a>
            </p>
            <div className="flex flex-wrap gap-2 font-mono text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-muted/40 px-2 py-1">
                <Box className="size-3 text-gray-700 dark:text-gray-500" /> {stats.total} {t("footer.pillTotal")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-muted/40 px-2 py-1">
                <CodeBracket className="size-3 text-blue-700 dark:text-blue-600" /> {stats.software} {t("footer.pillSoftware")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-muted/40 px-2 py-1">
                <Router className="size-3 text-amber-700 dark:text-amber-500" /> {stats.hardware} {t("footer.pillHardware")}
              </span>
            </div>
          </div>

          {/* Browse */}
          <nav aria-label={t("footer.browse")} className="space-y-3">
            <h3 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("footer.browse")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className={navLink}>
                  <ChevronRight className="size-3 text-muted-foreground/60" />
                  {t("footer.allStatements")}
                </Link>
              </li>
              <li>
                <Link href="/shortlist" className={navLink}>
                  <ChevronRight className="size-3 text-muted-foreground/60" />
                  {t("header.shortlist")}
                </Link>
              </li>
              <li>
                <Link href="/themes" className={navLink}>
                  <ChevronRight className="size-3 text-muted-foreground/60" />
                  {t("themes")}
                </Link>
              </li>
              <li>
                <Link href="/orgs" className={navLink}>
                  <ChevronRight className="size-3 text-muted-foreground/60" />
                  {t("orgs")}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Themes */}
          <nav aria-label={t("footer.themes")} className="space-y-3">
            <h3 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("footer.themes")}
            </h3>
            <ul className="space-y-2">
              {themes.map(([name, slug]) => (
                <li key={name}>
                  <Link href={`/themes/${slug}`} className={navLink}>
                    <ChevronRight className="size-3 shrink-0 text-muted-foreground/60" />
                    <span className="truncate">{name}</span>
                    <span className="ml-auto font-mono text-[10px] text-muted-foreground/70">
                      {themePs(name).length}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Organizations */}
          <nav aria-label={t("footer.orgs")} className="space-y-3">
            <h3 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("footer.orgs")}
            </h3>
            <ul className="space-y-2">
              {orgs.map(([name, slug]) => (
                <li key={name}>
                  <Link href={`/orgs/${slug}`} className={navLink}>
                    <ChevronRight className="size-3 shrink-0 text-muted-foreground/60" />
                    <span className="truncate">{name}</span>
                    <span className="ml-auto font-mono text-[10px] text-muted-foreground/70">
                      {orgPs(name).length}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border/60 pt-4 text-center sm:flex-row sm:text-left">
          <p className="text-label-12 text-muted-foreground">{t("footer.disclaimer")}</p>
            <p className="font-mono text-[10px] text-muted-foreground/70">
              {t("footer.madeBy")}{" "}
              <a
                href="https://github.com/vedantchalke36"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground/90 underline underline-offset-3 hover:text-primary transition-colors"
              >
                Vedant Chalke
              </a>{" "}
              · CC-BY-4.0 · MIT
            </p>
        </div>
      </div>
    </footer>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import messages from "../../../messages/en.json";
import { stats } from "@/lib/ps";
import { orgPs, orgs, orgSlugs } from "@/lib/routes";

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
    title: `${t("breadcrumbOrgs")} - SIH 2026 Problem Statements`,
    description: t("orgsIndexDesc", { count: String(orgs.length) }),
    alternates: {
      canonical: `${SITE_URL}/orgs`,
    },
  };
}

export default async function OrgsIndexPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="space-y-3 border-b border-border/60 pb-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {stats.orgs.length} · SIH 2026
        </p>
        <h1 className="text-heading-32 sm:text-heading-40 text-foreground">
          {t("breadcrumbOrgs")}
        </h1>
        <p className="max-w-2xl text-copy-16 text-muted-foreground">
          {t("orgsIndexDesc", { count: orgs.length })}
        </p>
      </div>

      <div className="grid gap-2.5 py-6 sm:grid-cols-2 lg:grid-cols-3">
        {orgs.map((name) => {
          const count = orgPs(name).length;
          return (
            <Link
              key={name}
              href={`/orgs/${orgSlugs[name]}`}
              className="group flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-card/80 px-4 py-3 transition-all hover:border-gray-500 dark:hover:border-gray-500 hover:shadow-md"
            >
              <span className="text-label-14 font-medium text-foreground group-hover:text-primary">
                {name}
              </span>
              <Badge variant="outline" className="font-mono text-[10px] shrink-0">
                {count}
              </Badge>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

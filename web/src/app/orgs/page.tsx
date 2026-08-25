import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { stats } from "@/lib/ps";
import { orgPs, orgs, orgSlugs } from "@/lib/routes";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://sih2026.vuce.in";

export const metadata: Metadata = {
  title: "Organizations - SIH 2026 Problem Statements",
  description: `Browse all ${orgs.length} ministries and organizations submitting problem statements for SIH 2026.`,
  alternates: {
    canonical: `${SITE_URL}/orgs`,
  },
};

export default async function OrgsIndexPage() {
  const t = await getTranslations("landing");

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
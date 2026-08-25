import type { MetadataRoute } from "next";

import { problemStatements } from "@/lib/ps";
import { orgSlugs, themeSlugs } from "@/lib/routes";

export const dynamic = "force-static";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://sih2026.vuce.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const path of ["", "/shortlist"]) {
    entries.push({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: path === "" ? "daily" : "monthly",
      priority: path === "" ? 1 : 0.3,
    });
  }

  for (const [kind, slugs] of [
    ["themes", themeSlugs],
    ["orgs", orgSlugs],
  ] as const) {
    for (const slug of Object.values(slugs)) {
      entries.push({
        url: `${SITE_URL}/${kind}/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  for (const ps of problemStatements) {
    entries.push({
      url: `${SITE_URL}/ps/${ps.ps_number}`,
      lastModified: ps.scraped_at,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  return entries;
}
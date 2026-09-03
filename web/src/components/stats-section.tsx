import { Box, ChartBarPeak, CodeBracket, Globe, Router } from "@/components/icons/geist";
import messages from "../../messages/en.json";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { stats } from "@/lib/ps";

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

export async function StatsSection() {
  return (
    <section aria-label="Statistics" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex items-center gap-2 mb-6">
        <ChartBarPeak className="size-4 text-muted-foreground" />
        <h2 className="text-label-13 font-mono uppercase tracking-wider font-semibold text-foreground">
          {t("stats.title")}
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/80 bg-card/80 transition-all duration-200 hover:border-gray-500 dark:hover:border-gray-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-label-12 font-medium text-muted-foreground">
              {t("stats.totalCard")}
              <Box className="size-4 text-gray-700 dark:text-gray-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-heading-32 text-foreground">{stats.total}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{t("stats.totalSub")}</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/80 transition-all duration-200 hover:border-gray-500 dark:hover:border-gray-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-label-12 font-medium text-muted-foreground">
              {t("stats.softwareCard")}
              <CodeBracket className="size-4 text-blue-700 dark:text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-heading-32 text-foreground">{stats.software}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {t("stats.softwareSub", { percent: ((stats.software / stats.total) * 100).toFixed(0) })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/80 transition-all duration-200 hover:border-gray-500 dark:hover:border-gray-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-label-12 font-medium text-muted-foreground">
              {t("stats.hardwareCard")}
              <Router className="size-4 text-amber-700 dark:text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-heading-32 text-foreground">{stats.hardware}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {t("stats.hardwareSub", { percent: ((stats.hardware / stats.total) * 100).toFixed(0) })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/80 transition-all duration-200 hover:border-gray-500 dark:hover:border-gray-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-label-12 font-medium text-muted-foreground">
              {t("stats.orgsCard")}
              <Globe className="size-4 text-purple-700 dark:text-purple-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-heading-32 text-foreground">{stats.orgs.length}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{t("stats.orgsSub")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="border-border/80 bg-card/80">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-heading-16 flex items-center justify-between">
              {t("stats.themesCard")}
              <span className="font-mono text-[10px] text-muted-foreground">{t("stats.distribution")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5 pt-4">
            {stats.themes.slice(0, 8).map((t) => (
              <div key={t.name} className="flex items-center gap-3">
                <span className="w-48 truncate text-xs font-medium text-foreground">{t.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted/80">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-700 to-blue-500"
                    style={{ width: `${(t.count / stats.themes[0].count) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-xs font-semibold text-muted-foreground">
                  {t.count}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/80">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-heading-16 flex items-center justify-between">
              {t("stats.orgsCard2")}
              <span className="font-mono text-[10px] text-muted-foreground">{t("stats.count")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5 pt-4">
            {stats.orgs.slice(0, 8).map((o) => (
              <div key={o.name} className="flex items-center gap-3">
                <span className="w-48 truncate text-xs font-medium text-foreground">{o.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted/80">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-700 to-purple-500"
                    style={{ width: `${(o.count / stats.orgs[0].count) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-xs font-semibold text-muted-foreground">
                  {o.count}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}


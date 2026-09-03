import { Information } from "@/components/icons/geist";
import messages from "../../messages/en.json";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { problemStatements } from "@/lib/ps";

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

export async function FreshnessBanner() {
  const scraped = problemStatements[0]?.scraped_at;
  if (!scraped) return null;
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
      <Alert className="border-amber-600/30 bg-amber-600/10 text-foreground backdrop-blur-xs rounded-xl">
        <Information className="size-4 text-amber-700 dark:text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <AlertTitle className="font-semibold text-xs flex items-center gap-2">
            <span>{t("banner.title")}</span>
            <span className="rounded border border-amber-600/30 bg-amber-600/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-700 dark:text-amber-500">
              {scraped}
            </span>
          </AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground leading-relaxed">
            {t("banner.desc")}
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
}


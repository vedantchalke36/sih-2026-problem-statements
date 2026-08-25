"use client";

import { MagnifyingGlass, Star } from "@/components/icons/geist";
import { useTranslations } from "@/lib/i18n";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";
import { ThemeToggle } from "@/components/theme-toggle";
import { useShortlist } from "@/hooks/use-shortlist";
import { useMounted } from "@/hooks/use-local-storage";
import { Link } from "@/lib/i18n";

export function SiteHeader({ onOpenCommand }: { onOpenCommand: () => void }) {
  const { shortlisted } = useShortlist();
  const mounted = useMounted();
  const t = useTranslations("header");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 font-medium tracking-tight text-foreground transition-opacity hover:opacity-90"
        >
          <span className="text-heading-14">{t("brand")}</span>
          <span className="hidden text-muted-foreground sm:inline">/</span>
          <span className="hidden text-label-13 text-muted-foreground sm:inline">
            {t("brandSub")}
          </span>
          <Badge
            variant="outline"
            className="hidden font-mono text-[10px] text-muted-foreground sm:inline-flex"
          >
            {t("version")}
          </Badge>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden h-9 w-64 justify-between rounded-lg border-border/80 bg-muted/40 px-3 text-xs text-muted-foreground hover:bg-muted hover:text-foreground md:flex"
            onClick={onOpenCommand}
          >
            <span className="flex items-center gap-2">
              <MagnifyingGlass className="size-3.5 text-muted-foreground" />
              {t("search")}
            </span>
            <Kbd className="pointer-events-none hidden size-5 items-center justify-center shadow-2xs sm:flex">
              ⌘K
            </Kbd>
          </Button>

          <Button
            variant="outline"
            size="icon-sm"
            className="md:hidden"
            aria-label={t("search")}
            onClick={onOpenCommand}
          >
            <MagnifyingGlass className="size-4" />
          </Button>

          <Link href="/shortlist" aria-label={t("shortlist")}>
            <Button
              variant="outline"
              size="sm"
              className="relative h-9 gap-1.5 rounded-lg border-border/80 px-3 text-xs font-medium"
            >
              <Star className="size-3.5" />
              <span className="hidden sm:inline">{t("shortlist")}</span>
              {mounted && shortlisted.size > 0 ? (
                <Badge
                  variant="default"
                  className="ml-0.5 h-4 min-w-4 rounded-full px-1.5 font-mono text-[10px] font-semibold"
                >
                  {shortlisted.size}
                </Badge>
              ) : null}
            </Button>
          </Link>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

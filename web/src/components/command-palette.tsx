"use client";

import { ArrowRight, Box, Clock, Star } from "@/components/icons/geist";
import { useTranslations } from "@/lib/i18n";
import { useMemo, useState } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useRouter } from "@/lib/i18n-client";
import { useRecentSearches } from "@/hooks/use-recent-searches";
import { fuzzySearch } from "@/lib/search";
import { stats } from "@/lib/ps";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const t = useTranslations("palette");
  const { recent, addRecent } = useRecentSearches();
  const [query, setQuery] = useState("");

  const results = useMemo(
    () => (query.trim().length >= 2 ? fuzzySearch(query, 12) : []),
    [query],
  );

  const go = (path: string) => {
    setQuery("");
    onOpenChange(false);
    router.push(path);
  };

  const search = () => {
    addRecent(query);
    go(`/?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setQuery("");
        onOpenChange(next);
      }}
    >
      <CommandInput
        placeholder={t("placeholder")}
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-96 p-2">
        <CommandEmpty className="py-6 text-center text-xs font-mono text-muted-foreground">
          No matching problem statements found.
        </CommandEmpty>

        {query.trim().length >= 2 && (
          <CommandGroup heading={`Matching Statements (${results.length})`}>
            {results.map((ps) => (
              <CommandItem
                key={ps.ps_number}
                value={`${ps.ps_number} ${ps.title}`}
                onSelect={() => {
                  addRecent(query);
                  go(`/ps/${ps.ps_number}`);
                }}
                className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-xs"
              >
                <span className="shrink-0 rounded border border-border/80 bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-foreground">
                  {ps.ps_number}
                </span>
                <span className="truncate text-foreground font-medium">{ps.title}</span>
                <span className="ml-auto shrink-0 font-mono text-[10px] text-muted-foreground">
                  {ps.theme}
                </span>
              </CommandItem>
            ))}
            <CommandItem
              value="__search_all__"
              onSelect={search}
              className="mt-1 flex items-center gap-2 rounded-lg font-medium text-xs text-foreground"
            >
              <ArrowRight className="size-3.5 text-muted-foreground" />
              {t("searchAll", { total: stats.total, query })}
            </CommandItem>
          </CommandGroup>
        )}

        <CommandSeparator className="my-1 bg-border/60" />

        <CommandGroup heading="Navigation">
          <CommandItem value="home" onSelect={() => go("/")} className="rounded-lg text-xs">
            <Box className="size-3.5 text-muted-foreground" />
            {t("home")}
          </CommandItem>
          <CommandItem value="shortlist" onSelect={() => go("/shortlist")} className="rounded-lg text-xs">
            <Star className="size-3.5 text-muted-foreground" />
            {t("shortlist")}
          </CommandItem>
        </CommandGroup>

        {recent.length > 0 && (
          <>
            <CommandSeparator className="my-1 bg-border/60" />
            <CommandGroup heading={t("recent")}>
              {recent.map((r) => (
                <CommandItem
                  key={r}
                  value={`recent_${r}`}
                  onSelect={() => {
                    addRecent(r);
                    go(`/?q=${encodeURIComponent(r)}`);
                  }}
                  className="rounded-lg text-xs text-muted-foreground hover:text-foreground"
                >
                  <Clock className="size-3.5 text-muted-foreground/70" />
                  <span className="truncate">{r}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator className="my-1 bg-border/60" />

        <CommandGroup heading="Browse Top Themes">
          {stats.themes.slice(0, 8).map((theme) => (
            <CommandItem
              key={theme.name}
              value={`theme_${theme.name}`}
              onSelect={() => go(`/?theme=${encodeURIComponent(theme.name)}`)}
              className="rounded-lg text-xs"
            >
              <span className="truncate">{theme.name}</span>
              <span className="ml-auto font-mono text-[10px] font-medium text-muted-foreground">
                {theme.count}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}


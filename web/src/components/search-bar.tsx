"use client";

import { ArrowRight, Clock, Cross, MagnifyingGlass } from "@/components/icons/geist";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "@/components/messages-provider";
import { useMemo, useState } from "react";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useRecentSearches } from "@/hooks/use-recent-searches";
import { fuzzySearch } from "@/lib/search";
import { stats } from "@/lib/ps";

export function SearchBar() {
  const router = useRouter();
  const t = useTranslations("hero");
  const ts = useTranslations("search");
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const { recent, addRecent } = useRecentSearches();
  const [query, setQuery] = useState(urlQuery);
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  const [open, setOpen] = useState(false);

  if (prevUrlQuery !== urlQuery) {
    setPrevUrlQuery(urlQuery);
    setQuery(urlQuery);
  }

  const results = useMemo(
    () => (query.trim().length >= 2 ? fuzzySearch(query, 8) : []),
    [query],
  );

  const hasSuggestions = results.length > 0 || recent.length > 0;

  const submit = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    addRecent(trimmed);
    setOpen(false);
    router.push(`/?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <Popover open={open && hasSuggestions} onOpenChange={setOpen}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(query);
        }}
        className="group relative w-full max-w-2xl"
      >
        <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground" />
        <PopoverTrigger
          nativeButton={false}
          render={<div className="w-full" />}
        >
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={t("searchPlaceholder")}
            className="h-12 rounded-xl border-border/80 bg-background/90 pl-11 pr-20 text-copy-16 shadow-xs backdrop-blur-md transition-all focus-visible:border-gray-500 dark:focus-visible:border-gray-500 focus-visible:ring-1 focus-visible:ring-blue-600/40"
            aria-label={t("searchAria")}
          />
        </PopoverTrigger>
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={ts("clear")}
            className="absolute top-1/2 right-12 size-6 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
          >
            <Cross className="size-3.5" />
          </Button>
        )}
        <Kbd className="pointer-events-none absolute top-1/2 right-3.5 hidden size-5 -translate-y-1/2 items-center justify-center shadow-2xs sm:flex">
          ⏎
        </Kbd>
      </form>

      <PopoverContent
        align="start"
        alignOffset={0}
        sideOffset={8}
        initialFocus={false}
        finalFocus={false}
        className="w-(--anchor-width) max-w-2xl p-2"
      >
        {results.length > 0 && (
          <div className="space-y-1">
            <p className="px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {ts("problemStatements", { count: results.length })}
            </p>
            {results.map((ps) => (
              <button
                key={ps.ps_number}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addRecent(query);
                  setOpen(false);
                  router.push(`/ps/${ps.ps_number}`);
                }}
                className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-copy-14 transition-colors hover:bg-accent/80"
              >
                <span className="shrink-0 rounded border border-border/80 bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-foreground">
                  {ps.ps_number}
                </span>
                <span className="truncate font-medium text-foreground group-hover:text-primary">
                  {ps.title}
                </span>
                <span className="ml-auto shrink-0 font-mono text-[10px] text-muted-foreground">
                  {ps.theme}
                </span>
              </button>
            ))}
          </div>
        )}

        {recent.length > 0 && (
          <div className="mt-1 space-y-1 border-t border-border/60 pt-2">
            <p className="px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {ts("recentSearches")}
            </p>
            {recent.slice(0, 4).map((r) => (
              <button
                key={r}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  submit(r);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-accent/80 hover:text-foreground"
              >
                <Clock className="size-3 text-muted-foreground/70" />
                <span className="truncate">{r}</span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-1 border-t border-border/60 pt-1.5">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              submit(query);
            }}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            <span className="flex items-center gap-2">
              <MagnifyingGlass className="size-3.5 text-muted-foreground" />
              {ts("searchAll", { total: stats.total, query })}
            </span>
            <ArrowRight className="size-3.5 text-muted-foreground" />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

"use client";

import { Star } from "lucide-react";
import { useTranslations } from "@/components/messages-provider";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useShortlist } from "@/hooks/use-shortlist";
import { cn } from "@/lib/utils";

export function ShortlistButton({
  psNumber,
  variant = "ghost",
  size = "icon",
}: {
  psNumber: string;
  variant?: "ghost" | "outline" | "secondary";
  size?: "icon" | "sm";
}) {
  const { isShortlisted, toggle } = useShortlist();
  const active = isShortlisted(psNumber);
  const t = useTranslations("shortlistBtn");

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant={active ? "secondary" : variant}
            size={size}
            className={cn(
              "shrink-0 p-0 shadow-2xs transition-all duration-150",
              size === "icon"
                ? "size-7 rounded-lg border border-border/60"
                : "gap-1.5 text-label-12",
              active
                ? "border-primary/40 bg-primary/15 text-primary hover:bg-primary/25"
                : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/70 hover:text-foreground",
            )}
            aria-label={active ? t("remove") : t("add")}
            aria-pressed={active}
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(psNumber);
            }}
          >
            <Star
              className={cn(
                "size-3.5 transition-transform duration-150",
                active && "scale-110 fill-current",
              )}
            />
            {size === "sm" && (active ? t("remove") : t("add"))}
          </Button>
        }
      />
      <TooltipContent>{active ? t("remove") : t("add")}</TooltipContent>
    </Tooltip>
  );
}

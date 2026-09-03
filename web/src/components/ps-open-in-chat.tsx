"use client";

import { ChevronDown, CursorClick } from "@/components/icons/geist";
import { useTranslations } from "@/components/messages-provider";

import {
  OpenIn,
  OpenInChatGPT,
  OpenInClaude,
  OpenInContent,
  OpenInCursor,
  OpenInLabel,
  OpenInScira,
  OpenInSeparator,
  OpenInT3,
  OpenInv0,
} from "@/components/ai-elements/open-in-chat";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { psChatPrompt, type ProblemStatement } from "@/lib/ps";

export function PsOpenInChat({
  ps,
  size = "sm",
  className,
}: {
  ps: ProblemStatement;
  size?: "sm" | "icon";
  className?: string;
}) {
  const t = useTranslations("openInChat");
  const query = psChatPrompt(ps);

  return (
    <OpenIn query={query}>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size={size === "icon" ? "icon" : "sm"}
            className={cn(
              size === "icon" && "size-7 rounded-lg border-border/60 bg-muted/30 hover:bg-muted/70 text-muted-foreground hover:text-foreground shrink-0 p-0 shadow-2xs",
              size === "sm" && "gap-1.5 text-label-12",
              className,
            )}
            aria-label={t("aria")}
          >
            {size === "icon" ? (
              <CursorClick className="size-3.5" />
            ) : (
              <>
                <CursorClick className="size-3.5" />
                {t("label")}
                <ChevronDown className="size-3.5" />
              </>
            )}
          </Button>
        }
      />
      <OpenInContent>
        <DropdownMenuGroup>
          <OpenInLabel>{t("menuLabel")}</OpenInLabel>
          <OpenInSeparator />
          <OpenInChatGPT />
          <OpenInClaude />
          <OpenInCursor />
          <OpenInScira />
          <OpenInT3 />
          <OpenInv0 />
        </DropdownMenuGroup>
      </OpenInContent>
    </OpenIn>
  );
}

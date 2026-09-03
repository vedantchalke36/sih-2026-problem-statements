"use client";

import { Check, Copy, External, FileText, Link } from "@/components/icons/geist";
import { useTranslations } from "@/components/messages-provider";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { psMarkdown, type ProblemStatement } from "@/lib/ps";

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

function useClipboard(t: TranslateFn) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(
    async (text: string, message: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success(message);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        toast.error(t("error"));
      }
    },
    [t],
  );
  return { copied, copy };
}

export function ShareMenu({ ps }: { ps: ProblemStatement }) {
  const t = useTranslations("share");
  const { copy } = useClipboard(t);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const title = `${ps.ps_number} · ${ps.title}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="sm">{t("trigger")}</Button>}
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t("label", { id: ps.ps_number })}</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => copy(url, t("linkCopied"))}>
          <Link className="size-4" />
          {t("copyLink")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => copy(psMarkdown(ps), t("copied"))}
        >
          <FileText className="size-4" />
          {t("copyMarkdown")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            window.open(
              `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
              "_blank",
              "noopener",
            )
          }
        >
          <External className="size-4" />
          {t("whatsapp")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            window.open(
              `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
              "_blank",
              "noopener",
            )
          }
        >
          <External className="size-4" />
          {t("telegram")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            window.open(
              `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title}\n${url}`)}`,
              "_blank",
              "noopener",
            )
          }
        >
          <Check className="size-4" />
          {t("x")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => copy(url, t("linkCopied"))}>
          <Copy className="size-4" />
          {t("copyLink")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

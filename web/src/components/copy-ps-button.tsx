"use client";

import { Check, Copy } from "@/components/icons/geist";
import { useTranslations } from "@/lib/i18n";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { psMarkdown, type ProblemStatement } from "@/lib/ps";

export function CopyPsButton({
  ps,
  size = "sm",
  className,
}: {
  ps: ProblemStatement;
  size?: "sm" | "icon";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("copyPs");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(psMarkdown(ps));
      setCopied(true);
      toast.success(t("success", { id: ps.ps_number }));
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error(t("error"));
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size={size === "icon" ? "icon" : "sm"}
            className={cn(size === "sm" && "gap-1.5 text-label-12", className)}
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              copy();
            }}
            aria-label={t("label")}
          >
            {copied ? (
              <Check className="size-3.5 text-green-700 dark:text-green-500" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {size === "sm" && (copied ? t("copied") : t("copy"))}
          </Button>
        }
      />
      <TooltipContent>{t("label")}</TooltipContent>
    </Tooltip>
  );
}

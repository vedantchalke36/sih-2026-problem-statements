"use client";

import { Clock } from "@/components/icons/geist";
import { useTranslations } from "@/components/messages-provider";

import { Skeleton } from "@/components/ui/skeleton";
import { useMounted } from "@/hooks/use-local-storage";
import { daysUntil, type ProblemStatement } from "@/lib/ps";

export function DeadlineCountdown({ ps }: { ps: ProblemStatement }) {
  const mounted = useMounted();
  const t = useTranslations("countdown");

  if (!mounted) {
    return <Skeleton className="h-6 w-24 rounded-full shrink-0" />;
  }

  const date = ps.deadline_date ? new Date(ps.deadline_date + "T00:00:00") : null;
  if (!date) return null;

  const days = daysUntil(date);
  let label = t("dueToday");
  let colorStyle =
    "border-green-800 bg-green-700/10 text-green-900 dark:border-green-500 dark:bg-green-600/15 dark:text-green-500";
  if (days > 0) {
    label = days === 1 ? t("dueTomorrow") : t("dueIn", { days });
    if (days <= 15) {
      colorStyle =
        "border-red-800 bg-red-700/10 text-red-900 dark:border-red-500 dark:bg-red-600/15 dark:text-red-500";
    } else if (days <= 45) {
      colorStyle =
        "border-amber-900 bg-amber-700/10 text-amber-900 dark:border-amber-500 dark:bg-amber-600/15 dark:text-amber-500";
    }
  } else if (days < 0) {
    label = t("passed");
    colorStyle =
      "border-gray-700 bg-gray-200/60 text-gray-900 dark:border-gray-600 dark:bg-gray-300/30 dark:text-gray-900";
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[11px] font-semibold tracking-tight whitespace-nowrap shrink-0 ${colorStyle}`}
    >
      <Clock className="size-3 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useTranslations } from "@/components/messages-provider";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <p className="text-6xl font-bold text-muted-foreground">404</p>
      <h1 className="text-heading-24">{t("title")}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">{t("desc")}</p>
      <Button render={<Link href="/" />} nativeButton={false}>
        {t("back")}
      </Button>
    </div>
  );
}

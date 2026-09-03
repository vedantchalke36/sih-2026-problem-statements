"use client";

import { ThemeSwitchDark, ThemeSwitchLight } from "@/components/icons/geist";
import { useTranslations } from "@/components/messages-provider";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMounted } from "@/hooks/use-local-storage";

export function ThemeToggle() {
  const { setTheme } = useTheme();
  const mounted = useMounted();
  const t = useTranslations("header");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="icon" aria-label={t("themeToggle")} />}
      >
        {mounted ? (
          <>
            <ThemeSwitchLight className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <ThemeSwitchDark className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </>
        ) : (
          <ThemeSwitchLight className="size-4" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>{t("themeLight")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>{t("themeDark")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>{t("themeSystem")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

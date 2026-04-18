"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AppLocale, useI18n } from "@/components/i18n/LanguageProvider";

interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;
}

const localeOrder: AppLocale[] = ["id", "en"];

export function LanguageSwitcher({
  className,
  compact = false,
}: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full border border-current/15 bg-white/10 p-1",
        className
      )}
      aria-label={t("common.language")}
    >
      {!compact ? <Languages className="ml-2 h-4 w-4 opacity-80" /> : null}
      {localeOrder.map((entry) => {
        const isActive = locale === entry;
        const label = entry === "id" ? "ID" : "EN";

        return (
          <Button
            key={entry}
            type="button"
            size="sm"
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "h-8 rounded-full px-3 text-xs font-semibold",
              !isActive &&
                "text-inherit hover:bg-white/10 hover:text-inherit",
              isActive && "shadow-none"
            )}
            onClick={() => setLocale(entry)}
            aria-pressed={isActive}
            title={entry === "id" ? t("common.indonesian") : t("common.english")}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
}

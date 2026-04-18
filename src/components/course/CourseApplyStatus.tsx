"use client";

import { cn } from "@/lib/cn";
import { useLanguage } from "@/contexts/LanguageContext";

export function courseIsOpenForApplying(status: string | undefined | null): boolean {
  return (status || "").toLowerCase() === "published";
}

export function CourseApplyStatus({
  status,
  className,
  size = "sm",
}: {
  status: string | undefined | null;
  className?: string;
  size?: "sm" | "xs";
}) {
  const { t } = useLanguage();
  const open = courseIsOpenForApplying(status);
  const text = open ? t.courseStatus.open : t.courseStatus.closed;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium",
        size === "xs" ? "text-[11px]" : "text-xs",
        open ? "text-emerald-700" : "text-red-700",
        className
      )}
    >
      <span
        className={cn(
          "shrink-0 rounded-full",
          open ? "bg-emerald-500" : "bg-red-500",
          size === "xs" ? "h-1.5 w-1.5" : "h-2 w-2"
        )}
        aria-hidden
      />
      {text}
    </span>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Clock, Star, Users, type LucideIcon } from "lucide-react";

const ICONS: Record<"clock" | "book" | "users" | "star", LucideIcon> = {
  clock: Clock,
  book: BookOpen,
  users: Users,
  star: Star,
};

export type AnimatedStatPayload = {
  label: string;
  target: number;
  decimals: number;
  suffix?: string;
  prefix?: string;
  icon: keyof typeof ICONS;
};

function useCountUp(target: number, decimals: number, durationMs: number, startWhenVisible: boolean) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const run = () => {
      if (started.current) return;
      started.current = true;
      const start = performance.now();
      const from = 0;
      const tick = (now: number) => {
        const t = Math.min((now - start) / durationMs, 1);
        const eased = 1 - (1 - t) ** 3;
        const v = from + (target - from) * eased;
        setDisplay(v);
        if (t < 1) requestAnimationFrame(tick);
        else setDisplay(target);
      };
      requestAnimationFrame(tick);
    };

    if (!startWhenVisible) {
      run();
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) run();
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, durationMs, startWhenVisible]);

  const text =
    decimals > 0
      ? display.toFixed(decimals)
      : Math.round(display).toLocaleString();

  return { text, ref };
}

export function AnimatedStats({ items }: { items: AnimatedStatPayload[] }) {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-4 sm:px-6 lg:grid-cols-4 lg:gap-8">
      {items.map((item) => (
        <StatCell key={item.label} item={item} />
      ))}
    </div>
  );
}

function StatCell({ item }: { item: AnimatedStatPayload }) {
  const { text, ref } = useCountUp(item.target, item.decimals, 1600, true);
  const Icon = ICONS[item.icon];
  return (
    <div ref={ref} className="text-center">
      <Icon className="mx-auto mb-3 h-8 w-8 text-blue-600" strokeWidth={1.75} aria-hidden />
      <div className="font-heading text-3xl font-bold tabular-nums text-slate-900 sm:text-4xl">
        {item.prefix ?? ""}
        {text}
        {item.suffix ?? ""}
      </div>
      <div className="mt-1.5 text-sm font-medium text-slate-700">{item.label}</div>
    </div>
  );
}

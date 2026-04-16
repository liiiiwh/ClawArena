"use client";

import { useI18n } from "@/i18n/context";

interface HeroProps {
  stats?: {
    openclawStars: string;
    products: number;
    categories: number;
    platforms: number;
  };
}

export function Hero({ stats }: HeroProps) {
  const { t } = useI18n();
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const openclawStars = stats?.openclawStars ?? "250K+";
  const productCount = stats?.products ?? 65;
  const categoryCount = stats?.categories ?? 8;
  const platformCount = stats?.platforms ?? 20;

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="grid-bg absolute inset-0" />
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan/5 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-cyan/20 bg-cyan/5 px-5 py-2">
            <span className="pulse-glow h-2.5 w-2.5 rounded-full bg-cyan" />
            <span className="font-mono text-sm text-cyan">
              {t("hero.synced")}: {dateStr} {timeStr}
            </span>
          </div>

          <h1 className="font-mono text-4xl font-bold tracking-tight text-text-bright sm:text-6xl lg:text-7xl">
            Claw<span className="gradient-text">Arena</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-dim sm:text-xl">
            {t("hero.subtitle")}
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-8">
            {[
              { value: openclawStars, label: t("hero.stat.stars") },
              { value: `${productCount}+`, label: t("hero.stat.products") },
              { value: `${categoryCount}`, label: t("hero.stat.categories") },
              { value: `${platformCount}+`, label: t("hero.stat.platforms") },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-mono text-2xl font-bold text-cyan sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-text-dim">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="#products"
              className="rounded-lg bg-gradient-to-r from-cyan to-purple px-6 py-2.5 font-mono text-sm font-medium text-bg transition-opacity hover:opacity-90"
            >
              {t("hero.explore")}
            </a>
            <a
              href="#insights"
              className="rounded-lg border border-border px-6 py-2.5 font-mono text-sm text-text-dim transition-all hover:border-cyan hover:text-cyan"
            >
              {t("hero.news")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import type { Insight } from "@/types";
import { useI18n } from "@/i18n/context";

const typeIcons: Record<string, string> = {
  "new-product": "🆕",
  "version-update": "📦",
  "price-change": "💰",
  "news": "📰",
  "trend-inference": "🔍",
};

const typeLabels: Record<string, { en: string; zh: string }> = {
  "new-product": { en: "Discovery", zh: "新发现" },
  "version-update": { en: "Version", zh: "版本更新" },
  "price-change": { en: "Pricing", zh: "定价变化" },
  "news": { en: "News", zh: "新闻" },
  "trend-inference": { en: "Inference", zh: "趋势推断" },
};

interface DailyInsightsProps {
  insights: Insight[];
}

export function DailyInsights({ insights }: DailyInsightsProps) {
  const { locale, t } = useI18n();
  const [expandedId, setExpandedId] = useState<string | null>(
    insights[0]?.id ?? null,
  );

  return (
    <section id="insights" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-8">
        <h2 className="font-mono text-2xl font-bold text-text-bright">
          {t("insights.title")}{" "}
          <span className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/5 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            {locale === "zh" ? "基于扫描数据" : "Data-driven"}
          </span>
        </h2>
        <p className="mt-1 text-sm text-text-dim">
          {locale === "zh"
            ? "基于每日扫描实际检测到的变化生成洞察，所有结论均可溯源"
            : "Insights generated from actual scan diffs — every claim is traceable to sources"}
        </p>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => {
          const isExpanded = expandedId === insight.id;
          const title = locale === "zh" ? insight.title.zh : insight.title.en;
          const summary =
            locale === "zh" ? insight.summary.zh : insight.summary.en;

          return (
            <div
              key={insight.id}
              className={`rounded-xl border transition-all ${
                isExpanded
                  ? "border-cyan/30 bg-cyan/[0.02]"
                  : "border-border bg-bg-card"
              }`}
            >
              <button
                onClick={() =>
                  setExpandedId(isExpanded ? null : insight.id)
                }
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="shrink-0 font-mono text-xs text-text-dim">
                    {insight.date}
                  </span>
                  <h3 className="truncate font-mono text-sm font-bold text-text-bright">
                    {title}
                  </h3>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {insight.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="hidden rounded-full border border-border px-2 py-0.5 text-[9px] text-text-dim sm:inline"
                    >
                      {tag}
                    </span>
                  ))}
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`text-text-dim transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    <path d="M4 6l4 4 4-4" />
                  </svg>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border px-5 pb-5 pt-4">
                  <p className="text-sm leading-relaxed text-text">
                    {summary}
                  </p>

                  <div className="mt-4 space-y-2.5">
                    {insight.observations.map((obs, i) => {
                      const text =
                        locale === "zh" ? obs.fact.zh : obs.fact.en;
                      const label =
                        locale === "zh"
                          ? typeLabels[obs.type]?.zh
                          : typeLabels[obs.type]?.en;
                      const isInference = obs.type === "trend-inference";

                      return (
                        <div
                          key={i}
                          className={`rounded-lg border px-4 py-3 ${
                            isInference
                              ? "border-amber-400/20 bg-amber-400/[0.03]"
                              : "border-border bg-bg-card"
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="mt-0.5 shrink-0 text-xs">
                              {typeIcons[obs.type] ?? "📌"}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider ${
                                    isInference
                                      ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                                      : "bg-cyan/10 text-cyan border border-cyan/20"
                                  }`}
                                >
                                  {label}
                                </span>
                              </div>
                              <p className="text-xs leading-relaxed text-text-dim">
                                {text}
                              </p>
                              <p className="mt-1.5 text-[10px] text-text-dim/50 break-all">
                                {locale === "zh" ? "来源: " : "Source: "}
                                {obs.source}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <span className="text-[10px] text-text-dim mr-1 self-center">
                      {locale === "zh" ? "相关产品:" : "Related:"}
                    </span>
                    {insight.hotProducts.map((pid) => (
                      <span
                        key={pid}
                        className="rounded-full border border-cyan/20 bg-cyan/5 px-2 py-0.5 font-mono text-[10px] text-cyan"
                      >
                        {pid}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

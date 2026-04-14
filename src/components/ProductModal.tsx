"use client";

import { useEffect, useCallback, useRef } from "react";
import type { Product } from "@/types";

const categoryColors: Record<string, string> = {
  "open-source": "text-green-400 border-green-400/30 bg-green-400/5",
  consumer: "text-blue-400 border-blue-400/30 bg-blue-400/5",
  enterprise: "text-amber-400 border-amber-400/30 bg-amber-400/5",
  developer: "text-purple border-purple/30 bg-purple/5",
  hardware: "text-cyan border-cyan/30 bg-cyan/5",
  framework: "text-pink border-pink/30 bg-pink/5",
  "coding-agent": "text-orange-400 border-orange-400/30 bg-orange-400/5",
};

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export function ProductModal({
  product,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: ProductModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset scroll when product changes
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [product.id]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev?.();
      if (e.key === "ArrowRight" && hasNext) onNext?.();
    },
    [onClose, onPrev, onNext, hasPrev, hasNext],
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-border bg-bg shadow-2xl shadow-cyan/5">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{product.logo}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-mono text-xl font-bold text-text-bright">
                  {product.name}
                </h2>
                <span
                  className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
                    categoryColors[product.category] ??
                    "text-text-dim border-border"
                  }`}
                >
                  {product.category}
                </span>
              </div>
              <p className="text-xs text-text-dim">{product.company}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Nav arrows */}
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className="rounded-lg border border-border p-1.5 text-text-dim transition-all hover:border-cyan hover:text-cyan disabled:opacity-20 disabled:hover:border-border disabled:hover:text-text-dim"
              title="Previous (←)"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 4l-4 4 4 4" />
              </svg>
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className="rounded-lg border border-border p-1.5 text-text-dim transition-all hover:border-cyan hover:text-cyan disabled:opacity-20 disabled:hover:border-border disabled:hover:text-text-dim"
              title="Next (→)"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 4l4 4-4 4" />
              </svg>
            </button>
            {/* Close */}
            <button
              onClick={onClose}
              className="ml-2 rounded-lg border border-border p-1.5 text-text-dim transition-all hover:border-red-400 hover:text-red-400"
              title="Close (Esc)"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4l8 8M4 12l8-8" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div ref={scrollRef} className="overflow-y-auto px-6 py-5">
          {/* Description */}
          <p className="text-sm leading-relaxed text-text">
            {product.description}
          </p>

          {/* Latest news */}
          {product.latestNews && (
            <div className="mt-4 rounded-lg border border-cyan/20 bg-cyan/5 px-4 py-2.5">
              <span className="font-mono text-[9px] uppercase tracking-wider text-cyan">
                Latest
              </span>
              <p className="mt-0.5 text-xs text-text">{product.latestNews}</p>
            </div>
          )}

          {/* Meta cards */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-bg-card p-3">
              <span className="font-mono text-[9px] uppercase tracking-wider text-text-dim">
                Launch
              </span>
              <p className="mt-0.5 font-mono text-xs text-text-bright">
                {product.launchDate}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-bg-card p-3">
              <span className="font-mono text-[9px] uppercase tracking-wider text-text-dim">
                Product Updated
              </span>
              <p className="mt-0.5 font-mono text-xs text-text-bright">
                {product.lastUpdate}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-bg-card p-3">
              <span className="font-mono text-[9px] uppercase tracking-wider text-text-dim">
                Pricing
              </span>
              <p className="mt-0.5 font-mono text-xs text-cyan">
                {product.pricingSummary}
              </p>
            </div>
            {product.stars && (
              <div className="rounded-lg border border-border bg-bg-card p-3">
                <span className="font-mono text-[9px] uppercase tracking-wider text-text-dim">
                  Stars / Users
                </span>
                <p className="mt-0.5 font-mono text-xs text-cyan">
                  {product.stars}
                </p>
              </div>
            )}
          </div>

          {/* Pricing tiers */}
          <h3 className="mt-6 font-mono text-sm font-bold text-text-bright">
            Pricing Plans
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {product.pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className="rounded-lg border border-border bg-bg-card p-4"
              >
                <h4 className="font-mono text-xs font-bold text-text-bright">
                  {tier.name}
                </h4>
                <p className="mt-0.5 font-mono text-base text-cyan">
                  {tier.price}
                </p>
                <ul className="mt-2 space-y-1">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-1.5 text-[11px] text-text-dim"
                    >
                      <span className="mt-px text-cyan text-[10px]">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Changelog timeline */}
          {product.changelog && product.changelog.length > 0 && (
            <>
              <h3 className="mt-6 font-mono text-sm font-bold text-text-bright">
                Version History
              </h3>
              <div className="mt-3 relative">
                {/* Timeline line */}
                <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />
                <div className="space-y-3">
                  {product.changelog.map((entry, i) => (
                    <div key={entry.version} className="relative pl-6">
                      {/* Dot */}
                      <div
                        className={`absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-2 ${
                          i === 0
                            ? "border-cyan bg-cyan/30"
                            : "border-border bg-bg-card"
                        }`}
                      />
                      <div className="rounded-lg border border-border bg-bg-card p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-text-bright">
                            {entry.version}
                          </span>
                          <span className="shrink-0 font-mono text-[10px] text-text-dim">
                            {entry.date}
                          </span>
                        </div>
                        <ul className="mt-1.5 space-y-0.5">
                          {entry.highlights.map((h) => (
                            <li
                              key={h}
                              className="flex items-start gap-1.5 text-[11px] text-text-dim"
                            >
                              <span className="mt-px text-[10px] text-cyan">
                                +
                              </span>
                              {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Features */}
          <h3 className="mt-6 font-mono text-sm font-bold text-text-bright">
            Key Features
          </h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {product.features.map((f) => (
              <div
                key={f}
                className="flex items-start gap-2 rounded-lg border border-border bg-bg-card px-3 py-2"
              >
                <span className="text-xs text-cyan">▸</span>
                <span className="text-xs text-text">{f}</span>
              </div>
            ))}
          </div>

          {/* Platforms & Models */}
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <h3 className="font-mono text-sm font-bold text-text-bright">
                Platforms
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {product.platforms.map((p) => (
                  <span
                    key={p}
                    className="rounded-md border border-border bg-bg-card px-2.5 py-1 text-[11px] text-text-dim"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold text-text-bright">
                Models
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {product.models.map((m) => (
                  <span
                    key={m}
                    className="rounded-md border border-border bg-bg-card px-2.5 py-1 text-[11px] text-text-dim"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="mt-5 flex gap-3 border-t border-border pt-4">
            <a
              href={product.website}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-gradient-to-r from-cyan to-purple px-5 py-2 font-mono text-xs font-medium text-bg transition-opacity hover:opacity-90"
            >
              Visit Website ↗
            </a>
            {product.github && (
              <a
                href={product.github}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border px-5 py-2 font-mono text-xs text-text-dim transition-all hover:border-purple hover:text-purple"
              >
                GitHub ↗
              </a>
            )}
          </div>

          {/* Keyboard hint */}
          <p className="mt-4 text-center font-mono text-[10px] text-text-dim/50">
            ← → Navigate products &middot; Esc Close
          </p>
        </div>
      </div>
    </div>
  );
}

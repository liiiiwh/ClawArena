"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/types";
import { categories as defaultCategories } from "@/types";

interface CompareTableProps {
  products: Product[];
  categories?: typeof defaultCategories;
}

export function CompareTable({ products, categories = defaultCategories }: CompareTableProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <section id="compare" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-6">
        <h2 className="font-mono text-2xl font-bold text-text-bright">
          Pricing Compare
        </h2>
        <p className="mt-1 text-sm text-text-dim">
          Full pricing tiers side-by-side
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs transition-all ${
              activeCategory === cat.id
                ? "bg-cyan/10 text-cyan border border-cyan/30"
                : "border border-border text-text-dim hover:border-border-hover hover:text-text"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-card">
              <th className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wider text-text-dim">
                Product
              </th>
              <th className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wider text-text-dim">
                Free Tier
              </th>
              <th className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wider text-text-dim">
                Paid Tiers
              </th>
              <th className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wider text-text-dim">
                Platforms
              </th>
              <th className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wider text-text-dim">
                Updated
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => {
              const freeTier = p.pricingTiers.find(
                (t) =>
                  t.price === "Free" ||
                  t.price === "$0/mo" ||
                  t.price === "$0" ||
                  t.price.toLowerCase().includes("free"),
              );
              const paidTiers = p.pricingTiers.filter((t) => t !== freeTier);

              return (
                <tr
                  key={p.id}
                  className={`border-b border-border transition-colors hover:bg-bg-hover ${
                    i % 2 === 0 ? "bg-bg" : "bg-bg-card/50"
                  }`}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/products/${p.id}`}
                      className="flex items-center gap-2 hover:text-cyan transition-colors"
                    >
                      <span className="text-lg">{p.logo}</span>
                      <div>
                        <span className="font-mono text-xs font-medium text-text-bright">
                          {p.name}
                        </span>
                        <p className="text-[9px] text-text-dim">{p.company}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {freeTier ? (
                      <div>
                        <span className="font-mono text-xs text-green-400">
                          {freeTier.price}
                        </span>
                        <p className="mt-0.5 text-[10px] text-text-dim line-clamp-1">
                          {freeTier.features[0]}
                        </p>
                      </div>
                    ) : (
                      <span className="text-[10px] text-text-dim">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {paidTiers.length > 0 ? (
                        paidTiers.map((t) => (
                          <span
                            key={t.name}
                            className="rounded border border-border bg-bg px-2 py-0.5 text-[10px] text-text-dim"
                          >
                            <span className="font-mono text-cyan">
                              {t.price}
                            </span>{" "}
                            {t.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-text-dim">
                          Open source only
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.platforms.slice(0, 3).map((pl) => (
                        <span
                          key={pl}
                          className="rounded border border-border px-1.5 py-0.5 text-[9px] text-text-dim"
                        >
                          {pl}
                        </span>
                      ))}
                      {p.platforms.length > 3 && (
                        <span className="text-[9px] text-text-dim">
                          +{p.platforms.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-text-dim">
                    {p.lastUpdate}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

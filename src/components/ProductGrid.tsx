"use client";

import { useState } from "react";
import type { Product } from "@/types";
import { categories as defaultCategories } from "@/types";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";
import { useI18n } from "@/i18n/context";

interface ProductGridProps {
  products: Product[];
  categories?: typeof defaultCategories;
}

export function ProductGrid({ products, categories = defaultCategories }: ProductGridProps) {
  const { t } = useI18n();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const filtered = products.filter((p) => {
    const matchesCategory =
      activeCategory === "all" || p.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedProduct =
    selectedIndex !== null ? filtered[selectedIndex] : null;

  return (
    <section id="products" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-mono text-2xl font-bold text-text-bright">
            {t("products.title")}{" "}
            <span className="text-text-dim font-normal text-lg">
              ({filtered.length})
            </span>
          </h2>
          <p className="mt-1 text-sm text-text-dim">
            {t("products.subtitle")}
          </p>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedIndex(null);
          }}
          placeholder={t("products.search")}
          className="rounded-lg border border-border bg-bg-card px-3 py-2 font-mono text-xs text-text placeholder:text-text-dim focus:border-cyan focus:outline-none sm:w-64"
        />
      </div>

      {/* Category filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
              setSelectedIndex(null);
            }}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs transition-all ${
              activeCategory === cat.id
                ? "bg-cyan/10 text-cyan border border-cyan/30"
                : "border border-border text-text-dim hover:border-border-hover hover:text-text"
            }`}
          >
            {t(`cat.${cat.id}`)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg-card p-12 text-center">
          <p className="font-mono text-sm text-text-dim">
            {t("products.empty")}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => setSelectedIndex(i)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedProduct && selectedIndex !== null && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedIndex(null)}
          onPrev={() => setSelectedIndex(selectedIndex - 1)}
          onNext={() => setSelectedIndex(selectedIndex + 1)}
          hasPrev={selectedIndex > 0}
          hasNext={selectedIndex < filtered.length - 1}
        />
      )}
    </section>
  );
}

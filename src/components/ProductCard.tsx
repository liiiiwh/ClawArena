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

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <button
      onClick={onClick}
      className="card-glow group block w-full rounded-xl border border-border bg-bg-card p-4 text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{product.logo}</span>
          <div>
            <h3 className="font-mono text-sm font-bold text-text-bright group-hover:text-cyan transition-colors">
              {product.name}
            </h3>
            <p className="text-[10px] text-text-dim">{product.company}</p>
          </div>
        </div>
        <span
          className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
            categoryColors[product.category] ?? "text-text-dim border-border"
          }`}
        >
          {product.category}
        </span>
      </div>

      <p className="mt-2 text-xs text-text-dim line-clamp-1">
        {product.tagline}
      </p>

      {/* Pricing + Product update time */}
      <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5">
        <span className="font-mono text-[11px] text-cyan">
          {product.pricingSummary}
        </span>
        <span className="text-[10px] text-text-dim" title="Product last updated">
          🔄 {product.lastUpdate}
        </span>
      </div>

      {/* Latest news snippet */}
      {product.latestNews && (
        <div className="mt-2 rounded-md bg-cyan/5 px-2.5 py-1.5 border border-cyan/10">
          <p className="text-[10px] text-cyan/80 line-clamp-1">
            📢 {product.latestNews}
          </p>
        </div>
      )}
    </button>
  );
}

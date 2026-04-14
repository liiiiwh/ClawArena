import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductById, getProducts } from "@/lib/kv";
import type { Metadata } from "next";

// Fully static — all product pages generated at build time
export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const products = await getProducts();
    return products.map((p) => ({ id: p.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: "Not Found — ClawArena" };
  return {
    title: `${product.name} — ClawArena`,
    description: product.description,
  };
}

const categoryColors: Record<string, string> = {
  "open-source": "text-green-400 border-green-400/30 bg-green-400/5",
  consumer: "text-blue-400 border-blue-400/30 bg-blue-400/5",
  enterprise: "text-amber-400 border-amber-400/30 bg-amber-400/5",
  developer: "text-purple border-purple/30 bg-purple/5",
  hardware: "text-cyan border-cyan/30 bg-cyan/5",
  framework: "text-pink border-pink/30 bg-pink/5",
  "coding-agent": "text-orange-400 border-orange-400/30 bg-orange-400/5",
};

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-text-dim">
        <Link href="/" className="hover:text-cyan transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/#products" className="hover:text-cyan transition-colors">
          Products
        </Link>
        <span>/</span>
        <span className="text-text">{product.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="text-5xl">{product.logo}</span>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-mono text-3xl font-bold text-text-bright">
                {product.name}
              </h1>
              <span
                className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                  categoryColors[product.category] ??
                  "text-text-dim border-border"
                }`}
              >
                {product.category}
              </span>
            </div>
            <p className="mt-1 text-sm text-text-dim">{product.company}</p>
            <p className="mt-2 text-sm leading-relaxed text-text">
              {product.description}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
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
      </div>

      {/* Latest news */}
      {product.latestNews && (
        <div className="mt-6 rounded-xl border border-cyan/20 bg-cyan/5 px-5 py-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-cyan">
            Latest News
          </span>
          <p className="mt-1 text-sm text-text">{product.latestNews}</p>
        </div>
      )}

      {/* Meta grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-bg-card p-4">
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-dim">
            Launch Date
          </span>
          <p className="mt-1 font-mono text-sm text-text-bright">
            {product.launchDate}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-bg-card p-4">
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-dim">
            Last Updated
          </span>
          <p className="mt-1 font-mono text-sm text-text-bright">
            {product.lastUpdate}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-bg-card p-4">
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-dim">
            {product.stars ? "Stars / Users" : "Pricing"}
          </span>
          <p className="mt-1 font-mono text-sm text-cyan">
            {product.stars ?? product.pricingSummary}
          </p>
        </div>
      </div>

      {/* Pricing tiers */}
      <section className="mt-10">
        <h2 className="font-mono text-xl font-bold text-text-bright">
          Pricing Plans
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {product.pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className="rounded-xl border border-border bg-bg-card p-5 transition-all hover:border-border-hover"
            >
              <h3 className="font-mono text-sm font-bold text-text-bright">
                {tier.name}
              </h3>
              <p className="mt-1 font-mono text-lg text-cyan">{tier.price}</p>
              <ul className="mt-3 space-y-1.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-text-dim">
                    <span className="mt-0.5 text-cyan">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mt-10">
        <h2 className="font-mono text-xl font-bold text-text-bright">
          Key Features
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {product.features.map((f) => (
            <div
              key={f}
              className="flex items-start gap-3 rounded-lg border border-border bg-bg-card p-3"
            >
              <span className="text-cyan">▸</span>
              <span className="text-sm text-text">{f}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Platforms & Models */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <section>
          <h2 className="font-mono text-xl font-bold text-text-bright">
            Platforms
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.platforms.map((p) => (
              <span
                key={p}
                className="rounded-lg border border-border bg-bg-card px-3 py-1.5 text-xs text-text-dim"
              >
                {p}
              </span>
            ))}
          </div>
        </section>
        <section>
          <h2 className="font-mono text-xl font-bold text-text-bright">
            Supported Models
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.models.map((m) => (
              <span
                key={m}
                className="rounded-lg border border-border bg-bg-card px-3 py-1.5 text-xs text-text-dim"
              >
                {m}
              </span>
            ))}
          </div>
        </section>
      </div>

      {/* Tags */}
      <div className="mt-8 flex flex-wrap gap-2">
        {product.tags.map((t) => (
          <span
            key={t}
            className="rounded-full border border-border bg-bg px-3 py-1 font-mono text-[10px] text-text-dim"
          >
            #{t}
          </span>
        ))}
      </div>

      {/* Back link */}
      <div className="mt-10 border-t border-border pt-6">
        <Link
          href="/#products"
          className="font-mono text-sm text-text-dim transition-colors hover:text-cyan"
        >
          ← Back to all products
        </Link>
      </div>
    </div>
  );
}

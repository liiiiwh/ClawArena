// ===== Product Types =====

export interface PricingTier {
  name: string;
  price: string;
  features: string[];
}

export interface ChangelogEntry {
  version: string;
  date: string;
  highlights: string[];
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  company: string;
  website: string;
  github?: string;
  logo: string;
  category: string;
  pricingSummary: string;
  pricingTiers: PricingTier[];
  platforms: string[];
  models: string[];
  features: string[];
  tags: string[];
  stars?: string;
  launchDate: string;
  lastUpdate: string;
  latestNews?: string;
  changelog?: ChangelogEntry[];
}

// ===== Insight Types =====

export interface Insight {
  id: string;
  date: string;
  title: { en: string; zh: string };
  summary: { en: string; zh: string };
  observations: {
    fact: { en: string; zh: string };
    source: string;
    type:
      | "new-product"
      | "version-update"
      | "price-change"
      | "news"
      | "trend-inference";
  }[];
  hotProducts: string[];
  tags: string[];
}

// ===== Scan Log Types =====

export interface PriceChange {
  productId: string;
  field: "pricingSummary" | "pricingTiers";
  before: string;
  after: string;
  source: string;
}

export interface VersionChange {
  productId: string;
  oldVersion?: string;
  newVersion: string;
  highlights: string[];
  source: string;
}

export interface NewProductFound {
  productId: string;
  name: string;
  source: string;
}

export interface NewsChange {
  productId: string;
  news: string;
  source: string;
}

export interface ScanEntry {
  date: string;
  newProducts: NewProductFound[];
  versionChanges: VersionChange[];
  priceChanges: PriceChange[];
  newsChanges: NewsChange[];
  searchQueries: string[];
}

// ===== News Types =====

export interface NewsSource {
  name: string;
  url: string;
  feedUrl: string;
  icon: string;
}

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  sourceIcon: string;
  snippet: string;
}

// ===== Constants =====

export const categories = [
  { id: "all", label: "All" },
  { id: "open-source", label: "Open Source" },
  { id: "framework", label: "Framework" },
  { id: "consumer", label: "Consumer" },
  { id: "enterprise", label: "Enterprise" },
  { id: "coding-agent", label: "Coding Agent" },
  { id: "developer", label: "Developer" },
  { id: "hardware", label: "Hardware" },
] as const;

// ===== Utility =====

/** Parse loose date strings like "Mar 2026", "Mar 16, 2026" */
export function parseLooseDate(s: string): number {
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.getTime();
  const parts = s.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (parts) return new Date(`${parts[1]} 1, ${parts[2]}`).getTime();
  return 0;
}

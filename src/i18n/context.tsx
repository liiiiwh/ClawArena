"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Locale = "en" | "zh";

interface I18nContextValue {
  locale: Locale;
  t: (key: string) => string;
  toggle: () => void;
}

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Header
    "nav.products": "Products",
    "nav.news": "News",
    "nav.insights": "Insights",
    "nav.compare": "Compare",
    // Hero
    "hero.synced": "Last synced",
    "hero.subtitle": "Track the entire AI Agent ecosystem. Compare products, follow news, and stay ahead of the Claw revolution.",
    "hero.stat.stars": "OpenClaw Stars",
    "hero.stat.products": "Products Tracked",
    "hero.stat.categories": "Categories",
    "hero.stat.platforms": "Platforms",
    "hero.explore": "Explore Products",
    "hero.news": "Latest News →",
    // ProductGrid
    "products.title": "Products",
    "products.subtitle": "Click any product for full details & pricing",
    "products.search": "Search products...",
    "products.empty": "No products found matching your criteria",
    // Categories
    "cat.all": "All",
    "cat.open-source": "Open Source",
    "cat.framework": "Framework",
    "cat.consumer": "Consumer",
    "cat.enterprise": "Enterprise",
    "cat.coding-agent": "Coding Agent",
    "cat.developer": "Developer",
    "cat.hardware": "Hardware",
    // Modal
    "modal.launch": "Launch",
    "modal.updated": "Product Updated",
    "modal.pricing": "Pricing",
    "modal.stars": "Stars / Users",
    "modal.plans": "Pricing Plans",
    "modal.versions": "Version History",
    "modal.features": "Key Features",
    "modal.platforms": "Platforms",
    "modal.models": "Models",
    "modal.visit": "Visit Website ↗",
    "modal.nav": "Navigate products",
    "modal.close": "Close",
    "modal.latest": "Latest",
    // Insights
    "insights.title": "Daily Insights",
    "insights.subtitle": "Trends and analysis from the Hundred Lobster War",
    "insights.date": "Analysis Date",
  },
  zh: {
    // Header
    "nav.products": "产品库",
    "nav.news": "新闻",
    "nav.insights": "洞察",
    "nav.compare": "对比",
    // Hero
    "hero.synced": "最近同步",
    "hero.subtitle": "追踪 AI Agent 全生态，对比产品、关注动态，把握百虾大战最新趋势。",
    "hero.stat.stars": "OpenClaw Stars",
    "hero.stat.products": "收录产品",
    "hero.stat.categories": "分类",
    "hero.stat.platforms": "平台",
    "hero.explore": "浏览产品",
    "hero.news": "最新动态 →",
    // ProductGrid
    "products.title": "产品库",
    "products.subtitle": "点击产品卡片查看完整详情和定价",
    "products.search": "搜索产品...",
    "products.empty": "没有找到符合条件的产品",
    // Categories
    "cat.all": "全部",
    "cat.open-source": "开源",
    "cat.framework": "框架",
    "cat.consumer": "消费者",
    "cat.enterprise": "企业级",
    "cat.coding-agent": "编程Agent",
    "cat.developer": "开发者",
    "cat.hardware": "硬件",
    // Modal
    "modal.launch": "上线时间",
    "modal.updated": "产品更新",
    "modal.pricing": "定价",
    "modal.stars": "Stars / 用户数",
    "modal.plans": "定价方案",
    "modal.versions": "版本历史",
    "modal.features": "核心功能",
    "modal.platforms": "平台",
    "modal.models": "模型",
    "modal.visit": "访问官网 ↗",
    "modal.nav": "切换产品",
    "modal.close": "关闭",
    "modal.latest": "最新",
    // Insights
    "insights.title": "每日洞察",
    "insights.subtitle": "百虾大战趋势分析与产品迭代观察",
    "insights.date": "分析日期",
  },
};

const I18nContext = createContext<I18nContextValue>({
  locale: "zh",
  t: (key) => key,
  toggle: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("zh");

  const toggle = useCallback(() => {
    setLocale((prev) => (prev === "en" ? "zh" : "en"));
  }, []);

  const t = useCallback(
    (key: string) => translations[locale][key] ?? key,
    [locale],
  );

  return (
    <I18nContext.Provider value={{ locale, t, toggle }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

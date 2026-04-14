"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/i18n/context";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { locale, t, toggle } = useI18n();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🦞</span>
          <span className="font-mono text-lg font-bold text-text-bright">
            Claw<span className="text-cyan">Arena</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 md:flex">
          <Link
            href="/#products"
            className="text-sm text-text-dim transition-colors hover:text-cyan"
          >
            {t("nav.products")}
          </Link>
          <Link
            href="/#insights"
            className="text-sm text-text-dim transition-colors hover:text-cyan"
          >
            {t("nav.insights")}
          </Link>
          <Link
            href="/news"
            className="text-sm text-text-dim transition-colors hover:text-cyan"
          >
            {t("nav.news")}
          </Link>
          <Link
            href="/#compare"
            className="text-sm text-text-dim transition-colors hover:text-cyan"
          >
            {t("nav.compare")}
          </Link>

          {/* Language toggle */}
          <button
            onClick={toggle}
            className="rounded-lg border border-border px-2.5 py-1 font-mono text-xs text-text-dim transition-all hover:border-cyan hover:text-cyan"
            title={locale === "en" ? "切换中文" : "Switch to English"}
          >
            {locale === "en" ? "中文" : "EN"}
          </button>

          <a
            href="https://github.com/openclaw/openclaw"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border px-3 py-1.5 font-mono text-xs text-text-dim transition-all hover:border-cyan hover:text-cyan"
          >
            GitHub ↗
          </a>
        </nav>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggle}
            className="rounded-lg border border-border px-2 py-1 font-mono text-[10px] text-text-dim"
          >
            {locale === "en" ? "中文" : "EN"}
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-text-dim"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="border-t border-border bg-bg/95 px-4 py-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-3">
            <Link href="/#products" onClick={() => setMenuOpen(false)} className="text-sm text-text-dim transition-colors hover:text-cyan">
              {t("nav.products")}
            </Link>
            <Link href="/#insights" onClick={() => setMenuOpen(false)} className="text-sm text-text-dim transition-colors hover:text-cyan">
              {t("nav.insights")}
            </Link>
            <Link href="/news" onClick={() => setMenuOpen(false)} className="text-sm text-text-dim transition-colors hover:text-cyan">
              {t("nav.news")}
            </Link>
            <Link href="/#compare" onClick={() => setMenuOpen(false)} className="text-sm text-text-dim transition-colors hover:text-cyan">
              {t("nav.compare")}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

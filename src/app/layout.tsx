import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { I18nProvider } from "@/i18n/context";

export const metadata: Metadata = {
  title: "ClawArena — Track the AI Agent Ecosystem",
  description:
    "The definitive tracker for OpenClaw, QClaw, EasyClaw, WorkBuddy, NemoClaw, Claude Code and the entire AI agent ecosystem.",
  keywords: [
    "OpenClaw",
    "QClaw",
    "EasyClaw",
    "WorkBuddy",
    "NemoClaw",
    "Claude Code",
    "AI agents",
    "claw ecosystem",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-bg antialiased">
        <I18nProvider>
          <Header />
          <main className="min-h-[calc(100vh-160px)]">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}

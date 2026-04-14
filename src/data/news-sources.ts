export interface NewsSource {
  name: string;
  url: string;
  feedUrl: string;
  icon: string;
}

export const newsSources: NewsSource[] = [
  {
    name: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/",
    feedUrl: "https://techcrunch.com/category/artificial-intelligence/feed/",
    icon: "📰",
  },
  {
    name: "The Verge AI",
    url: "https://www.theverge.com/ai-artificial-intelligence",
    feedUrl: "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml",
    icon: "📡",
  },
  {
    name: "Ars Technica AI",
    url: "https://arstechnica.com/ai/",
    feedUrl: "https://feeds.arstechnica.com/arstechnica/technology-lab",
    icon: "🔬",
  },
  {
    name: "Hacker News",
    url: "https://news.ycombinator.com",
    feedUrl: "https://hnrss.org/newest?q=openclaw+OR+claw+AI+agent",
    icon: "🟠",
  },
];

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  sourceIcon: string;
  snippet: string;
}

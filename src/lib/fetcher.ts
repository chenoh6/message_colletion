import Parser from "rss-parser";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { v4 as uuidv4 } from "uuid";
import type { SourceConfig, Entry } from "./types";

const parser = new Parser({
  timeout: 30000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
});

const CATEGORY_EMOJI: Record<string, string> = {
  ai: "🤖",
  tech: "📱",
  funding: "💰",
};

function timeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} 天前`;
  return date.toLocaleDateString("zh-CN");
}

function extractContent(html: string): { text: string; summary: string } {
  try {
    const dom = new JSDOM(html, { url: "https://example.com" });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    if (article) {
      const text = article.textContent?.trim() || "";
      const summary = article.excerpt?.trim() || text.slice(0, 200);
      return { text: text.slice(0, 5000), summary: summary.slice(0, 300) };
    }
  } catch {}
  // Fallback: strip HTML tags
  const text = html.replace(/<[^>]*>/g, "").trim().slice(0, 2000);
  return { text, summary: text.slice(0, 200) };
}

export async function fetchSource(source: SourceConfig): Promise<{
  entries: Entry[];
  error?: string;
}> {
  try {
    console.log(`[Fetcher] Fetching ${source.name} from ${source.url}`);
    const feed = await parser.parseURL(source.url);

    const entries: Entry[] = [];
    const maxItems = 30; // Limit to prevent token blowout on large feeds

    for (const item of (feed.items || []).slice(0, maxItems)) {
      const pubDate = item.pubDate
        ? new Date(item.pubDate)
        : item.isoDate
          ? new Date(item.isoDate)
          : new Date();

      // Get content — prefer content:encoded (full HTML), then content, then summary
      const rawContent =
        (item as any)["content:encoded"] || item.content || item.contentSnippet || item.summary || "";

      let contentText = "";
      let contentSummary = "";

      if (rawContent) {
        if (rawContent.includes("<") && rawContent.includes(">")) {
          const extracted = extractContent(rawContent);
          contentText = extracted.text;
          contentSummary = extracted.summary;
        } else {
          contentText = rawContent.slice(0, 2000);
          contentSummary = rawContent.slice(0, 200);
        }
      }

      const link = item.link || item.guid || "";
      const title = item.title?.trim() || "(无标题)";

      const entry: Entry = {
        id: uuidv4(),
        title,
        url: link,
        summary: contentSummary || item.contentSnippet?.slice(0, 200) || title,
        content: rawContent,
        contentText,
        source: source.name,
        sourceId: source.id,
        sourceIcon: source.icon || CATEGORY_EMOJI[source.category] || "📄",
        time: timeAgo(pubDate),
        isoDate: pubDate.toISOString(),
        category: source.category,
        tags: [],
        likes: 0,
        comments: 0,
        isRead: false,
        isSaved: false,
        readingTime: contentText
          ? `${Math.max(1, Math.ceil(contentText.length / 500))} 分钟`
          : "1 分钟",
        coverGradient: getGradient(source.id),
        coverEmoji: source.icon || CATEGORY_EMOJI[source.category] || "📄",
      };

      entries.push(entry);
    }

    console.log(`[Fetcher] ${source.name}: got ${entries.length} items`);
    return { entries };
  } catch (err: any) {
    console.error(`[Fetcher] Error fetching ${source.name}:`, err.message);
    return { entries: [], error: err.message };
  }
}

const GRADIENTS = [
  "from-[#7c5cfc]/30 to-[#2dd4bf]/15",
  "from-[#2dd4bf]/25 to-[#7c5cfc]/10",
  "from-[#f472b6]/20 to-[#7c5cfc]/10",
  "from-[#fbbf24]/20 to-[#f472b6]/10",
  "from-[#7c5cfc]/20 to-[#f472b6]/10",
  "from-[#2dd4bf]/20 to-[#7c5cfc]/15",
];

function getGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

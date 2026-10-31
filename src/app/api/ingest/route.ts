import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const maxDuration = 60;

const parser = new Parser({ timeout: 12000, headers: { "User-Agent": "SawtAlKhabarBot/1.0" } });

// Import only RSS headlines and short descriptions, not full articles.
const feeds = [
  { name: "MAP Arabic", url: "https://www.mapnews.ma/ar/rss.xml", category: "morocco", language: "ar" },
  { name: "MAP English", url: "https://www.mapnews.ma/en/rss.xml", category: "morocco", language: "en" },
  { name: "RTVE Noticias", url: "https://www.rtve.es/api/noticias.rss", category: "spain", language: "es" },
  { name: "France 24 Français", url: "https://www.france24.com/fr/rss", category: "france", language: "fr" },
  { name: "France 24 English", url: "https://www.france24.com/en/rss", category: "france", language: "en" },
  { name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml", category: "international", language: "en" },
  { name: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/rss.xml", category: "sports", language: "en" },
  { name: "Euronews Business", url: "https://www.euronews.com/rss?level=theme&name=business", category: "economy", language: "en" }
] as const;

const sensitive = /war|attack|killed|death|election|minister|president|court|arrest|accus|terror|health|virus|earthquake|flood|fire|explosion|حرب|هجوم|مقتل|وفاة|انتخابات|وزير|رئيس|محكمة|اعتقال|اتهام|صحة|زلزال|فيضانات|حريق|انفجار|guerre|attaque|mort|élection|ministre|président|tribunal|arrestation|santé|séisme|guerra|ataque|muert[eo]|elección|ministro|presidente|tribunal|detención|salud|terremoto|inundación|incendio/i;

function cleanText(value: string, max: number) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const supabase = getSupabaseAdmin();
    const results: Array<{ feed: string; imported: number; skippedSensitive?: number; error?: string }> = [];
    for (const feed of feeds) {
      try {
        const parsed = await parser.parseURL(feed.url);
        let imported = 0;
        let skippedSensitive = 0;
        for (const item of (parsed.items || []).slice(0, 15)) {
          const url = item.link?.trim();
          const title = cleanText(item.title || "", 240);
          if (!url || !title || !/^https?:\/\//i.test(url)) continue;
          const { data: existing, error: lookupError } = await supabase.from("news_sources").select("id").eq("url", url).maybeSingle();
          if (lookupError) throw lookupError;
          if (existing) continue;

          const description = cleanText(item.contentSnippet || item.summary || "", 900);
          if (sensitive.test(`${title} ${description}`)) {
            skippedSensitive++;
            continue;
          }
          const date = item.isoDate || item.pubDate ? new Date(item.isoDate || item.pubDate || "") : new Date();
          const publishedAt = Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
          const translations = {
            [feed.language]: {
              title,
              summary: description || title,
              body: description || title
            }
          };
          const { data: inserted, error: insertError } = await supabase.from("news_articles").insert({
            category: feed.category,
            status: "published",
            confidence: 0.8,
            is_sensitive: false,
            translations,
            original_published_at: publishedAt,
            published_at: new Date().toISOString()
          }).select("id").single();
          if (insertError) throw insertError;
          const { error: sourceError } = await supabase.from("news_sources").insert({
            article_id: inserted.id,
            name: feed.name,
            url,
            source_language: feed.language,
            source_published_at: publishedAt
          });
          if (sourceError) throw sourceError;
          imported++;
        }
        results.push({ feed: feed.name, imported, skippedSensitive });
      } catch (error) {
        results.push({ feed: feed.name, imported: 0, error: error instanceof Error ? error.message : "Feed failed" });
      }
    }
    return NextResponse.json({
      ok: true,
      results,
      note: "Non-sensitive RSS headlines and short descriptions are published automatically. High-risk topics are skipped. Stories remain in their source language; automatic translation is not enabled."
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Ingestion failed" }, { status: 500 });
  }
}

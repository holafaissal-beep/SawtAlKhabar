import { NextResponse } from "next/server";
import Parser from "rss-parser";
import OpenAI from "openai";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const maxDuration = 60;

const parser = new Parser({ timeout: 12000, headers: { "User-Agent": "SawtAlKhabarBot/0.1 (+contact site owner)" } });
const feeds = [
  { name:"MAP English", url:"https://www.mapnews.ma/en/rss.xml", region:"Morocco", category:"morocco", language:"en" },
  { name:"RTVE Noticias", url:"https://www.rtve.es/api/noticias.rss", region:"Spain", category:"spain", language:"es" },
  { name:"France 24 English", url:"https://www.france24.com/en/rss", region:"France", category:"france", language:"en" },
  { name:"BBC World", url:"https://feeds.bbci.co.uk/news/world/rss.xml", region:"International", category:"international", language:"en" },
  { name:"BBC Sport", url:"https://feeds.bbci.co.uk/sport/rss.xml", region:"International", category:"sports", language:"en" },
  { name:"Euronews Business", url:"https://www.euronews.com/rss?level=theme&name=business", region:"International", category:"economy", language:"en" }
];
const sensitive = /war|attack|killed|death|election|minister|president|court|arrest|accus|terror|health|virus|earthquake|flood|fire|explosion|حرب|هجوم|مقتل|وفاة|انتخابات|وزير|رئيس|محكمة|اعتقال|اتهام|صحة|زلزال|فيضانات|حريق|انفجار|guerre|attaque|mort|élection|ministre|président|tribunal|arrestation|santé|séisme/i;

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const supabase = getSupabaseAdmin();
    const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL;
    if (!model) throw new Error("Set OPENAI_MODEL to a model enabled for your API account.");
    const results: Array<{feed:string; imported:number; error?:string}> = [];
    for (const feed of feeds) {
      try {
        const parsed = await parser.parseURL(feed.url);
        let imported = 0;
        for (const item of (parsed.items || []).slice(0, 12)) {
          const url = item.link?.trim();
          const title = item.title?.trim();
          if (!url || !title) continue;
          const publishedAt = item.isoDate || item.pubDate || new Date().toISOString();
          const { data: existing } = await supabase.from("news_sources").select("id").eq("url", url).maybeSingle();
          if (existing) continue;
          const sourceText = [title, item.contentSnippet || item.summary || ""].join("\n").slice(0, 2200);
          const prompt = `Create an original, factual news brief using ONLY the supplied RSS headline and short description. Do not invent details or claim independent verification. If the supplied information is insufficient, return status review. Do not imitate or translate the source article. Do not use quotations. Output JSON only with keys: category (one of morocco,spain,france,international,sports,economy), sensitive (boolean), confidence (number 0-1), ar/es/fr (each object with title, summary, body). Each body should be a concise 2-3 paragraph original brief; summaries max 35 words. Preserve uncertainty and dates. Source: ${feed.name}; region: ${feed.region}; RSS text: ${sourceText}`;
          const response = await ai.responses.create({ model, input: prompt });
          const raw = response.output_text || "";
          const cleaned = raw.replace(/^```json\s*/i,"").replace(/\s*```$/,"");
          const article = JSON.parse(cleaned);
          const score = Number(article.confidence || 0);
          const needsReview = Boolean(article.sensitive) || sensitive.test(sourceText) || score < 0.78;
          const { data: inserted, error: insertError } = await supabase.from("news_articles").insert({
            category: ["morocco","spain","france","international","sports","economy"].includes(article.category) ? article.category : feed.category,
            status: needsReview ? "review" : "draft",
            confidence: score,
            is_sensitive: Boolean(article.sensitive) || sensitive.test(sourceText),
            translations: article,
            original_published_at: new Date(publishedAt).toISOString(),
            published_at: null
          }).select("id").single();
          if (insertError) throw insertError;
          const { error: sourceError } = await supabase.from("news_sources").insert({
            article_id: inserted.id, name: feed.name, url, source_language: feed.language, source_published_at: new Date(publishedAt).toISOString()
          });
          if (sourceError) throw sourceError;
          imported++;
        }
        results.push({ feed:feed.name, imported });
      } catch (e) {
        results.push({ feed:feed.name, imported:0, error:e instanceof Error ? e.message : "Feed failed" });
      }
    }
    return NextResponse.json({ ok:true, results, note:"New items are held as drafts or review items. Public publishing is intentionally disabled until source corroboration and editorial approval are configured." });
  } catch (e) {
    return NextResponse.json({ error:e instanceof Error ? e.message : "Ingestion failed" }, { status:500 });
  }
}

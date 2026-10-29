import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default async function NewsArticle({ params }: { params: Promise<{ id:string }> }) {
  const { id } = await params;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) notFound();
  const supabase = createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const { data: story } = await supabase.from("news_articles").select("id,category,translations,published_at").eq("id",id).eq("status","published").maybeSingle();
  if (!story) notFound();
  const { data: sources } = await supabase.from("news_sources").select("name,url,source_published_at").eq("article_id",id);
  const article = story.translations?.ar || {};
  return <main>
    <div className="topline"><div className="wrap toplineInner"><a href="/">صوت الخبر</a><span>المصدر دائماً جزء من الخبر</span></div></div>
    <article className="wrap articlePage">
      <a className="eyebrow" href="/">← العودة إلى الرئيسية</a>
      <h1>{article.title}</h1>
      <p className="articleLead">{article.summary}</p>
      <div className="articleBody">{article.body}</div>
      <section className="sourceList"><h2>المصادر</h2>{(sources || []).map((source:any)=><a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.name} — {source.url}</a>)}</section>
    </article>
  </main>;
}

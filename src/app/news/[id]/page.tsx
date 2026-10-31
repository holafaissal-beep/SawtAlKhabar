import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default async function NewsArticle({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{lang?:string}>}) {
  const {id}=await params;
  const {lang:requested}=await searchParams;
  const lang=requested==="es"||requested==="fr"?requested:"ar";
  const dir=lang==="ar"?"rtl":"ltr";
  const labels={ar:{back:"العودة إلى الرئيسية",sources:"المصادر"},es:{back:"Volver al inicio",sources:"Fuentes"},fr:{back:"Retour à l'accueil",sources:"Sources"}}[lang];
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key)notFound();
  const supabase=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:story}=await supabase.from("news_articles").select("id,category,translations,published_at").eq("id",id).eq("status","published").maybeSingle();
  if(!story)notFound();
  const {data:sources}=await supabase.from("news_sources").select("name,url,source_published_at").eq("article_id",id);
  const article=story.translations?.[lang]||Object.values(story.translations||{})[0]||{};
  return <main lang={lang} dir={dir}>
    <div className="topline"><div className="wrap toplineInner"><a href="/">صوت الخبر</a><span>Sawt Al Khabar</span></div></div>
    <article className="wrap articlePage">
      <a className="eyebrow" href={`/?lang=${lang}`}>← {labels.back}</a>
      <h1>{article.title}</h1>
      <p className="articleLead">{article.summary}</p>
      <div className="articleBody">{article.body}</div>
      <section className="sourceList"><h2>{labels.sources}</h2>{(sources||[]).map((source:any)=><a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.name} — {source.url}</a>)}</section>
    </article>
  </main>;
}

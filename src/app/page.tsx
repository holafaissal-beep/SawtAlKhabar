import { createClient } from "@supabase/supabase-js";

const sections = ["المغرب","إسبانيا","فرنسا","دولي","رياضة","اقتصاد"];
const categoryNames: Record<string,string> = { morocco:"المغرب",spain:"إسبانيا",france:"فرنسا",international:"دولي",sports:"رياضة",economy:"اقتصاد" };

async function getLatestStories() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const supabase = createClient(url, key, { auth: { persistSession:false, autoRefreshToken:false } });
  const { data } = await supabase.from("news_articles")
    .select("id,category,translations,published_at")
    .eq("status","published").order("published_at",{ascending:false}).limit(6);
  return data || [];
}

export default async function Home() {
  const stories = await getLatestStories();
  return <main>
    <div className="topline"><div className="wrap toplineInner"><span>صوت الحقيقة.. أخبار بلا حدود</span><span>منصة إخبارية متعددة اللغات</span></div></div>
    <header className="wrap header">
      <a className="brand" href="/"><span className="brandMark">ص</span><span><strong>صوت الخبر</strong><small>SAWT AL KHABAR</small></span></a>
      <div className="languages"><a href="/">العربية</a><a href="/?lang=es">Español</a><a href="/?lang=fr">Français</a></div>
    </header>
    <nav className="nav"><div className="wrap navInner"><a className="active" href="/">الرئيسية</a>{sections.map(s=><a key={s} href="#sections">{s}</a>)}</div></nav>
    <section className="wrap hero">
      <div className="heroCopy"><span className="eyebrow">منصة إخبارية مستقلة</span><h1>صوت الحقيقة،<br/><em>أخبار بلا حدود.</em></h1><p>نرصد أبرز الأحداث من المغرب وإسبانيا وفرنسا والعالم، ونقدم تغطية متعددة اللغات مع روابط واضحة إلى المصادر.</p><a className="cta" href="#latest">آخر الأخبار <span>←</span></a></div>
      <div className="heroVisual"><div className="orbit orbitOne"/><div className="orbit orbitTwo"/><div className="heroSeal"><b>صوت</b><strong>الخبر</strong><small>NEWS • ACTUALIDAD • ACTUALITÉS</small></div><span className="visualTag">AR · ES · FR</span></div>
    </section>
    <section className="wrap section" id="latest"><div className="sectionHead"><div><span className="eyebrow">آخر المستجدات</span><h2>أحدث الأخبار</h2></div><span className="muted">تغطية متجددة من مصادر متعددة</span></div>
      {stories.length ? <div className="newsGrid">{stories.map((story:any)=><article className="newsCard" key={story.id}><span className="eyebrow">{categoryNames[story.category] || "أخبار"}</span><h3>{story.translations?.ar?.title || "خبر جديد"}</h3><p>{story.translations?.ar?.summary || ""}</p><a href={`/news/${story.id}`}>اقرأ التفاصيل ←</a></article>)}</div> : <div className="emptyNews"><strong>قريباً: أولى الأخبار</strong><p>ستظهر الأخبار هنا بعد إعداد قاعدة البيانات وتشغيل نظام جمع الأخبار ومراجعتها.</p></div>}
    </section>
    <section className="wrap section" id="sections"><div className="sectionHead"><div><span className="eyebrow">تغطية شاملة</span><h2>الأقسام الإخبارية</h2></div><span className="muted">ستة مجالات رئيسية</span></div><div className="sectionGrid">{sections.map((s,i)=><a className="sectionTile" href="#latest" key={s}><span className="tileNo">0{i+1}</span><strong>{s}</strong><span className="tileArrow">↗</span></a>)}</div></section>
    <section className="wrap about" id="about"><div><span className="eyebrow">كيف نعمل؟</span><h2>خبر موثق.<br/>مصادر واضحة.</h2></div><p>تجمع المنصة الأخبار من مصادر مرخصة، وتعد تغطية تحريرية أصلية مع الاحتفاظ بروابط المصادر. الأخبار الحساسة أو غير المؤكدة تمر إلى المراجعة قبل النشر.</p></section>
    <footer><div className="wrap footerInner"><span>© {new Date().getFullYear()} صوت الخبر – Sawt Al Khabar</span><span>المغرب · إسبانيا · فرنسا · العالم</span></div></footer>
  </main>;
}

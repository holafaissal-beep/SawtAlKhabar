import { createClient } from "@supabase/supabase-js";

const categoryNames: Record<string,Record<string,string>> = {
  ar:{morocco:"المغرب",spain:"إسبانيا",france:"فرنسا",international:"دولي",sports:"رياضة",economy:"اقتصاد"},
  es:{morocco:"Marruecos",spain:"España",france:"Francia",international:"Internacional",sports:"Deportes",economy:"Economía"},
  fr:{morocco:"Maroc",spain:"Espagne",france:"France",international:"International",sports:"Sport",economy:"Économie"}
};
const copy: Record<string,any> = {
  ar:{home:"الرئيسية",tag:"منصة إخبارية مستقلة",headline1:"صوت الحقيقة،",headline2:"أخبار بلا حدود.",intro:"نرصد أبرز الأحداث من المغرب وإسبانيا وفرنسا والعالم، ونقدم تغطية متعددة اللغات مع روابط واضحة إلى المصادر.",latest:"آخر المستجدات",latestTitle:"أحدث الأخبار",sub:"تغطية متجددة من مصادر متعددة",soon:"قريباً: أولى الأخبار",empty:"ستظهر الأخبار هنا بعد إعداد قاعدة البيانات وتشغيل نظام جمع الأخبار ومراجعتها.",sections:"الأقسام الإخبارية",all:"تغطية شاملة",about:"كيف نعمل؟",aboutTitle:"خبر موثق. مصادر واضحة.",aboutText:"تجمع المنصة الأخبار من مصادر مرخصة، وتعد تغطية تحريرية أصلية مع الاحتفاظ بروابط المصادر. الأخبار الحساسة أو غير المؤكدة تمر إلى المراجعة قبل النشر.",read:"اقرأ التفاصيل ←",back:"العودة إلى الرئيسية"},
  es:{home:"Inicio",tag:"Plataforma informativa independiente",headline1:"La voz de la verdad,",headline2:"noticias sin fronteras.",intro:"Seguimos la actualidad de Marruecos, España, Francia y el mundo con cobertura multilingüe y enlaces claros a las fuentes.",latest:"Última hora",latestTitle:"Noticias recientes",sub:"Actualidad de múltiples fuentes",soon:"Próximamente: primeras noticias",empty:"Las noticias aparecerán aquí cuando se configure la base de datos y se active la recopilación y revisión.",sections:"Secciones",all:"Cobertura completa",about:"Cómo trabajamos",aboutTitle:"Información contrastada. Fuentes claras.",aboutText:"La plataforma recopila noticias de fuentes autorizadas y prepara cobertura editorial original con enlaces a las fuentes. Los temas sensibles o inciertos pasan a revisión antes de publicarse.",read:"Leer noticia ←",back:"Volver al inicio"},
  fr:{home:"Accueil",tag:"Plateforme d'information indépendante",headline1:"La voix de la vérité,",headline2:"l'actualité sans frontières.",intro:"Nous suivons l'actualité du Maroc, de l'Espagne, de la France et du monde avec une couverture multilingue et des liens clairs vers les sources.",latest:"À la une",latestTitle:"Dernières actualités",sub:"Une couverture issue de plusieurs sources",soon:"Bientôt : premières actualités",empty:"Les actualités apparaîtront ici après la configuration de la base de données et l'activation de la collecte et de la vérification.",sections:"Rubriques",all:"Couverture complète",about:"Notre méthode",aboutTitle:"Des faits vérifiés. Des sources claires.",aboutText:"La plateforme collecte des informations auprès de sources autorisées et prépare une couverture éditoriale originale avec des liens vers les sources. Les sujets sensibles ou incertains sont soumis à vérification avant publication.",read:"Lire l'article ←",back:"Retour à l'accueil"}
};
async function getLatestStories() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const supabase = createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data} = await supabase.from("news_articles").select("id,category,translations,published_at").eq("status","published").order("published_at",{ascending:false}).limit(6);
  return data || [];
}
export default async function Home({searchParams}:{searchParams:Promise<{lang?:string}>}) {
  const {lang:requested} = await searchParams;
  const lang = requested==="es"||requested==="fr"?requested:"ar";
  const t = copy[lang];
  const dir = lang==="ar"?"rtl":"ltr";
  const sections = Object.values(categoryNames[lang]);
  const stories = (await getLatestStories()) as Array<{id:string;category:string;translations:Record<string,{title?:string;summary?:string}>}>;
  return <main lang={lang} dir={dir}>
    <div className="topline"><div className="wrap toplineInner"><span>صوت الحقيقة.. أخبار بلا حدود</span><span>Sawt Al Khabar</span></div></div>
    <header className="wrap header">
      <a className="brand" href="/"><span className="brandMark">ص</span><span><strong>صوت الخبر</strong><small>SAWT AL KHABAR</small></span></a>
      <div className="languages"><a href="/?lang=ar">العربية</a><a href="/?lang=es">Español</a><a href="/?lang=fr">Français</a></div>
    </header>
    <nav className="nav"><div className="wrap navInner"><a className="active" href="/">{t.home}</a>{sections.map((s,i)=><a key={s} href="#sections">{s}</a>)}</div></nav>
    <section className="wrap hero">
      <div className="heroCopy"><span className="eyebrow">{t.tag}</span><h1>{t.headline1}<br/><em>{t.headline2}</em></h1><p>{t.intro}</p><a className="cta" href="#latest">{t.latest} <span>←</span></a></div>
      <div className="heroVisual"><div className="orbit orbitOne"/><div className="orbit orbitTwo"/><div className="heroSeal"><b>صوت</b><strong>الخبر</strong><small>NEWS • ACTUALIDAD • ACTUALITÉS</small></div><span className="visualTag">AR · ES · FR</span></div>
    </section>
    <section className="wrap section" id="latest"><div className="sectionHead"><div><span className="eyebrow">{t.latest}</span><h2>{t.latestTitle}</h2></div><span className="muted">{t.sub}</span></div>
      {stories.length?<div className="newsGrid">{stories.map((story:any)=><article className="newsCard" key={story.id}><span className="eyebrow">{categoryNames[lang][story.category]||"News"}</span><h3>{story.translations?.[lang]?.title||Object.values(story.translations||{})[0]?.title||"—"}</h3><p>{story.translations?.[lang]?.summary||Object.values(story.translations||{})[0]?.summary||""}</p><a href={`/news/${story.id}?lang=${lang}`}>{t.read}</a></article>)}</div>:<div className="emptyNews"><strong>{t.soon}</strong><p>{t.empty}</p></div>}
    </section>
    <section className="wrap section" id="sections"><div className="sectionHead"><div><span className="eyebrow">{t.all}</span><h2>{t.sections}</h2></div><span className="muted">01 — 06</span></div><div className="sectionGrid">{sections.map((s,i)=><a className="sectionTile" href="#latest" key={s}><span className="tileNo">0{i+1}</span><strong>{s}</strong><span className="tileArrow">↗</span></a>)}</div></section>
    <section className="wrap about" id="about"><div><span className="eyebrow">{t.about}</span><h2>{t.aboutTitle}</h2></div><p>{t.aboutText}</p></section>
    <footer><div className="wrap footerInner"><span>© {new Date().getFullYear()} صوت الخبر – Sawt Al Khabar</span><span>Morocco · España · France · International</span></div></footer>
  </main>;
}

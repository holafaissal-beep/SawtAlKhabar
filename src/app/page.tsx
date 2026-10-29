const sections = ["المغرب","إسبانيا","فرنسا","دولي","رياضة","اقتصاد"];
const languages = [{label:"العربية",code:"AR"},{label:"Español",code:"ES"},{label:"Français",code:"FR"}];

export default function Home() {
  return <main>
    <div className="topline"><div className="wrap toplineInner"><span>صوت الحقيقة.. أخبار بلا حدود</span><span>منصة إخبارية متعددة اللغات</span></div></div>
    <header className="wrap header">
      <a className="brand" href="/"><span className="brandMark">ص</span><span><strong>صوت الخبر</strong><small>SAWT AL KHABAR</small></span></a>
      <div className="languages">{languages.map(l=><span key={l.code}>{l.label}</span>)}</div>
    </header>
    <nav className="nav"><div className="wrap navInner"><a className="active" href="/">الرئيسية</a>{sections.map(s=><a key={s} href="#sections">{s}</a>)}</div></nav>
    <section className="wrap hero">
      <div className="heroCopy"><span className="eyebrow">منصة إخبارية مستقلة</span><h1>صوت الحقيقة،<br/><em>أخبار بلا حدود.</em></h1><p>نرصد أبرز الأحداث من المغرب وإسبانيا وفرنسا والعالم، ونقدم تغطية متعددة اللغات مع روابط واضحة إلى المصادر.</p><a className="cta" href="#about">اكتشف المنصة <span>←</span></a></div>
      <div className="heroVisual"><div className="orbit orbitOne"/><div className="orbit orbitTwo"/><div className="heroSeal"><b>صوت</b><strong>الخبر</strong><small>NEWS • ACTUALIDAD • ACTUALITÉS</small></div><span className="visualTag">AR · ES · FR</span></div>
    </section>
    <section className="wrap section" id="sections"><div className="sectionHead"><div><span className="eyebrow">تغطية شاملة</span><h2>الأقسام الإخبارية</h2></div><span className="muted">ستة مجالات رئيسية</span></div><div className="sectionGrid">{sections.map((s,i)=><a className="sectionTile" href="#about" key={s}><span className="tileNo">0{i+1}</span><strong>{s}</strong><span className="tileArrow">↗</span></a>)}</div></section>
    <section className="wrap about" id="about"><div><span className="eyebrow">كيف نعمل؟</span><h2>خبر موثق.<br/>مصادر واضحة.</h2></div><p>تجمع المنصة الأخبار من مصادر مرخصة، وتتحقق من تعدد الروايات قبل إعداد تغطية تحريرية أصلية. الأخبار الحساسة تمر إلى المراجعة قبل النشر. هذه النسخة التأسيسية تعرض هوية الموقع؛ سيظهر المحتوى الحي بعد ربط قاعدة البيانات ومصادر الأخبار وخدمة الذكاء الاصطناعي.</p></section>
    <footer><div className="wrap footerInner"><span>© {new Date().getFullYear()} صوت الخبر – Sawt Al Khabar</span><span>المغرب · إسبانيا · فرنسا · العالم</span></div></footer>
  </main>;
}

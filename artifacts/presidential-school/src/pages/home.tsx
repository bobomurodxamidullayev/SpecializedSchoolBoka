import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight, ChevronRight, Microscope, Code, Trophy,
  Clock, Star, GraduationCap, Users, BookOpen, CalendarDays,
  Building2, Newspaper, Sparkles,
} from "lucide-react";
import { useCmsSettings, useCmsAdministration, useCmsNews } from "@/hooks/useCms";
import { pickLang, formatDate, formatReadTime } from "@/lib/cms";

const NEWS_CAT: Record<string, { gradient: string; icon: React.ComponentType<{ className?: string }> }> = {
  Achievements: { gradient: "from-amber-500 via-yellow-400 to-orange-500", icon: Trophy },
  Facilities:   { gradient: "from-blue-600 via-cyan-500 to-indigo-600",    icon: Building2 },
  Events:       { gradient: "from-violet-600 via-purple-500 to-fuchsia-600", icon: CalendarDays },
  Academic:     { gradient: "from-emerald-600 via-teal-500 to-green-600",   icon: BookOpen },
};

const STAFF_GRADIENTS = [
  "from-primary/80 via-primary to-accent/70",
  "from-violet-600 via-purple-500 to-indigo-600",
  "from-emerald-600 via-teal-500 to-cyan-600",
  "from-rose-600 via-pink-500 to-fuchsia-600",
];

function NewsCardVisual({ category }: { category: string }) {
  const cfg = NEWS_CAT[category] ?? { gradient: "from-primary/80 to-primary/40", icon: Newspaper };
  const Icon = cfg.icon;
  return (
    <div className={`w-full h-full bg-gradient-to-br ${cfg.gradient} relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-xl" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 shadow-lg">
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { t, language } = useLanguage();
  const { data: settings } = useCmsSettings();
  const { data: staff = [] } = useCmsAdministration();
  const { data: newsItems = [] } = useCmsNews();

  const heroTitle = settings ? pickLang(settings.heroTitle, language) : t("hero.title");
  const heroSubtitle = settings ? pickLang(settings.slogan, language) : t("hero.subtitle");
  const heroStats = settings?.heroStats?.length
    ? settings.heroStats.map((s) => ({ value: s.value, label: pickLang(s.label, language) }))
    : [
        { label: t("home.stats.students"), value: "1,200+" },
        { label: t("home.stats.teachers"), value: "85+" },
        { label: t("home.stats.olympiadWinners"), value: "50+" },
        { label: t("home.stats.yearsOfExcellence"), value: "12+" },
      ];

  const displayNews = newsItems.slice(0, 3).map((item) => ({
    id: item.id,
    category: item.category,
    readTime: item.readTime,
    date: item.publishDate,
    title: pickLang(item.title, language),
    excerpt: pickLang(item.content, language).slice(0, 120),
    coverImage: item.coverImage,
  }));

  return (
    <div className="w-full">
      {/* ── Hero ── */}
      <section className="relative flex flex-col min-h-[100svh] overflow-hidden bg-sidebar-primary">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-sidebar-primary via-[#0F172A] to-[#0A0F24] opacity-90" />
          <motion.div
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{ y: [0, 20, 0], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-primary/30 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            className="absolute top-1/2 right-1/3 w-64 h-64 bg-accent/15 rounded-full blur-[80px]"
          />
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
        </div>

        <div className="relative z-10 flex-1 flex items-center container mx-auto px-4 md:px-6 pt-20 pb-8 md:pt-24 md:pb-10">
          <div className="max-w-4xl w-full">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent mb-4 md:mb-6">
              <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs sm:text-sm font-medium tracking-wide uppercase">{t("home.admissionsOpen")}</span>
              <Sparkles className="h-3 w-3" />
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-4 md:mb-6 font-serif">
              {heroTitle}
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-xl md:text-2xl text-slate-300 font-light mb-6 md:mb-8 max-w-2xl">
              {heroSubtitle}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link href="/admissions">
                <Button size="lg" className="w-full sm:w-auto h-12 sm:h-14 px-7 sm:px-8 text-sm sm:text-base bg-accent text-accent-foreground hover:bg-accent/90 border-0 rounded-full shadow-[0_0_40px_-10px_rgba(212,175,55,0.5)]">
                  {t("hero.cta1")} <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 sm:h-14 px-7 sm:px-8 text-sm sm:text-base bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white rounded-full backdrop-blur-sm">
                  {t("hero.cta2")}
                </Button>
              </Link>
            </motion.div>

            {/* Social proof row */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-10 flex items-center gap-4 flex-wrap">
              <div className="flex -space-x-2">
                {["A", "D", "R", "N"].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white/20 bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                    {c}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-slate-300 text-sm">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />)}
                <span className="ml-1 font-semibold text-white">4.9</span>
                <span className="text-slate-400">· Trusted by 1,500+ students</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-md">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
              {heroStats.map((stat, i) => (
                <div key={i} className="py-5 px-4 text-center group">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1 font-serif group-hover:text-accent transition-colors">{stat.value}</div>
                  <div className="text-[11px] sm:text-xs tracking-wide text-slate-400 font-semibold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">{t("home.philosophyLabel")}</h2>
            <h3 className="text-3xl md:text-5xl font-bold font-serif text-foreground mb-6">{t("home.philosophyTitle")}</h3>
            <p className="text-muted-foreground text-lg">{t("home.philosophyDesc")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Microscope, key: "labs", gradient: "from-blue-500 to-cyan-500" },
              { icon: Code, key: "stem", gradient: "from-violet-500 to-purple-600" },
              { icon: Trophy, key: "olympiad", gradient: "from-amber-500 to-orange-500" },
            ].map((feature, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-3">{t(`home.features.${feature.key}.title`)}</h4>
                <p className="text-muted-foreground leading-relaxed">{t(`home.features.${feature.key}.desc`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Administration ── */}
      <section className="py-24 bg-muted/40 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">{t("home.leadershipLabel")}</h2>
              <h3 className="text-3xl md:text-4xl font-bold font-serif text-foreground">{t("home.leadershipTitle")}</h3>
            </div>
            <Link href="/administration">
              <Button variant="ghost" className="hidden md:flex group">
                {t("home.viewAll")} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {staff.slice(0, 4).map((person, i) => {
              const name = pickLang(person.name, language);
              const position = pickLang(person.position, language);
              return (
              <motion.div key={person.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 group">
                <div className={`aspect-[4/3] bg-gradient-to-br ${STAFF_GRADIENTS[i % STAFF_GRADIENTS.length]} relative overflow-hidden`}>
                  {person.photo ? (
                    <img src={person.photo} alt={name} className="w-full h-full object-cover" />
                  ) : (
                  <>
                  <div className="absolute inset-0 opacity-[0.08]"
                    style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
                  <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/15 rounded-full blur-2xl" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                      <span className="text-3xl font-serif font-bold text-white">
                        {name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                      </span>
                    </div>
                  </div>
                  </>
                  )}
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-base mb-1 leading-snug">{name}</h4>
                  <p className="text-sm text-primary font-semibold">{position}</p>
                </div>
              </motion.div>
            );})}
          </div>
        </div>
      </section>

      {/* ── Latest News ── */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">{t("home.updatesLabel")}</h2>
              <h3 className="text-3xl md:text-4xl font-bold font-serif text-foreground">{t("home.latestTitle")}</h3>
            </div>
            <Link href="/news">
              <Button variant="ghost" className="hidden md:flex group">
                {t("home.allNews")} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(displayNews.length ? displayNews : []).map((item, i) => (
              <motion.article key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 transition-all duration-300">
                <div className="aspect-[16/9] relative overflow-hidden">
                  {item.coverImage ? (
                    <img src={item.coverImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                  <NewsCardVisual category={item.category} />
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/40 text-white backdrop-blur-sm border border-white/20">
                      {item.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="text-[10px] bg-black/40 text-white px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" /> {formatReadTime(item.readTime)}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">{formatDate(item.date)}</p>
                  <h4 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">{item.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{item.excerpt}</p>
                  <div className="flex items-center text-sm font-semibold text-primary gap-1 group-hover:gap-2 transition-all">
                    {t("home.readArticle")} <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Mobile "all news" link */}
          <div className="mt-8 text-center md:hidden">
            <Link href="/news">
              <Button variant="outline" className="rounded-full">
                {t("home.allNews")} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

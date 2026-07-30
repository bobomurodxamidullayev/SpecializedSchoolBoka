import { useState, useMemo } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { motion, AnimatePresence } from "framer-motion";
import { useCmsNews } from "@/hooks/useCms";
import { pickLang, formatDate, formatReadTime } from "@/lib/cms";
import { Clock, ChevronRight, Trophy, Building2, CalendarDays, BookOpen, Newspaper, ArrowRight, Rss, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getYouTubeEmbedUrl } from "@/lib/cms";
import { Link } from "wouter";

type CategoryKey = "Achievements" | "Facilities" | "Events" | "Academic" | string;

const CAT_CONFIG: Record<string, {
  gradient: string;
  badgeBg: string;
  badgeText: string;
  border: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  Achievements: {
    gradient: "from-amber-500 via-yellow-400 to-orange-500",
    badgeBg: "bg-amber-500/15",
    badgeText: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/30",
    icon: Trophy,
  },
  Facilities: {
    gradient: "from-blue-600 via-cyan-500 to-indigo-600",
    badgeBg: "bg-blue-500/15",
    badgeText: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/30",
    icon: Building2,
  },
  Events: {
    gradient: "from-violet-600 via-purple-500 to-fuchsia-600",
    badgeBg: "bg-violet-500/15",
    badgeText: "text-violet-600 dark:text-violet-400",
    border: "border-violet-500/30",
    icon: CalendarDays,
  },
  Academic: {
    gradient: "from-emerald-600 via-teal-500 to-green-600",
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/30",
    icon: BookOpen,
  },
};

const DEFAULT_CAT = {
  gradient: "from-primary via-primary/80 to-primary/60",
  badgeBg: "bg-primary/15",
  badgeText: "text-primary",
  border: "border-primary/30",
  icon: Newspaper,
};

function getCat(category: CategoryKey) {
  return CAT_CONFIG[category] ?? DEFAULT_CAT;
}

function CategoryBadge({ category }: { category: string }) {
  const cfg = getCat(category);
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.badgeBg} ${cfg.badgeText} border ${cfg.border}`}>
      <Icon className="h-3 w-3" />
      {category}
    </span>
  );
}

function CardVisual({ category, size = "md", image }: { category: string; size?: "sm" | "md" | "lg"; image?: string }) {
  const cfg = getCat(category);
  const Icon = cfg.icon;
  const iconSize = size === "lg" ? "h-16 w-16" : size === "md" ? "h-10 w-10" : "h-8 w-8";
  if (image) {
    return (
      <img
        src={image}
        alt=""
        className="w-full h-full object-cover"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />
    );
  }
  return (
    <div className={`w-full h-full bg-gradient-to-br ${cfg.gradient} relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-black/20 rounded-full blur-2xl" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
          <Icon className={`${iconSize} text-white drop-shadow-lg`} />
        </div>
      </div>
    </div>
  );
}

export default function News() {
  const { t, language } = useLanguage();
  const { data: cmsNews = [] } = useCmsNews();
  const [activeCategory, setActiveCategory] = useState("All");

  const news = useMemo(
    () =>
      cmsNews.map((n) => ({
        id: n.id,
        title: pickLang(n.title, language),
        excerpt: pickLang(n.content, language).slice(0, 200),
        category: n.category,
        date: n.publishDate,
        readTime: n.readTime,
        author: n.author,
        coverImage: n.coverImage,
        slug: n.slug,
        mediaType: n.mediaType,
        videoUrl: n.videoUrl,
      })),
    [cmsNews, language],
  );

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(news.map((n) => n.category)))],
    [news],
  );

  const filtered = activeCategory === "All" ? news : news.filter((n) => n.category === activeCategory);
  const featured = filtered[0];
  const grid = filtered.slice(1);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const catCounts = categories.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = cat === "All" ? news.length : news.filter((n) => n.category === cat).length;
    return acc;
  }, {});

  return (
    <div className="w-full">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f1b4d] via-[#1a2a7a] to-[#0d1a5c] py-24 border-b border-border">
        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 right-[10%] w-80 h-80 bg-primary/20 rounded-full blur-[80px]"
          />
          <motion.div
            animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-0 left-[5%] w-96 h-64 bg-accent/15 rounded-full blur-[90px]"
          />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Live badge */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/25 text-accent text-sm font-semibold">
              <Rss className="h-3.5 w-3.5" />
              {t("news.live") || "LIVE UPDATES"}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="text-4xl md:text-6xl font-bold font-serif text-white text-center mb-4">
            {t("nav.news")}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-lg text-slate-300 max-w-2xl mx-auto text-center mb-10">
            {t("news.heroSubtitle")}
          </motion.p>

          {/* Scrolling ticker */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="mx-auto max-w-3xl overflow-hidden rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm py-2.5 px-0">
            <div className="flex gap-0 whitespace-nowrap" style={{ animation: "marquee 28s linear infinite" }}>
              {[...news, ...news].map((item, i) => (
                <span key={i} className="inline-flex items-center gap-2 px-6 text-sm text-slate-300">
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${getCat(item.category).badgeText.replace("text-", "bg-")}`} />
                  {item.title}
                  <span className="text-white/20 mx-2">·</span>
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Category filter ── */}
      <div className="sticky top-[60px] z-30 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => {
              const active = activeCategory === cat;
              const cfg = cat === "All" ? null : getCat(cat);
              const Icon = cfg?.icon ?? Newspaper;
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 border shrink-0 ${
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:border-border hover:text-foreground"
                  }`}>
                  {cat !== "All" && <Icon className="h-3.5 w-3.5" />}
                  {cat}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${active ? "bg-white/20" : "bg-muted"}`}>
                    {catCounts[cat]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Articles ── */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            <motion.div key={activeCategory} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}>

              {/* Featured article */}
              {featured && (
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                  onClick={() => featured.mediaType === "video" && featured.videoUrl && setActiveVideo(featured.videoUrl)}
                  className="mb-12 rounded-3xl overflow-hidden border border-border bg-card shadow-xl group cursor-pointer hover:shadow-2xl transition-all duration-300 grid md:grid-cols-[1fr_1.1fr]">
                  <div className="min-h-[280px] md:min-h-[420px] relative overflow-hidden">
                    <CardVisual category={featured.category} size="lg" image={featured.coverImage || undefined} />
                    {featured.mediaType === "video" && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-all group-hover:bg-black/40">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                          <PlayCircle className="h-10 w-10 text-white fill-white/10" />
                        </div>
                      </div>
                    )}
                    {/* Article number */}
                    <div className="absolute top-5 left-5 z-10">
                      <span className="bg-black/40 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                        #{String(news.findIndex((n) => n.id === featured.id) + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </div>

                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="flex flex-wrap items-center gap-3 mb-5">
                      <CategoryBadge category={featured.category} />
                      <span className="text-xs text-muted-foreground font-medium">{formatDate(featured.date)}</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-serif mb-5 group-hover:text-primary transition-colors leading-tight">
                      {featured.title}
                    </h2>
                    <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8">
                      {featured.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-border">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                            {featured.author.charAt(0)}
                          </div>
                          {featured.author}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" /> {formatReadTime(featured.readTime)}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-primary font-semibold text-sm group-hover:gap-2.5 transition-all">
                        {t("news.readMore")} <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* News grid */}
              {grid.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {grid.map((item, i) => (
                    <motion.article key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      onClick={() => item.mediaType === "video" && item.videoUrl && setActiveVideo(item.videoUrl)}
                      className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 group cursor-pointer flex flex-col">
                      <div className="aspect-[16/9] relative overflow-hidden">
                        <CardVisual category={item.category} size="sm" image={item.coverImage || undefined} />
                        {item.mediaType === "video" && (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center transition-all group-hover:bg-black/30">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg scale-90 group-hover:scale-100 transition-transform">
                              <PlayCircle className="h-6 w-6 text-white fill-white/20" />
                            </div>
                          </div>
                        )}
                        <div className="absolute top-3 left-3 z-10">
                          <CategoryBadge category={item.category} />
                        </div>
                        <div className="absolute bottom-3 right-3 z-10">
                          <span className="text-[10px] bg-black/50 text-white px-2 py-1 rounded-full backdrop-blur-sm font-medium flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" /> {formatReadTime(item.readTime)}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <p className="text-[11px] text-muted-foreground mb-3 font-medium">{formatDate(item.date)}</p>
                        <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-snug flex-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-5">{item.excerpt}</p>

                        <div className="flex items-center justify-between text-sm mt-auto pt-4 border-t border-border/60">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                              {item.author.charAt(0)}
                            </div>
                            <span className="text-xs">{item.author}</span>
                          </span>
                          <span className="flex items-center gap-1 text-primary font-semibold text-xs group-hover:gap-2 transition-all">
                            {t("news.read")} <ChevronRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}

              {filtered.length === 0 && (
                <div className="text-center py-24 text-muted-foreground">
                  <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No articles in this category yet.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Newsletter CTA */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-20 relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-accent/80 p-10 md:p-14 text-white text-center shadow-2xl">
            <div className="absolute inset-0 opacity-[0.06]"
              style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 mb-5 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold">
                <Rss className="h-4 w-4" /> {t("news.stayUpdated") || "Stay Updated"}
              </div>
              <h3 className="text-2xl md:text-4xl font-bold font-serif mb-4">
                {t("news.ctaTitle") || "Never Miss an Update"}
              </h3>
              <p className="text-white/75 max-w-lg mx-auto mb-8 text-base">
                {t("news.ctaDesc") || "Follow all the latest news, events and achievements from QCh Presidential School."}
              </p>
              <Link href="/contact">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full h-12 px-8 font-semibold shadow-lg">
                  {t("news.ctaButton") || "Contact Us"} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Dialog open={!!activeVideo} onOpenChange={(v) => !v && setActiveVideo(null)}>
        <DialogContent className="max-w-4xl bg-black/90 border-white/10 p-0 overflow-hidden text-white">
          <div className="relative w-full bg-black flex items-center justify-center aspect-video">
            {activeVideo && getYouTubeEmbedUrl(activeVideo) ? (
              <iframe
                src={getYouTubeEmbedUrl(activeVideo)!.embedUrl}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <p className="text-slate-400">Video link mavjud emas.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

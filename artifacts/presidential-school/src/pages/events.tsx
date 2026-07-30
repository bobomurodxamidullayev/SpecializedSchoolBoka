import { useState, useMemo } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { motion, AnimatePresence } from "framer-motion";
import { useCmsEvents } from "@/hooks/useCms";
import { pickLang } from "@/lib/cms";
import {
  Clock, MapPin, CalendarDays, Trophy, Users, Music,
  BookOpen, ChevronRight, GraduationCap,
} from "lucide-react";

const CAT_CONFIG: Record<string, {
  gradient: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  Academic: {
    gradient: "from-blue-500 to-indigo-600",
    badge: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30",
    icon: BookOpen,
  },
  Competition: {
    gradient: "from-amber-500 to-orange-600",
    badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
    icon: Trophy,
  },
  Community: {
    gradient: "from-emerald-500 to-teal-600",
    badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
    icon: Users,
  },
  Entertainment: {
    gradient: "from-violet-600 to-fuchsia-700",
    badge: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30",
    icon: Music,
  },
};
const DEFAULT_CAT = {
  gradient: "from-primary to-primary/60",
  badge: "bg-primary/15 text-primary border border-primary/30",
  icon: GraduationCap,
};
const getCat = (cat: string) => CAT_CONFIG[cat] ?? DEFAULT_CAT;

export default function Events() {
  const { t, language } = useLanguage();
  const { data: cmsEvents = [] } = useCmsEvents();
  const [activeCategory, setActiveCategory] = useState("All");

  const allEvents = useMemo(
    () =>
      [...cmsEvents]
        .map((e) => ({
          id: e.id,
          title: pickLang(e.title, language),
          date: e.date,
          time: e.time,
          location: pickLang(e.location, language),
          description: pickLang(e.description, language),
          category: e.category,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [cmsEvents, language],
  );

  const categoryKeys = useMemo(() => ["All", ...Array.from(new Set(allEvents.map((e) => e.category)))], [allEvents]);

  const filtered = activeCategory === "All" ? allEvents : allEvents.filter((e) => e.category === activeCategory);
  const catCounts: Record<string, number> = { All: allEvents.length };
  categoryKeys.slice(1).forEach((c) => { catCounts[c] = allEvents.filter((e) => e.category === c).length; });

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0f1b4d] via-[#1a2a7a] to-[#0d1a5c] py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-[80px]" />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 mb-6">
            <CalendarDays className="h-8 w-8 text-accent" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold font-serif text-accent mb-3">
            {t("nav.events")}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="text-slate-300 text-lg max-w-2xl mx-auto mb-10">
            {t("events.heroSubtitle")}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="inline-grid grid-cols-2 divide-x divide-white/20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
            {[
              { label: t("events.totalEvents") || "Total Events", value: allEvents.length },
              { label: t("events.totalCategories") || "Categories", value: categoryKeys.length - 1 },
            ].map((s, i) => (
              <div key={i} className="px-10 py-4 text-center">
                <div className="text-3xl font-bold text-accent font-serif">{s.value}</div>
                <div className="text-xs text-slate-300 mt-0.5 font-medium">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Sticky filter bar */}
      <div className="sticky top-[60px] z-30 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {categoryKeys.map((cat) => {
              const active = activeCategory === cat;
              const cfg = cat === "All" ? null : getCat(cat);
              const Icon = cfg?.icon;
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border shrink-0 ${
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:border-border hover:text-foreground"
                  }`}>
                  {Icon && <Icon className="h-3.5 w-3.5" />}
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

      {/* Events list */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div key={activeCategory} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col gap-5">
              {filtered.map((event, i) => {
                const cfg = getCat(event.category);
                const Icon = cfg.icon;
                const d = new Date(event.date);
                return (
                  <motion.div key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer">
                    <div className="flex flex-col md:flex-row">
                      <div className={`md:w-28 bg-gradient-to-br ${cfg.gradient} flex flex-col items-center justify-center py-6 px-4 text-white shrink-0`}>
                        <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">
                          {d.toLocaleDateString("en-US", { month: "short" })}
                        </div>
                        <div className="text-4xl font-bold font-serif leading-none">{d.getDate()}</div>
                        <div className="text-xs opacity-70 mt-1">{d.getFullYear()}</div>
                      </div>

                      <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.badge}`}>
                            <Icon className="h-3 w-3" /> {event.category}
                          </span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold mb-2 group-hover:text-primary transition-colors leading-snug">
                          {event.title}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-5 text-sm md:text-base line-clamp-2">
                          {event.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-muted-foreground">
                          <span className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                            </div>
                            {event.time}
                          </span>
                          <span className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                              <MapPin className="h-3.5 w-3.5 text-primary" />
                            </div>
                            {event.location}
                          </span>
                        </div>
                      </div>

                      <div className="hidden md:flex items-center pr-6">
                        <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-colors">
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {filtered.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No events in this category.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

import { useLanguage } from "@/hooks/useLanguage";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Star, Globe, Flag, GraduationCap, Users } from "lucide-react";
import { useState, useMemo } from "react";
import { useCmsStudents } from "@/hooks/useCms";
import { pickLang } from "@/lib/cms";

const MEDAL_AWARD: Record<string, string> = {
  gold: "Gold Medal",
  silver: "Silver Medal",
  bronze: "Bronze Medal",
};

const FALLBACK_STUDENTS = [
  { id: 1, name: "Jasur Qodirov",     year: "2024", subject: "Math",     level: "International", award: "Gold Medal",   event: "International Mathematical Olympiad (IMO)" },
  { id: 2, name: "Malika Tursunova",  year: "2024", subject: "Physics",  level: "International", award: "Silver Medal", event: "Asian Physics Olympiad (APhO)" },
  { id: 3, name: "Aziz Rakhimov",     year: "2023", subject: "Chemistry",level: "National",      award: "Gold Medal",   event: "National Science Olympiad" },
  { id: 4, name: "Dilnoza Aliyeva",   year: "2024", subject: "Biology",  level: "Regional",      award: "1st Place",    event: "Tashkent Region Biology Championship" },
  { id: 5, name: "Sardor Usmanov",    year: "2023", subject: "IT",       level: "International", award: "Bronze Medal", event: "International Olympiad in Informatics (IOI)" },
  { id: 6, name: "Nargiza Karimova",  year: "2024", subject: "English",  level: "National",      award: "1st Place",    event: "National English Speaking Competition" },
];

const LEVEL_CONFIG: Record<string, { gradient: string; badge: string; icon: React.ComponentType<{ className?: string }>; accentColor: string }> = {
  International: {
    gradient: "from-[#0f1b4d] via-[#1e3a8a] to-[#0d2060]",
    badge: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    icon: Globe,
    accentColor: "text-blue-400",
  },
  National: {
    gradient: "from-amber-700 via-orange-600 to-amber-800",
    badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    icon: Flag,
    accentColor: "text-amber-300",
  },
  Regional: {
    gradient: "from-emerald-700 via-teal-600 to-emerald-800",
    badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    icon: GraduationCap,
    accentColor: "text-emerald-300",
  },
};

const AWARD_CONFIG: Record<string, { color: string; bg: string; border: string; icon: React.ComponentType<{ className?: string }> }> = {
  "Gold Medal":   { color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30", icon: Medal },
  "Silver Medal": { color: "text-slate-400",  bg: "bg-slate-400/10",  border: "border-slate-400/30",  icon: Medal },
  "Bronze Medal": { color: "text-amber-700",  bg: "bg-amber-700/10",  border: "border-amber-700/30",  icon: Medal },
  "1st Place":    { color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30", icon: Trophy },
};

const filterKeys = ["All", "International", "National", "Math", "Physics", "IT"];

const SUBJ_COLORS: Record<string, string> = {
  Math:      "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  Physics:   "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300",
  Chemistry: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
  Biology:   "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  IT:        "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300",
  English:   "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
};

export default function Students() {
  const { t, language } = useLanguage();
  const { data: cmsStudents = [] } = useCmsStudents();
  const [filter, setFilter] = useState("All");

  const sampleStudents = useMemo(() => {
    if (!cmsStudents.length) return FALLBACK_STUDENTS;
    return cmsStudents.map((s) => ({
      id: s.id,
      name: pickLang(s.name, language),
      year: String(s.year),
      subject: "Olympiad",
      level: s.country.includes("International") || s.country.includes("🇬🇧") || s.country.includes("🇯🇵") ? "International" : "National",
      award: MEDAL_AWARD[s.medalType] ?? s.medalType,
      event: pickLang(s.olympiad, language),
      photo: s.photo,
      achievement: pickLang(s.achievement, language),
    }));
  }, [cmsStudents, language]);

  const filteredStudents =
    filter === "All"
      ? sampleStudents
      : sampleStudents.filter((s) => s.level === filter || s.subject === filter);

  const stats = [
    { label: t("students.totalChampions") || "Champions", value: sampleStudents.length, icon: Users },
    { label: t("students.filters.International") || "International", value: sampleStudents.filter(s => s.level === "International").length, icon: Globe },
    { label: t("achievements.goldMedals") || "Gold Medals", value: sampleStudents.filter(s => s.award === "Gold Medal").length, icon: Trophy },
  ];

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0f1b4d] via-[#1a2a7a] to-[#0d1a5c] py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-yellow-500/10 rounded-full blur-[80px]" />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 mb-6">
            <Trophy className="h-8 w-8 text-accent" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold font-serif text-accent mb-3">
            {t("nav.students")}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="text-slate-300 text-lg max-w-2xl mx-auto mb-10">
            {t("students.heroSubtitle")}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="inline-grid grid-cols-3 divide-x divide-white/20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
            {stats.map((s, i) => (
              <div key={i} className="px-6 py-4 text-center">
                <div className="text-3xl font-bold text-accent font-serif">{s.value}</div>
                <div className="text-xs text-slate-300 mt-0.5 font-medium">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Champions spotlight */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-bold tracking-widest text-primary uppercase mb-2">{t("students.featuredChampions") || "Featured Champions"}</p>
            <h2 className="text-3xl md:text-4xl font-bold font-serif">{t("students.topPerformers") || "Our Top Performers"}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-6">
            {sampleStudents.slice(0, 2).map((student, i) => {
              const lvl = LEVEL_CONFIG[student.level] ?? LEVEL_CONFIG.Regional;
              const LvlIcon = lvl.icon;
              const aw = AWARD_CONFIG[student.award];
              const AwardIcon = aw?.icon ?? Star;
              return (
                <motion.div key={student.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl overflow-hidden border border-border shadow-xl group">
                  <div className={`bg-gradient-to-br ${lvl.gradient} p-8 relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-[0.07]"
                      style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-white border border-white/20 mb-4`}>
                          <LvlIcon className="h-3 w-3" /> {student.level}
                        </span>
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mb-4 shadow-lg overflow-hidden">
                          {(student as any).photo ? (
                            <img src={(student as any).photo} alt={student.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl font-serif font-bold text-white">
                              {student.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("")}
                            </span>
                          )}
                        </div>
                        <h3 className={`text-2xl font-bold text-white mb-1`}>{student.name}</h3>
                        <p className={`${lvl.accentColor} font-semibold text-sm`}>{student.subject} · {student.year}</p>
                      </div>
                      <div className={`flex flex-col items-center gap-1 ${aw?.color ?? "text-yellow-400"}`}>
                        <AwardIcon className="h-10 w-10 drop-shadow-lg" />
                        <span className="text-white text-xs font-bold text-center leading-tight max-w-[60px]">{student.award}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card p-5 border-t border-border">
                    <p className="text-sm text-muted-foreground leading-snug">{student.event}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="grid md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {sampleStudents.slice(2, 6).map((student, i) => {
              const lvl = LEVEL_CONFIG[student.level] ?? LEVEL_CONFIG.Regional;
              const LvlIcon = lvl.icon;
              const aw = AWARD_CONFIG[student.award];
              const AwardIcon = aw?.icon ?? Star;
              return (
                <motion.div key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 group">
                  <div className={`h-2 bg-gradient-to-r ${lvl.gradient}`} />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-lg font-bold font-serif shrink-0 overflow-hidden">
                        {(student as any).photo ? (
                          <img src={(student as any).photo} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                          student.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("")
                        )}
                      </div>
                      <div className={`flex items-center gap-1 ${aw?.color ?? "text-yellow-500"}`}>
                        <AwardIcon className="h-5 w-5" />
                      </div>
                    </div>
                    <h4 className="font-bold text-sm mb-1 leading-snug group-hover:text-primary transition-colors">{student.name}</h4>
                    <p className="text-xs text-muted-foreground mb-3">{student.year}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{t("students.subjectLabel")}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${SUBJ_COLORS[student.subject] ?? "bg-muted text-foreground"}`}>
                          {student.subject}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{t("students.levelLabel")}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${lvl.badge}`}>
                          <LvlIcon className="inline h-2.5 w-2.5 mr-0.5" />{student.level}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-border">
                        <div className={`text-xs font-bold flex items-center gap-1 ${aw?.color ?? "text-yellow-500"}`}>
                          <AwardIcon className="h-3 w-3" /> {student.award}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{student.event}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Filter grid */}
      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {filterKeys.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                  filter === f
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}>
                {t(`students.filters.${f}`) || f}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={filter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {filteredStudents.map((student) => {
                const lvl = LEVEL_CONFIG[student.level] ?? LEVEL_CONFIG.Regional;
                const LvlIcon = lvl.icon;
                const aw = AWARD_CONFIG[student.award];
                const AwardIcon = aw?.icon ?? Star;
                return (
                  <motion.div key={student.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                    <div className={`h-1.5 bg-gradient-to-r ${lvl.gradient}`} />
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center text-base font-bold font-serif shrink-0 group-hover:bg-primary/10 transition-colors">
                          {student.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors">{student.name}</h4>
                          <p className="text-xs text-muted-foreground">{student.year}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-xs">{t("students.subjectLabel")}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${SUBJ_COLORS[student.subject] ?? "bg-muted"}`}>
                            {student.subject}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-xs">{t("students.levelLabel")}</span>
                          <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded border ${lvl.badge}`}>
                            <LvlIcon className="h-2.5 w-2.5" /> {student.level}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-border">
                          <div className={`flex items-center gap-1.5 font-bold text-xs ${aw?.color ?? "text-yellow-500"}`}>
                            <AwardIcon className="h-3.5 w-3.5" /> {student.award}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{student.event}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

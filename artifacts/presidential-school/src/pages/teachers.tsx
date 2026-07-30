import { useLanguage } from "@/hooks/useLanguage";
import { motion, AnimatePresence } from "framer-motion";
import { useCmsTeachers } from "@/hooks/useCms";
import {
  Search,
  GraduationCap,
  Phone,
  Star,
  Users,
  BookOpen,
  Languages,
  Calculator,
  Zap,
  FlaskConical,
  Dna,
  BookMarked,
  Code2,
  Landmark,
  Trophy,
  Map,
  LayoutGrid,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

type SubjectKey =
  | "English"
  | "Math"
  | "Physics"
  | "Chemistry"
  | "Biology"
  | "Uzbek"
  | "Russian"
  | "IT"
  | "History"
  | "Geography"
  | "Sports";

const subjectConfig: Record<
  SubjectKey,
  {
    bg: string;
    avatarBg: string;
    avatarIcon: string;
    headerColor: string;
    badgeBg: string;
    badgeText: string;
    borderColor: string;
    iconBg: string;
  }
> = {
  English: {
    bg: "bg-amber-50 dark:bg-amber-950/20",
    avatarBg: "bg-amber-200 dark:bg-amber-800/50",
    avatarIcon: "text-amber-600 dark:text-amber-400",
    headerColor: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-amber-100 dark:bg-amber-900/40",
    badgeText: "text-amber-700 dark:text-amber-300",
    borderColor: "border-amber-200 dark:border-amber-700",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
  },
  Math: {
    bg: "bg-blue-50 dark:bg-blue-950/20",
    avatarBg: "bg-blue-200 dark:bg-blue-800/50",
    avatarIcon: "text-blue-600 dark:text-blue-400",
    headerColor: "text-blue-600 dark:text-blue-400",
    badgeBg: "bg-blue-100 dark:bg-blue-900/40",
    badgeText: "text-blue-700 dark:text-blue-300",
    borderColor: "border-blue-200 dark:border-blue-700",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
  },
  Physics: {
    bg: "bg-violet-50 dark:bg-violet-950/20",
    avatarBg: "bg-violet-200 dark:bg-violet-800/50",
    avatarIcon: "text-violet-600 dark:text-violet-400",
    headerColor: "text-violet-600 dark:text-violet-400",
    badgeBg: "bg-violet-100 dark:bg-violet-900/40",
    badgeText: "text-violet-700 dark:text-violet-300",
    borderColor: "border-violet-200 dark:border-violet-700",
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
  },
  Chemistry: {
    bg: "bg-green-50 dark:bg-green-950/20",
    avatarBg: "bg-green-200 dark:bg-green-800/50",
    avatarIcon: "text-green-600 dark:text-green-400",
    headerColor: "text-green-600 dark:text-green-400",
    badgeBg: "bg-green-100 dark:bg-green-900/40",
    badgeText: "text-green-700 dark:text-green-300",
    borderColor: "border-green-200 dark:border-green-700",
    iconBg: "bg-green-100 dark:bg-green-900/40",
  },
  Biology: {
    bg: "bg-teal-50 dark:bg-teal-950/20",
    avatarBg: "bg-teal-200 dark:bg-teal-800/50",
    avatarIcon: "text-teal-600 dark:text-teal-400",
    headerColor: "text-teal-600 dark:text-teal-400",
    badgeBg: "bg-teal-100 dark:bg-teal-900/40",
    badgeText: "text-teal-700 dark:text-teal-300",
    borderColor: "border-teal-200 dark:border-teal-700",
    iconBg: "bg-teal-100 dark:bg-teal-900/40",
  },
  Uzbek: {
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    avatarBg: "bg-emerald-200 dark:bg-emerald-800/50",
    avatarIcon: "text-emerald-600 dark:text-emerald-400",
    headerColor: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-100 dark:bg-emerald-900/40",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    borderColor: "border-emerald-200 dark:border-emerald-700",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  Russian: {
    bg: "bg-red-50 dark:bg-red-950/20",
    avatarBg: "bg-red-200 dark:bg-red-800/50",
    avatarIcon: "text-red-600 dark:text-red-400",
    headerColor: "text-red-600 dark:text-red-400",
    badgeBg: "bg-red-100 dark:bg-red-900/40",
    badgeText: "text-red-700 dark:text-red-300",
    borderColor: "border-red-200 dark:border-red-700",
    iconBg: "bg-red-100 dark:bg-red-900/40",
  },
  IT: {
    bg: "bg-indigo-50 dark:bg-indigo-950/20",
    avatarBg: "bg-indigo-200 dark:bg-indigo-800/50",
    avatarIcon: "text-indigo-600 dark:text-indigo-400",
    headerColor: "text-indigo-600 dark:text-indigo-400",
    badgeBg: "bg-indigo-100 dark:bg-indigo-900/40",
    badgeText: "text-indigo-700 dark:text-indigo-300",
    borderColor: "border-indigo-200 dark:border-indigo-700",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/40",
  },
  History: {
    bg: "bg-orange-50 dark:bg-orange-950/20",
    avatarBg: "bg-orange-200 dark:bg-orange-800/50",
    avatarIcon: "text-orange-600 dark:text-orange-400",
    headerColor: "text-orange-600 dark:text-orange-400",
    badgeBg: "bg-orange-100 dark:bg-orange-900/40",
    badgeText: "text-orange-700 dark:text-orange-300",
    borderColor: "border-orange-200 dark:border-orange-700",
    iconBg: "bg-orange-100 dark:bg-orange-900/40",
  },
  Geography: {
    bg: "bg-lime-50 dark:bg-lime-950/20",
    avatarBg: "bg-lime-200 dark:bg-lime-800/50",
    avatarIcon: "text-lime-600 dark:text-lime-400",
    headerColor: "text-lime-600 dark:text-lime-400",
    badgeBg: "bg-lime-100 dark:bg-lime-900/40",
    badgeText: "text-lime-700 dark:text-lime-300",
    borderColor: "border-lime-200 dark:border-lime-700",
    iconBg: "bg-lime-100 dark:bg-lime-900/40",
  },
  Sports: {
    bg: "bg-cyan-50 dark:bg-cyan-950/20",
    avatarBg: "bg-cyan-200 dark:bg-cyan-800/50",
    avatarIcon: "text-cyan-600 dark:text-cyan-400",
    headerColor: "text-cyan-600 dark:text-cyan-400",
    badgeBg: "bg-cyan-100 dark:bg-cyan-900/40",
    badgeText: "text-cyan-700 dark:text-cyan-300",
    borderColor: "border-cyan-200 dark:border-cyan-700",
    iconBg: "bg-cyan-100 dark:bg-cyan-900/40",
  },
};

const gradeConfig: Record<string, { bg: string; text: string; border: string }> = {
  "Oliy toifa": {
    bg: "bg-violet-100 dark:bg-violet-900/30",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-200 dark:border-violet-700",
  },
  "1-toifa": {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-300",
    border: "border-green-200 dark:border-green-700",
  },
  "2-toifa": {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-700",
  },
  "Yosh mutaxassis": {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-700",
  },
};

const subjectOrder: SubjectKey[] = [
  "English","Math","Physics","Chemistry","Biology",
  "Uzbek","Russian","IT","History","Geography","Sports",
];

const subjectIcons: Record<SubjectKey, LucideIcon> = {
  English: Languages,
  Math: Calculator,
  Physics: Zap,
  Chemistry: FlaskConical,
  Biology: Dna,
  Uzbek: BookOpen,
  Russian: BookMarked,
  IT: Code2,
  History: Landmark,
  Geography: Map,
  Sports: Trophy,
};

export default function Teachers() {
  const { t } = useLanguage();
  const { data: teachers = [] } = useCmsTeachers();
  const [search, setSearch] = useState("");
  const [activeSubject, setActiveSubject] = useState<string>("All");

  const filterKeys = ["All", ...subjectOrder];

  const subjectLabel = (key: SubjectKey): string => {
    const map: Record<SubjectKey, string> = {
      English: t("teachers.subjects.English"),
      Math: t("teachers.subjects.Math"),
      Physics: t("teachers.subjects.Physics"),
      Chemistry: t("teachers.subjects.Chemistry"),
      Biology: t("teachers.subjects.Biology"),
      Uzbek: t("teachers.subjects.Uzbek"),
      Russian: t("teachers.subjects.Russian"),
      IT: t("teachers.subjects.IT"),
      History: t("teachers.subjects.History"),
      Geography: t("teachers.subjects.Geography"),
      Sports: t("teachers.subjects.Sports"),
    };
    return map[key] ?? key;
  };

  const filterLabel = (key: string) => {
    if (key === "All") return t("teachers.subjects.All");
    return subjectLabel(key as SubjectKey);
  };

  const grouped = useMemo(() => {
    return subjectOrder
      .map((subj) => {
        const list = teachers.filter((tc) => {
          const matchSubject = tc.subject === subj;
          const matchFilter = activeSubject === "All" || activeSubject === subj;
          const matchSearch = tc.name.toLowerCase().includes(search.toLowerCase());
          return matchSubject && matchFilter && matchSearch;
        });
        return { subj, list };
      })
      .filter(({ list }) => list.length > 0);
  }, [search, activeSubject, teachers]);

  const totalShown = grouped.reduce((a, g) => a + g.list.length, 0);

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0f1b4d] via-[#1a2a7a] to-[#0d1a5c] py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px]" />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 mb-6"
          >
            <Users className="h-8 w-8 text-accent" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold font-serif text-accent mb-3"
          >
            {t("nav.teachers")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-slate-300 text-lg max-w-2xl mx-auto mb-8"
          >
            {t("teachers.heroSubtitle")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-grid grid-cols-3 divide-x divide-white/20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden"
          >
            {[
              { value: teachers.length, label: t("teachers.stats.teachers") },
              { value: subjectOrder.length, label: t("teachers.stats.subjects") },
              {
                value: teachers.filter((tc) => tc.grade === "Oliy toifa").length,
                label: t("teachers.stats.topGrade"),
              },
            ].map((s, i) => (
              <div key={i} className="px-8 py-4 text-center">
                <div className="text-3xl font-bold text-accent font-serif">{s.value}</div>
                <div className="text-xs text-slate-300 mt-0.5 font-medium">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Search + Filter */}
      <section className="sticky top-[72px] z-30 bg-background/95 backdrop-blur border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("teachers.searchPlaceholder")}
                className="pl-9 h-10 bg-muted"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {filterKeys.map((key) => {
                const Icon = key === "All" ? LayoutGrid : subjectIcons[key as SubjectKey];
                const isActive = activeSubject === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveSubject(key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow"
                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                    {filterLabel(key)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Teacher Groups */}
      <div className="container mx-auto px-4 py-10 space-y-14">
        <AnimatePresence>
          {grouped.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 text-muted-foreground"
            >
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">{t("teachers.noResults")}</p>
            </motion.div>
          ) : (
            grouped.map(({ subj, list }, gi) => {
              const cfg = subjectConfig[subj];
              return (
                <motion.section
                  key={subj}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: gi * 0.05 }}
                >
                  {/* Subject Header */}
                  <div className="flex items-center gap-3 mb-6">
                    {(() => { const Icon = subjectIcons[subj]; return (
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.iconBg}`}>
                        <Icon className={`h-5 w-5 ${cfg.avatarIcon}`} strokeWidth={2} />
                      </div>
                    ); })()}
                    <h2 className={`text-xl font-bold ${cfg.headerColor}`}>
                      {subjectLabel(subj)}
                    </h2>
                    <div className={`flex-1 h-px ${cfg.borderColor} border-t ml-2`} />
                  </div>

                  {/* Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {list.map((teacher, i) => {
                      const gc = gradeConfig[teacher.grade] ?? gradeConfig["2-toifa"];
                      return (
                        <motion.div
                          key={teacher.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.04 }}
                          className={`rounded-2xl overflow-hidden border ${cfg.borderColor} bg-card shadow-sm hover:shadow-lg transition-all group`}
                        >
                          {/* Colored avatar area */}
                          <div className={`${cfg.avatarBg} flex items-center justify-center py-6 relative overflow-hidden`}>
                            {teacher.photo ? (
                              <img src={teacher.photo} alt={teacher.name} className="w-20 h-20 rounded-full object-cover border-2 border-white/30" />
                            ) : (
                              <div className={`${cfg.avatarIcon}`}>
                                <svg viewBox="0 0 80 80" width="64" height="64" fill="currentColor">
                                  <circle cx="40" cy="26" r="14" />
                                  <path d="M10 72c0-16.569 13.431-30 30-30s30 13.431 30 30H10z" />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Info area */}
                          <div className="p-3.5 space-y-2">
                            {/* Name */}
                            <h3 className={`font-bold text-sm leading-tight ${cfg.headerColor} line-clamp-2 min-h-[2.5rem]`}>
                              {teacher.name}
                            </h3>

                            {/* Subject badge */}
                            <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badgeBg} ${cfg.badgeText}`}>
                              {subjectLabel(subj)}
                            </span>

                            {/* Grade badge */}
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold border ${gc.bg} ${gc.text} ${gc.border}`}>
                              <Star className="h-3 w-3 fill-current" />
                              {teacher.grade}
                            </div>

                            {/* Phone */}
                            <a
                              href={`tel:${teacher.phone.replace(/\s/g, "")}`}
                              className="flex items-center gap-1.5 bg-muted hover:bg-muted/70 transition-colors rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-foreground"
                            >
                              <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span className="truncate">{teacher.phone}</span>
                            </a>

                            {/* University */}
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                              <GraduationCap className="h-3 w-3 shrink-0" />
                              <span className="truncate">
                                {teacher.university} ({teacher.graduationYear})
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.section>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

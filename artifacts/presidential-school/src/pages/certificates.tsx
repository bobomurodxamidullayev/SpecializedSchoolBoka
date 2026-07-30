import { useLanguage } from "@/hooks/useLanguage";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { useCmsCertificates, useCmsSubjectResults, useCmsEnglishCerts } from "@/hooks/useCms";
import { pickLang } from "@/lib/cms";
import type { CmsSubjectResult } from "@/lib/cms";
import {
  Award,
  BookOpen,
  Globe,
  TrendingUp,
  Calculator,
  FlaskConical,
  Dna,
  Zap,
  BookMarked,
  Languages,
  GraduationCap,
  MessageCircle,
  Scroll,
  FileCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ICON_MAP: Record<string, LucideIcon> = {
  Calculator,
  BookOpen,
  BookMarked,
  FlaskConical,
  Dna,
  Zap,
  Languages,
  Globe,
  Award,
  GraduationCap,
  FileCheck,
  Scroll,
  MessageCircle,
};

const LEVEL_GRADIENTS: Record<string, { gradient: string; shadow: string }> = {
  B1: { gradient: "from-blue-600 to-indigo-700", shadow: "shadow-blue-500/30" },
  B2: { gradient: "from-violet-600 to-purple-700", shadow: "shadow-violet-500/30" },
  C1: { gradient: "from-orange-500 to-red-600", shadow: "shadow-orange-500/30" },
  C2: { gradient: "from-rose-500 to-pink-600", shadow: "shadow-rose-500/30" },
};

const gradeColor = (grade: string) => {
  if (grade === "A+" || grade === "A") return "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700";
  if (grade === "B+" || grade === "B") return "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700";
  return "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700";
};

const DEFAULT_FOREIGN = [
  {
    name: "IELTS",
    icon: FileCheck,
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    total: 23,
    levels: [{ grade: "7.0+", count: 3 }, { grade: "6.5", count: 8 }, { grade: "6.0", count: 12 }],
  },
  {
    name: "SAT",
    icon: GraduationCap,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/40",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    total: 7,
    levels: [{ grade: "1400+", count: 2 }, { grade: "1200+", count: 5 }],
  },
  {
    name: "DELF (Fransuz)",
    icon: MessageCircle,
    iconBg: "bg-red-100 dark:bg-red-900/40",
    iconColor: "text-red-600 dark:text-red-400",
    total: 4,
    levels: [{ grade: "B2", count: 3 }, { grade: "C1", count: 1 }],
  },
  {
    name: "HSK (Xitoy)",
    icon: Scroll,
    iconBg: "bg-rose-100 dark:bg-rose-900/40",
    iconColor: "text-rose-600 dark:text-rose-400",
    total: 5,
    levels: [{ grade: "HSK-4", count: 3 }, { grade: "HSK-5", count: 2 }],
  },
];

function getSubjectIcon(subj: CmsSubjectResult): LucideIcon {
  return ICON_MAP[subj.iconKey] ?? BookOpen;
}

type Tab = "national" | "foreign";

export default function Certificates() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>("national");

  const { data: cmsCerts = [] } = useCmsCertificates();
  const { data: subjectResults = [] } = useCmsSubjectResults();
  const { data: englishCerts } = useCmsEnglishCerts();

  const nationalSubjects = subjectResults;

  const englishLevels = useMemo(() => {
    if (!englishCerts?.levels?.length) return [];
    return englishCerts.levels;
  }, [englishCerts]);

  const englishLevelsTotal = useMemo(() =>
    englishLevels.reduce((s, l) => s + l.count, 0),
    [englishLevels]
  );

  const growthData = useMemo(() => {
    if (!englishCerts?.growthData?.length) return [];
    return [...englishCerts.growthData].sort((a, b) => a.year.localeCompare(b.year));
  }, [englishCerts]);

  const growthPeriod = useMemo(() => {
    if (!growthData.length) return "";
    const years = growthData.map((d) => d.year).sort();
    return years.length === 1 ? years[0] : `${years[0]}–${years[years.length - 1]}`;
  }, [growthData]);

  const displayForeignCerts = useMemo(() => {
    const intl = cmsCerts.filter((c) => c.level === "International");
    if (!intl.length) return DEFAULT_FOREIGN;
    return intl.map((c) => ({
      name: pickLang(c.name, language),
      icon: FileCheck,
      iconBg: "bg-blue-100 dark:bg-blue-900/40",
      iconColor: "text-blue-600 dark:text-blue-400",
      total: c.quantity,
      levels: [{ grade: c.subject, count: c.quantity }],
    }));
  }, [cmsCerts, language]);

  const foreignTotal = displayForeignCerts.reduce((sum, c) => sum + c.total, 0);

  const nationalTotal = useMemo(() =>
    nationalSubjects.reduce((sum, s) => sum + s.grades.reduce((a, g) => a + g.count, 0), 0),
    [nationalSubjects]
  );

  // True total = subject olympiad results + English CEFR levels + foreign/international certs
  const allCertsTotal = nationalTotal + englishLevelsTotal + foreignTotal;

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
            <Award className="h-8 w-8 text-accent" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold font-serif text-accent mb-3"
          >
            {t("nav.certificates")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-slate-300 text-lg max-w-xl mx-auto mb-10"
          >
            {t("certificates.heroSubtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-grid grid-cols-3 divide-x divide-white/20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden"
          >
            {[
              { label: t("certificates.stats.total"), value: String(allCertsTotal) },
              { label: t("certificates.stats.national"), value: String(nationalTotal + englishLevelsTotal) },
              { label: t("certificates.stats.foreign"), value: String(foreignTotal) },
            ].map((s, i) => (
              <div key={i} className="px-8 py-5 text-center">
                <div className="text-3xl font-bold text-accent font-serif">{s.value}</div>
                <div className="text-xs text-slate-300 mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tabs */}
      <section className="sticky top-[72px] z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 py-3 w-fit">
            {(["national", "foreign"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {tab === "national" ? <BookOpen className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                {t(`certificates.tabs.${tab}`)}
                {tab === "foreign" && (
                  <span className="ml-1 text-[10px] font-bold bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full">
                    NEW
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence mode="wait">
        {activeTab === "national" ? (
          <motion.div
            key="national"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* Core subjects */}
            <section className="py-14 bg-muted/30">
              <div className="container mx-auto px-4">
                <div className="mb-10">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-1">{t("certificates.sections.coreSubjectsLabel")}</h2>
                  <h3 className="text-2xl md:text-3xl font-bold font-serif">{t("certificates.sections.coreSubjectsTitle")}</h3>
                </div>

                {nationalSubjects.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground">Ma'lumot yuklanmoqda...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {nationalSubjects.map((subj, i) => {
                      const Icon = getSubjectIcon(subj);
                      return (
                        <motion.div
                          key={subj.id}
                          initial={{ opacity: 0, y: 16 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.07 }}
                          className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-center gap-3 mb-5">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${subj.iconBg}`}>
                              <Icon className={`h-5 w-5 ${subj.iconColor}`} strokeWidth={2} />
                            </div>
                            <h4 className="font-bold text-lg">{subj.name}</h4>
                            <div className="ml-auto text-xs text-muted-foreground font-semibold">
                              {(subj.grades ?? []).reduce((a, g) => a + g.count, 0)} {t("certificates.totalLabel")}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            {(subj.grades ?? []).map((g) => (
                              <div key={g.grade} className={`rounded-xl p-3 text-center ${gradeColor(g.grade)}`}>
                                <div className="text-xs font-bold mb-1">{g.grade}</div>
                                <div className="text-xl font-bold font-serif">{g.count}</div>
                                <div className="text-[10px] font-medium opacity-70 mt-0.5">{t("certificates.taLabel")}</div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* English national certificates */}
            <section className="py-14 bg-background">
              <div className="container mx-auto px-4">
                <div className="mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Languages className="h-5 w-5 text-primary" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{t("certificates.sections.englishTitle")}</h3>
                    <p className="text-sm text-muted-foreground">{t("certificates.sections.nationalCertLabel")}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-12">
                  {englishLevels.map((lvl, i) => {
                    const style = LEVEL_GRADIENTS[lvl.level] ?? { gradient: "from-slate-600 to-slate-700", shadow: "shadow-slate-500/30" };
                    return (
                      <motion.div
                        key={lvl.level}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className={`bg-gradient-to-br ${style.gradient} text-white rounded-2xl p-5 min-w-[140px] shadow-lg ${style.shadow}`}
                      >
                        <div className="text-xs font-semibold opacity-80 mb-1">Daraja</div>
                        <div className="text-4xl font-bold font-serif mb-1">{lvl.level}</div>
                        <div className="text-2xl font-bold">{lvl.count}</div>
                        <div className="text-xs opacity-70 mt-0.5">{t("certificates.taLabel")}</div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Growth chart */}
                {growthData.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-card border border-border rounded-2xl p-6 md:p-8"
                  >
                    <div className="flex items-start gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{t("certificates.chart.title")}</h4>
                        <p className="text-sm text-muted-foreground">{t("certificates.chart.subtitle")}</p>
                      </div>
                    </div>

                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={growthData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="certGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b5bdb" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#3b5bdb" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} />
                        <XAxis dataKey="year" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "12px",
                            fontSize: "13px",
                          }}
                          formatter={(value: number) => [value, t("certificates.chart.legend")]}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#3b5bdb"
                          strokeWidth={2.5}
                          fill="url(#certGradient)"
                          dot={{ fill: "#3b5bdb", r: 4, strokeWidth: 2, stroke: "#fff" }}
                          activeDot={{ r: 6 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>

                    <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
                      <span className="inline-block w-3 h-3 rounded-full bg-primary" />
                      <span>{t("certificates.chart.legend")}</span>
                      <span className="font-bold text-foreground">{allCertsTotal} {t("certificates.taLabel")}</span>
                      {growthPeriod && <><span>|</span><span>{t("certificates.chart.period")}{growthPeriod}</span></>}
                    </div>

                    <div className="grid gap-3 mt-6" style={{ gridTemplateColumns: `repeat(${Math.min(growthData.length, 6)}, minmax(0, 1fr))` }}>
                      {growthData.map((d) => (
                        <div key={d.year} className="bg-muted rounded-xl p-3 text-center">
                          <div className="text-xs text-muted-foreground font-medium">{d.year}</div>
                          <div className="text-xl font-bold font-serif mt-1">{d.count}</div>
                          <div className="text-[10px] text-muted-foreground">{t("certificates.taLabel")}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="foreign"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <section className="py-14 bg-muted/30">
              <div className="container mx-auto px-4">
                <div className="mb-10">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-1">{t("certificates.sections.foreignLabel")}</h2>
                  <h3 className="text-2xl md:text-3xl font-bold font-serif">{t("certificates.sections.foreignTitle")}</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                  {displayForeignCerts.map((cert, i) => {
                    const Icon = cert.icon;
                    return (
                      <motion.div
                        key={cert.name}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cert.iconBg}`}>
                            <Icon className={`h-5 w-5 ${cert.iconColor}`} strokeWidth={2} />
                          </div>
                          <div>
                            <h4 className="font-bold">{cert.name}</h4>
                            <p className="text-xs text-muted-foreground">{cert.total} {t("certificates.totalLabel")}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {cert.levels.map((lvl) => (
                            <div key={lvl.grade} className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                              <span className="text-sm font-semibold">{lvl.grade}</span>
                              <span className="text-sm font-bold text-primary">{lvl.count} {t("certificates.taLabel")}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="mt-10 bg-gradient-to-br from-[#0f1b4d] to-[#1a2a7a] rounded-2xl p-8 text-white"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Globe className="h-6 w-6 text-accent" />
                    <h4 className="text-xl font-bold font-serif">{t("certificates.sections.foreignSummary")}</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: t("certificates.stats.foreign"), value: String(foreignTotal) },
                      { label: t("certificates.foreign.countries"), value: String(displayForeignCerts.length) },
                      { label: t("certificates.foreign.certTypes"), value: String(displayForeignCerts.length) },
                      { label: t("certificates.foreign.topScore"), value: String(new Date().getFullYear()) },
                    ].map((s, i) => (
                      <div key={i} className="bg-white/10 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-accent font-serif">{s.value}</div>
                        <div className="text-xs text-slate-300 mt-1">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

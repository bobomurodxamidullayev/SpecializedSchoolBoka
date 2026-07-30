import { useLanguage } from "@/hooks/useLanguage";
import { motion } from "framer-motion";
import { Calculator, FlaskConical, Languages, Monitor, Brain, Users, ArrowRight, BookOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCmsDirections } from "@/hooks/useCms";
import { pickLang } from "@/lib/cms";

const icons = [Calculator, FlaskConical, Monitor, Languages];

const DIR_COLORS = [
  { gradient: "from-blue-500 to-indigo-600", light: "bg-blue-500/10 text-blue-600 dark:text-blue-400", badge: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30" },
  { gradient: "from-emerald-500 to-teal-600", light: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  { gradient: "from-violet-500 to-purple-600", light: "bg-violet-500/10 text-violet-600 dark:text-violet-400", badge: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30" },
  { gradient: "from-amber-500 to-orange-600", light: "bg-amber-500/10 text-amber-600 dark:text-amber-400", badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" },
];

export default function Directions() {
  const { t, language } = useLanguage();
  const { data: cmsDirections = [] } = useCmsDirections();

  const directions = cmsDirections.map((d) => ({
    id: d.id,
    title: pickLang(d.name, language),
    desc: pickLang(d.desc, language),
    subjects: pickLang(d.subjects, language).split("\n").filter(Boolean),
    careers: pickLang(d.careers, language).split("\n").filter(Boolean),
    students: d.students,
    teachers: d.teachers,
    labs: d.labs,
  }));

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0f1b4d] via-[#1a2a7a] to-[#0d1a5c] py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px]" />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 mb-6">
            <BookOpen className="h-8 w-8 text-accent" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold font-serif text-accent mb-3">
            {t("nav.directions")}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="text-slate-300 text-lg max-w-2xl mx-auto mb-10">
            {t("directions.heroSubtitle")}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="inline-grid grid-cols-3 divide-x divide-white/20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
            {[
              { label: t("directions.statsLabels.students") || "Students", value: "1,200+" },
              { label: t("directions.statsLabels.teachers") || "Teachers",  value: "85+" },
              { label: t("directions.statsLabels.labs") || "Labs",          value: "18+" },
            ].map((s, i) => (
              <div key={i} className="px-8 py-4 text-center">
                <div className="text-2xl md:text-3xl font-bold text-accent font-serif">{s.value}</div>
                <div className="text-xs text-slate-300 mt-0.5 font-medium">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Directions tabs */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <Tabs defaultValue={directions[0]?.id ?? "exact"} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 h-auto p-1.5 bg-muted/60 rounded-2xl gap-1.5 mb-12 border border-border">
              {directions.map((dir, i) => {
                const Icon = icons[i];
                const col = DIR_COLORS[i];
                return (
                  <TabsTrigger key={dir.id} value={dir.id}
                    className={`data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border py-4 rounded-xl flex flex-col sm:flex-row items-center gap-2 transition-all`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${col.light} shrink-0`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-semibold text-xs sm:text-sm leading-tight">{dir.title}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {directions.map((dir, i) => {
              const Icon = icons[i % icons.length];
              const col = DIR_COLORS[i % DIR_COLORS.length];
              return (
                <TabsContent key={dir.id} value={dir.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
                    {/* Gradient header strip */}
                    <div className={`bg-gradient-to-r ${col.gradient} p-8 md:p-10 text-white relative overflow-hidden`}>
                      <div className="absolute inset-0 opacity-[0.08]"
                        style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                      <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
                      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg shrink-0">
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl md:text-3xl font-bold font-serif mb-2">{dir.title}</h2>
                          <p className="text-white/75 text-base leading-relaxed max-w-xl">{dir.desc}</p>
                        </div>
                      </div>
                      <div className="relative z-10 mt-8 grid grid-cols-3 gap-4 border-t border-white/20 pt-6">
                        <div>
                          <div className="text-3xl font-bold font-serif">{dir.students}</div>
                          <div className="text-xs text-white/60 uppercase tracking-wider font-semibold mt-1">
                            {t("directions.statsLabels.students")}
                          </div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold font-serif">{dir.teachers}</div>
                          <div className="text-xs text-white/60 uppercase tracking-wider font-semibold mt-1">
                            {t("directions.statsLabels.teachers")}
                          </div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold font-serif">{dir.labs}</div>
                          <div className="text-xs text-white/60 uppercase tracking-wider font-semibold mt-1">
                            {t("directions.statsLabels.labs")}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-8 md:p-10 grid md:grid-cols-2 gap-10">
                      {/* Subjects */}
                      <div>
                        <h3 className="text-lg font-bold mb-5 flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${col.light}`}>
                            <Brain className="h-4 w-4" />
                          </div>
                          {t("directions.coreSubjects")}
                        </h3>
                        <ul className="space-y-2.5">
                          {dir.subjects.map((sub, idx) => (
                            <motion.li key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.06 }}
                              className="flex items-center gap-3 bg-muted/50 hover:bg-muted px-4 py-3 rounded-xl border border-border transition-colors">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${col.light}`}>
                                <ArrowRight className="h-3 w-3" />
                              </div>
                              <span className="font-medium text-sm">{sub}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      {/* Careers */}
                      <div>
                        <h3 className="text-lg font-bold mb-5 flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${col.light}`}>
                            <Users className="h-4 w-4" />
                          </div>
                          {t("directions.careerPathways")}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {dir.careers.map((career, idx) => (
                            <motion.span key={idx}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.05 }}
                              className={`px-4 py-2 rounded-xl text-sm font-semibold border ${col.badge}`}>
                              {career}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </section>
    </div>
  );
}

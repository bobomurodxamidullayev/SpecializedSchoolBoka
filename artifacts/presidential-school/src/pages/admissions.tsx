import { useLanguage } from "@/hooks/useLanguage";
import { useCmsAdmissions, useCmsAdmissionRequirements, useCmsAdmissionDates } from "@/hooks/useCms";
import { pickLang } from "@/lib/cms";
import { motion } from "framer-motion";
import { CheckCircle2, Calendar, FileText, UserCheck, GraduationCap, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

type Step = { title: string; desc: string };

const STEP_COLORS = [
  { gradient: "from-blue-500 to-indigo-600", badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  { gradient: "from-violet-500 to-purple-600", badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20" },
  { gradient: "from-amber-500 to-orange-600", badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  { gradient: "from-emerald-500 to-teal-600", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
];

export default function Admissions() {
  const { t, tRaw, language } = useLanguage();
  const { data: cmsStages = [] } = useCmsAdmissions();
  const { data: cmsRequirements = [] } = useCmsAdmissionRequirements();
  const { data: cmsDates = [] } = useCmsAdmissionDates();

  const stepIcons = [FileText, Calendar, UserCheck, GraduationCap];
  const cmsSteps: Step[] = cmsStages.map((s) => ({
    title: pickLang(s.name, language),
    desc: pickLang(s.description, language),
  }));
  const steps = cmsSteps.length > 0 ? cmsSteps : ((tRaw("admissions.steps") as Step[]) ?? []);

  const requirements = cmsRequirements.length > 0
    ? cmsRequirements.map((r) => pickLang(r.text, language))
    : ((tRaw("admissions.requirements") as string[]) ?? []);

  const dates = cmsDates.length > 0
    ? cmsDates.map((d) => ({ date: d.date, event: pickLang(d.event, language) }))
    : ((tRaw("admissions.dates") as { date: string; event: string }[]) ?? []);

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0f1b4d] via-[#1a2a7a] to-[#0d1a5c] py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px]" />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-accent font-semibold text-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              {t("admissions.applicationsOpen")}
            </div>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20">
              <GraduationCap className="h-8 w-8 text-accent" />
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold font-serif text-accent mb-4">
            {t("nav.admissions")}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="text-slate-300 text-lg max-w-2xl mx-auto mb-10">
            {t("admissions.heroSubtitle")}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Link href="/contact">
              <Button size="lg"
                className="h-14 px-10 text-base rounded-full bg-accent text-accent-foreground hover:bg-accent/90 border-0 shadow-[0_0_40px_-10px_rgba(212,175,55,0.6)] font-bold">
                {t("admissions.applyNow")} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-sm font-bold tracking-widest text-primary uppercase mb-3">{t("admissions.stepPrefix") || "Step by Step"}</p>
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">{t("admissions.processTitle")}</h2>
            <p className="text-muted-foreground text-lg">{t("admissions.processDesc")}</p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="hidden md:block absolute top-10 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-0.5 bg-gradient-to-r from-blue-500 via-violet-500 via-amber-500 to-emerald-500 opacity-30" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {steps.map((step, i) => {
                const Icon = stepIcons[i];
                const col = STEP_COLORS[i];
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="relative text-center group">
                    <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${col.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-105 transition-transform relative z-10`}>
                      <Icon className="h-8 w-8 text-white" />
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center text-[10px] font-bold text-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Requirements & Dates */}
      <section className="py-24 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Requirements */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold font-serif">{t("admissions.requirementsTitle")}</h2>
              </div>
              <ul className="space-y-4">
                {requirements.map((req, i) => (
                  <motion.li key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-md transition-all">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <span className="text-sm leading-relaxed text-muted-foreground">{req}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Important Dates */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <h2 className="text-2xl font-bold font-serif">{t("admissions.importantDatesTitle")}</h2>
              </div>
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                {dates.map((item, i) => (
                  <div key={i}
                    className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-5 ${i < dates.length - 1 ? "border-b border-border" : ""} hover:bg-muted/30 transition-colors group`}>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center">
                        <Calendar className="h-3.5 w-3.5 text-accent" />
                      </div>
                      <span className="font-bold text-sm text-primary whitespace-nowrap">{item.date}</span>
                    </div>
                    <span className="text-sm text-muted-foreground sm:ml-auto">{item.event}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-primary/90 to-accent/80 p-10 md:p-14 text-white text-center shadow-2xl max-w-4xl mx-auto">
            <div className="absolute inset-0 opacity-[0.05]"
              style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold font-serif mb-3">{t("home.ctaTitle")}</h3>
              <p className="text-white/75 max-w-lg mx-auto mb-8">{t("home.ctaDesc")}</p>
              <Link href="/contact">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full h-12 px-8 font-bold shadow-lg">
                  {t("contact.sendMessageTitle") || "Contact Us"} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

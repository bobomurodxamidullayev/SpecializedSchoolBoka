import { useLanguage } from "@/hooks/useLanguage";
import { motion } from "framer-motion";
import { Trophy, Medal, Target, Globe, Flag, Zap } from "lucide-react";
import { useCmsAchievementsInternational, useCmsAchievementsNational } from "@/hooks/useCms";

export default function Achievements() {
  const { t } = useLanguage();
  const { data: internationalAchievements = [] } = useCmsAchievementsInternational();
  const { data: nationalAchievements = [] } = useCmsAchievementsNational();

  const stats = [
    { icon: Trophy,  count: "150+", key: "totalMedals",       color: "text-accent",       bg: "bg-accent/10",      border: "border-accent/20"      },
    { icon: Globe,   count: "45+",  key: "international",     color: "text-blue-500",     bg: "bg-blue-500/10",    border: "border-blue-500/20"    },
    { icon: Medal,   count: "80+",  key: "nationalGolds",     color: "text-yellow-500",   bg: "bg-yellow-500/10",  border: "border-yellow-500/20"  },
    { icon: Target,  count: "100%", key: "universityEntrance",color: "text-emerald-500",  bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
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
            {t("nav.achievements")}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="text-slate-300 text-lg max-w-2xl mx-auto mb-10">
            {t("achievements.heroSubtitle")}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="inline-grid grid-cols-4 divide-x divide-white/20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
            {stats.map((s, i) => (
              <div key={i} className="px-6 py-4 text-center">
                <div className="text-2xl md:text-3xl font-bold text-accent font-serif">{s.count}</div>
                <div className="text-[10px] md:text-xs text-slate-300 mt-0.5 font-medium">{t(`achievements.stats.${s.key}`)}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats cards */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
            {stats.map((stat, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`bg-card border ${stat.border} rounded-2xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow`}>
                <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${stat.bg}`}>
                  <stat.icon className={`h-7 w-7 ${stat.color}`} />
                </div>
                <h3 className="text-4xl font-bold font-serif mb-2">{stat.count}</h3>
                <p className={`font-semibold text-xs uppercase tracking-wider ${stat.color}`}>
                  {t(`achievements.stats.${stat.key}`)}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Medal showcase */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <p className="text-sm font-bold tracking-widest text-primary uppercase mb-2">{t("achievements.medalShowcase")}</p>
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-3">{t("achievements.medalShowcaseDesc")}</h2>
          </div>

          {/* Medal podium */}
          <div className="flex items-end justify-center gap-4 max-w-3xl mx-auto mb-20">
            {/* Silver - 2nd */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="flex-1 max-w-[200px]">
              <div className="bg-card border-2 border-slate-400/30 rounded-t-2xl p-6 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-slate-400/10 rounded-bl-full" />
                <Medal className="h-12 w-12 text-slate-400 mx-auto mb-3 drop-shadow" />
                <div className="text-5xl font-bold font-serif mb-1 text-slate-400">38</div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{t("achievements.silverMedals")}</p>
              </div>
              <div className="bg-slate-400/20 h-14 rounded-b-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-slate-500">2nd</span>
              </div>
            </motion.div>

            {/* Gold - 1st */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0 }}
              className="flex-1 max-w-[220px]">
              <div className="bg-card border-2 border-yellow-500/40 rounded-t-2xl p-8 text-center relative overflow-hidden shadow-xl shadow-yellow-500/10">
                <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-bl-full" />
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <span className="text-2xl">👑</span>
                </div>
                <Medal className="h-16 w-16 text-yellow-500 mx-auto mb-3 drop-shadow-lg mt-2" />
                <div className="text-6xl font-bold font-serif mb-1 text-yellow-500">42</div>
                <p className="text-sm font-bold text-yellow-600 uppercase tracking-widest">{t("achievements.goldMedals")}</p>
              </div>
              <div className="bg-yellow-500/20 h-20 rounded-b-xl flex items-center justify-center border-2 border-yellow-500/40 border-t-0">
                <span className="text-2xl font-bold text-yellow-600">1st</span>
              </div>
            </motion.div>

            {/* Bronze - 3rd */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="flex-1 max-w-[200px]">
              <div className="bg-card border-2 border-amber-700/30 rounded-t-2xl p-6 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-700/10 rounded-bl-full" />
                <Medal className="h-12 w-12 text-amber-700 mx-auto mb-3 drop-shadow" />
                <div className="text-5xl font-bold font-serif mb-1 text-amber-700">51</div>
                <p className="text-sm font-bold text-amber-700 uppercase tracking-widest">{t("achievements.bronzeMedals")}</p>
              </div>
              <div className="bg-amber-700/20 h-10 rounded-b-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-amber-700">3rd</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* International achievements */}
      <section className="py-20 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-sm font-bold tracking-widest text-primary uppercase mb-2">
                <Globe className="inline h-4 w-4 mr-1 mb-0.5" />{t("achievements.stats.international") || "International"}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold font-serif">{t("achievements.internationalTitle") || "World Stage Achievements"}</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-16">
              {internationalAchievements.map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-card border border-border rounded-2xl p-6 flex items-center gap-5 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="text-4xl shrink-0">{item.flag}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{item.subject}</span>
                    </div>
                    <h3 className="font-bold text-base mb-1 group-hover:text-primary transition-colors leading-snug">{item.competition}</h3>
                    <p className="text-xs text-muted-foreground">{item.country}</p>
                  </div>
                  <div className="shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                      item.award.includes("Gold") ? "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30" :
                      item.award.includes("Silver") ? "bg-slate-400/15 text-slate-500 dark:text-slate-400 border border-slate-400/30" :
                      "bg-amber-700/15 text-amber-700 dark:text-amber-500 border border-amber-700/30"
                    }`}>
                      <Medal className="h-3 w-3" /> {item.award}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* National breakdown */}
            <div className="text-center mb-10">
              <p className="text-sm font-bold tracking-widest text-primary uppercase mb-2">
                <Flag className="inline h-4 w-4 mr-1 mb-0.5" />{t("achievements.stats.nationalGolds") || "National"}
              </p>
              <h2 className="text-3xl font-bold font-serif">{t("achievements.nationalTitle") || "National Olympiad Results"}</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {nationalAchievements.map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                  <div className={`h-2 bg-gradient-to-r ${item.color}`} />
                  <div className="p-5 text-center">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-sm mb-1">{item.subject}</h3>
                    <div className="text-3xl font-bold font-serif mb-1">{item.count}</div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{item.award}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

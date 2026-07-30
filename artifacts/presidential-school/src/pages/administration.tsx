import { useLanguage } from "@/hooks/useLanguage";
import { motion } from "framer-motion";
import { useCmsAdministration } from "@/hooks/useCms";
import { pickLang } from "@/lib/cms";
import { Link } from "wouter";
import {
  Mail,
  Phone,
  Clock,
  GraduationCap,
  Shield,
  ChevronRight,
} from "lucide-react";

const roleColors: Record<string, { gradient: string; badge: string; badgeText: string; ring: string }> = {
  principal: {
    gradient: "from-[#0f1b4d] to-[#1a2a7a]",
    badge: "bg-accent/20 text-accent border border-accent/30",
    badgeText: "text-accent",
    ring: "ring-accent/30",
  },
  vicePrincipal: {
    gradient: "from-violet-800 to-violet-900",
    badge: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700",
    badgeText: "text-violet-600 dark:text-violet-400",
    ring: "ring-violet-300/30",
  },
  vicePrincipalSpirit: {
    gradient: "from-teal-800 to-teal-900",
    badge: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700",
    badgeText: "text-teal-600 dark:text-teal-400",
    ring: "ring-teal-300/30",
  },
  psychologist: {
    gradient: "from-rose-800 to-rose-900",
    badge: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700",
    badgeText: "text-rose-600 dark:text-rose-400",
    ring: "ring-rose-300/30",
  },
};

const STAFF_GRADIENTS = [
  "from-[#0f1b4d] to-[#1a2a7a]",
  "from-violet-800 to-violet-900",
  "from-teal-800 to-teal-900",
  "from-rose-800 to-rose-900",
];

export default function Administration() {
  const { t, language } = useLanguage();
  const { data: cmsStaff = [] } = useCmsAdministration();

  const staff = cmsStaff.map((s, i) => ({
    id: s.id,
    name: pickLang(s.name, language),
    role: pickLang(s.position, language),
    roleKey: ["principal", "vicePrincipal", "vicePrincipalSpirit", "psychologist"][i % 4] as keyof typeof roleColors,
    email: s.email,
    phone: s.phone,
    degree: pickLang(s.degree, language),
    university: "",
    schedule: pickLang(s.receptionTime, language),
    avatar: s.photo,
    bio: pickLang(s.bio, language),
  }));

  const principal = staff[0];
  const others = staff.slice(1);

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
            <Shield className="h-8 w-8 text-accent" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold font-serif text-accent mb-3"
          >
            {t("nav.administration")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-slate-300 text-lg max-w-2xl mx-auto"
          >
            {t("administration.heroSubtitle")}
          </motion.p>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 space-y-8">

          {/* Featured: Director */}
          {principal && (() => {
            const cfg = roleColors[principal.roleKey] ?? roleColors.principal;
            return (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`rounded-3xl overflow-hidden border border-border shadow-xl ring-2 ${cfg.ring} bg-card`}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Left colored panel */}
                  <div className={`bg-gradient-to-br ${cfg.gradient} md:w-72 flex flex-col items-center justify-center py-12 px-8 relative overflow-hidden shrink-0`}>
                    <div className="absolute inset-0 opacity-10">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute rounded-full border border-white/30"
                          style={{
                            width: `${180 + i * 80}px`,
                            height: `${180 + i * 80}px`,
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                          }}
                        />
                      ))}
                    </div>
                    {/* Avatar */}
                    <div className="relative w-28 h-28 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center mb-4 shadow-xl overflow-hidden">
                      {principal.avatar ? (
                        <img src={principal.avatar} alt={principal.name} className="w-full h-full object-cover" />
                      ) : (
                        <svg viewBox="0 0 80 80" width="64" height="64" fill="white" className="opacity-90">
                          <circle cx="40" cy="28" r="16" />
                          <path d="M8 76c0-17.673 14.327-32 32-32s32 14.327 32 32H8z" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${cfg.badge} backdrop-blur`}>
                      {principal.role}
                    </span>
                  </div>

                  {/* Right info panel */}
                  <div className="flex-1 p-8 flex flex-col justify-between">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold font-serif mb-1">{principal.name}</h2>
                      <p className={`font-semibold mb-6 ${cfg.badgeText}`}>
                        {principal.role}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <a
                          href={`tel:${principal.phone.replace(/\s/g, "")}`}
                          className="flex items-center gap-3 bg-muted hover:bg-muted/70 transition-colors rounded-xl px-4 py-3 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Phone className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="text-[10px] text-muted-foreground font-medium">{t("administration.labels.phone")}</div>
                            <div className="text-sm font-semibold group-hover:text-primary transition-colors">{principal.phone}</div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>

                        <a
                          href={`mailto:${principal.email}`}
                          className="flex items-center gap-3 bg-muted hover:bg-muted/70 transition-colors rounded-xl px-4 py-3 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                            <Mail className="h-4 w-4 text-accent" />
                          </div>
                          <div>
                            <div className="text-[10px] text-muted-foreground font-medium">{t("administration.labels.email")}</div>
                            <div className="text-sm font-semibold group-hover:text-accent transition-colors truncate max-w-[160px]">{principal.email}</div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>

                        <div className="flex items-center gap-3 bg-muted rounded-xl px-4 py-3">
                          <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                            <GraduationCap className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <div className="text-[10px] text-muted-foreground font-medium">{t("administration.labels.education")}</div>
                            <div className="text-sm font-semibold">{principal.degree}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-muted rounded-xl px-4 py-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="text-[10px] text-muted-foreground font-medium">{t("administration.labels.receptionHours")}</div>
                            <div className="text-sm font-semibold">{principal.schedule}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* Others grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {others.map((person, i) => {
              const cfg = roleColors[person.roleKey] ?? roleColors.vicePrincipal;
              return (
                <motion.div
                  key={person.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className={`bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all group ring-1 ${cfg.ring}`}
                >
                  {/* Colored top banner */}
                  <div className={`bg-gradient-to-br ${cfg.gradient} py-8 flex flex-col items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-10">
                      {[...Array(2)].map((_, j) => (
                        <div
                          key={j}
                          className="absolute rounded-full border border-white/40"
                          style={{
                            width: `${120 + j * 60}px`,
                            height: `${120 + j * 60}px`,
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                          }}
                        />
                      ))}
                    </div>
                    <div className="relative w-20 h-20 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center mb-3 shadow-lg group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                      {person.avatar ? (
                        <img src={person.avatar} alt={person.name} className="w-full h-full object-cover" />
                      ) : (
                        <svg viewBox="0 0 80 80" width="48" height="48" fill="white" className="opacity-90">
                          <circle cx="40" cy="28" r="16" />
                          <path d="M8 76c0-17.673 14.327-32 32-32s32 14.327 32 32H8z" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${cfg.badge} backdrop-blur`}>
                      {person.role}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-lg font-bold mb-0.5">{person.name}</h3>
                      <p className={`text-sm font-medium ${cfg.badgeText}`}>
                        {person.role}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border">
                      <a
                        href={`tel:${person.phone.replace(/\s/g, "")}`}
                        className="flex items-center gap-2.5 bg-muted hover:bg-muted/70 transition-colors rounded-xl px-3 py-2 group/phone"
                      >
                        <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium group-hover/phone:text-primary transition-colors">{person.phone}</span>
                      </a>

                      <a
                        href={`mailto:${person.email}`}
                        className="flex items-center gap-2.5 bg-muted hover:bg-muted/70 transition-colors rounded-xl px-3 py-2 group/mail"
                      >
                        <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium group-hover/mail:text-accent transition-colors truncate">{person.email}</span>
                      </a>

                      <div className="flex items-center gap-2.5 bg-muted/50 rounded-xl px-3 py-2">
                        <GraduationCap className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground">{person.degree}</span>
                      </div>

                      <div className="flex items-center gap-2.5 bg-muted/50 rounded-xl px-3 py-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground">{person.schedule}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-gradient-to-br from-[#0f1b4d] to-[#1a2a7a] p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            <div>
              <h3 className="text-xl font-bold font-serif text-accent mb-1">{t("administration.cta.title")}</h3>
              <p className="text-slate-300 text-sm max-w-lg">
                {t("administration.cta.desc")}
              </p>
            </div>
            <Link
              to="/contact"
              className="shrink-0 bg-accent text-accent-foreground font-semibold px-6 py-3 rounded-xl hover:bg-accent/90 transition-colors flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              {t("administration.cta.button")}
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

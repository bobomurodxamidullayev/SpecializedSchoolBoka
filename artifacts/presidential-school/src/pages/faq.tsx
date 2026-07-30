import { useLanguage } from "@/hooks/useLanguage";
import { motion, AnimatePresence } from "framer-motion";
import { useCmsFaq } from "@/hooks/useCms";
import { pickLang } from "@/lib/cms";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search, HelpCircle, GraduationCap, BookOpen, Building2, MessageCircle } from "lucide-react";
import { useState, useMemo } from "react";

const CATEGORY_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; badge: string; dot: string }> = {
  Admissions: { icon: GraduationCap, badge: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30", dot: "bg-blue-500" },
  Academic:   { icon: BookOpen,      badge: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30", dot: "bg-violet-500" },
  Facilities: { icon: Building2,     badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30", dot: "bg-emerald-500" },
};
const DEFAULT_CAT = { icon: MessageCircle, badge: "bg-primary/15 text-primary border-primary/30", dot: "bg-primary" };

export default function FAQ() {
  const { t, language } = useLanguage();
  const { data: cmsFaqs = [] } = useCmsFaq();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const faqs = useMemo(
    () =>
      cmsFaqs.map((f) => ({
        id: f.id,
        category: f.category,
        question: pickLang(f.question, language),
        answer: pickLang(f.answer, language),
      })),
    [cmsFaqs, language],
  );

  const uniqueCategories = useMemo(() => Array.from(new Set(faqs.map((f) => f.category))), [faqs]);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const catCounts: Record<string, number> = { All: faqs.length };
  uniqueCategories.forEach((c) => { catCounts[c] = faqs.filter((f) => f.category === c).length; });

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
            <HelpCircle className="h-8 w-8 text-accent" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold font-serif text-accent mb-3">
            {t("nav.faq")}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="text-slate-300 text-lg max-w-2xl mx-auto mb-10">
            {t("faq.heroSubtitle")}
          </motion.p>

          {/* Search bar in hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
            <Input
              placeholder={t("faq.searchPlaceholder")}
              className="pl-12 h-14 text-base bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/40 rounded-2xl backdrop-blur"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </motion.div>
        </div>
      </section>

      {/* Category filter */}
      <div className="sticky top-[60px] z-30 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 justify-center">
            {["All", ...uniqueCategories].map((cat) => {
              const active = activeCategory === cat;
              const cfg = CATEGORY_CONFIG[cat];
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
                    {catCounts[cat] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* FAQ list */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div key={activeCategory + search} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Accordion type="single" collapsible className="w-full space-y-3">
                {filteredFaqs.map((faq, i) => {
                  const cfg = CATEGORY_CONFIG[faq.category] ?? DEFAULT_CAT;
                  const Icon = cfg.icon;
                  return (
                    <motion.div key={faq.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}>
                      <AccordionItem value={`item-${faq.id}`}
                        className="bg-card border border-border rounded-2xl px-6 hover:border-primary/30 hover:shadow-md transition-all data-[state=open]:border-primary/40 data-[state=open]:shadow-md">
                        <AccordionTrigger className="hover:no-underline py-5 gap-4">
                          <div className="flex items-start gap-3 text-left">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${cfg.badge} border`}>
                              <Icon className="h-3 w-3" />
                            </div>
                            <div>
                              <span className="font-bold text-base leading-snug hover:text-primary transition-colors">{faq.question}</span>
                              <span className={`ml-2 hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.badge}`}>
                                {faq.category}
                              </span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed pb-5 pl-9 text-sm md:text-base">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    </motion.div>
                  );
                })}
              </Accordion>

              {filteredFaqs.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                  <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">{t("faq.noResults")}</p>
                  {search && (
                    <button onClick={() => setSearch("")}
                      className="mt-3 text-sm text-primary font-semibold hover:underline">
                      Clear search
                    </button>
                  )}
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

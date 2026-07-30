import { Link, useLocation } from "wouter";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Language } from "@/data/translations";

export function Header() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      setScrollProgress(windowHeight > 0 ? totalScroll / windowHeight : 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/administration", label: t("nav.administration") },
    { href: "/teachers", label: t("nav.teachers") },
    { href: "/certificates", label: t("nav.certificates") },
    { href: "/news", label: t("nav.news") },
    { href: "/gallery", label: t("nav.gallery") },
    { href: "/timetable", label: t("nav.timetable") },
    { href: "/admissions", label: t("nav.admissions") },
    { href: "/contact", label: t("nav.contact") },
  ];

  return (
    <>
      {/* Scroll-progress bar */}
      <motion.div
        className="fixed top-0 left-0 h-0.5 bg-primary z-50 origin-left"
        style={{ scaleX: scrollProgress }}
      />

      <header
        className={`fixed top-0 w-full z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-md shadow-sm py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between gap-3">

            {/* ── Logo + Name ── */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0 min-w-0">
              <img
                src="/logo.png"
                alt="School Logo"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-contain shadow-lg shrink-0 group-hover:scale-105 transition-transform"
              />

              {/* Mobile: short two-liner */}
              <div className="flex flex-col leading-tight sm:hidden">
                <span className="font-bold text-sm whitespace-nowrap text-foreground group-hover:text-primary transition-colors">
                  {t("branding.short")}
                </span>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap font-medium">
                  {t("branding.sub")}
                </span>
              </div>

              {/* sm+: compact full name, capped width so it never truncates past 2 lines */}
              <span className="hidden sm:block font-bold text-sm md:text-base leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors max-w-[180px] md:max-w-[240px] lg:max-w-none">
                {t("branding.name")}
              </span>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden xl:flex items-center gap-0.5 flex-1 justify-center">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all relative whitespace-nowrap ${
                    location === link.href
                      ? "text-primary"
                      : "text-foreground/80 hover:text-foreground hover:bg-accent/10"
                  }`}
                >
                  {link.label}
                  {location === link.href && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* ── Controls ── */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Language switcher */}
              <div className="hidden sm:flex items-center bg-accent/10 rounded-full p-1 border border-border/50">
                {(["uz", "en", "ru"] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase transition-colors ${
                      language === lang
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full w-8 h-8 sm:w-9 sm:h-9 border border-border/50 bg-background/50 backdrop-blur"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="xl:hidden w-8 h-8 sm:w-9 sm:h-9"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[80%] max-w-sm bg-card z-50 shadow-2xl border-l border-border flex flex-col p-6 lg:hidden"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <img src="/logo.png" alt="School Logo" className="w-8 h-8 rounded object-contain" />
                  <div className="flex flex-col leading-tight">
                    <span className="font-bold text-sm text-foreground">{t("branding.short")}</span>
                    <span className="text-[10px] text-muted-foreground">{t("branding.sub")}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Language switcher in drawer */}
              <div className="flex items-center gap-2 mb-6 bg-accent/10 p-1 rounded-lg">
                {(["uz", "en", "ru"] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`flex-1 py-2 rounded-md text-sm font-semibold uppercase transition-colors ${
                      language === lang
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              {/* Nav links in drawer */}
              <nav className="flex flex-col gap-1 overflow-y-auto flex-1 pr-1 -mr-1">
                {[
                  ...navLinks,
                  { href: "/students", label: t("nav.students") },
                  { href: "/directions", label: t("nav.directions") },
                  { href: "/achievements", label: t("nav.achievements") },
                  { href: "/events", label: t("nav.events") },
                  { href: "/faq", label: t("nav.faq") },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-base font-medium transition-colors shrink-0 ${
                      location === link.href
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent/10"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

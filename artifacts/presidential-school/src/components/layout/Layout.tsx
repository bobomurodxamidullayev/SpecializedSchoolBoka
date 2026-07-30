import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background text-foreground font-sans selection:bg-primary/30 selection:text-foreground">
      <Header />
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.main
          key={location}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="flex-1 w-full pt-[72px]"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
}

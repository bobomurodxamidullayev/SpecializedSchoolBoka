import { useLanguage } from "@/hooks/useLanguage";
import { motion, AnimatePresence } from "framer-motion";
import { useCmsGallery } from "@/hooks/useCms";
import { pickLang } from "@/lib/cms";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ZoomIn, Images, ChevronLeft, ChevronRight, X, PlayCircle } from "lucide-react";
import { getYouTubeEmbedUrl } from "@/lib/cms";

const GRADIENTS: Record<string, string> = {
  Lessons:      "from-blue-900 via-blue-700 to-indigo-800",
  Events:       "from-amber-700 via-orange-600 to-yellow-700",
  Competitions: "from-emerald-800 via-teal-700 to-cyan-700",
  "School Life":"from-violet-800 via-purple-700 to-fuchsia-700",
};
const ICONS: Record<string, string> = {
  Lessons:      "📚",
  Events:       "🎉",
  Competitions: "🏆",
  "School Life":"🏫",
};
const CAT_BADGE: Record<string, string> = {
  Lessons:      "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Events:       "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Competitions: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "School Life":"bg-violet-500/15 text-violet-400 border-violet-500/30",
};

type GalleryItem = { id: string; category: string; label: string; src?: string; mediaType?: "image" | "video"; videoUrl?: string; };

export default function Gallery() {
  const { t, language } = useLanguage();
  const { data: cmsGallery = [] } = useCmsGallery();
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const galleryImages = useMemo(() => {
    const flat: GalleryItem[] = [];
    for (const item of cmsGallery) {
      const label = pickLang(item.title, language);
      if (item.mediaType === "video") {
        flat.push({ id: item.id, category: item.category, label, src: item.images[0], mediaType: "video", videoUrl: item.videoUrl });
      } else if (item.images?.length) {
        item.images.forEach((src, i) => flat.push({ id: `${item.id}-${i}`, category: item.category, label, src, mediaType: "image" }));
      } else {
        flat.push({ id: item.id, category: item.category, label, mediaType: "image" });
      }
    }
    return flat;
  }, [cmsGallery, language]);

  const categoryKeys = ["All", "Events", "Lessons", "Competitions", "School Life"];
  const filtered = activeCategory === "All" ? galleryImages : galleryImages.filter((img) => img.category === activeCategory);
  const catCounts: Record<string, number> = { All: galleryImages.length };
  categoryKeys.slice(1).forEach((c) => { catCounts[c] = galleryImages.filter((img) => img.category === c).length; });

  const selectedItem = selectedIndex !== null ? filtered[selectedIndex] : null;

  const prev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + filtered.length) % filtered.length);
  };
  const next = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % filtered.length);
  };

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
            <Images className="h-8 w-8 text-accent" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold font-serif text-accent mb-3">
            {t("nav.gallery")}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="text-slate-300 text-lg max-w-2xl mx-auto mb-10">
            {t("gallery.heroSubtitle")}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="inline-grid grid-cols-2 divide-x divide-white/20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
            {[
              { label: t("gallery.totalPhotos") || "Total Photos", value: galleryImages.length },
              { label: t("gallery.totalCategories") || "Categories", value: 4 },
            ].map((s, i) => (
              <div key={i} className="px-10 py-4 text-center">
                <div className="text-3xl font-bold text-accent font-serif">{s.value}</div>
                <div className="text-xs text-slate-300 mt-0.5 font-medium">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Filter tabs */}
      <div className="sticky top-[60px] z-30 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 justify-center">
            {categoryKeys.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border shrink-0 ${
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:border-border hover:text-foreground"
                  }`}>
                  {cat !== "All" && <span className="text-xs">{ICONS[cat]}</span>}
                  {t(`gallery.categories.${cat}`)}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${active ? "bg-white/20" : "bg-muted"}`}>
                    {catCounts[cat]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gallery grid */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((img, i) => {
                const gradient = GRADIENTS[img.category] ?? "from-slate-700 to-slate-900";
                const icon = ICONS[img.category] ?? "🖼️";
                const badge = CAT_BADGE[img.category] ?? "bg-white/10 text-white border-white/20";
                return (
                  <motion.div
                    key={img.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: i * 0.04 }}
                    onClick={() => setSelectedIndex(i)}
                    className="cursor-pointer rounded-2xl overflow-hidden aspect-[4/3] relative group shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                    {img.src ? (
                      <img src={img.src} alt={img.label} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <>
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
                        <div className="absolute inset-0 opacity-[0.08]"
                          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                          <span className="text-5xl opacity-60 group-hover:opacity-90 group-hover:scale-110 transition-all duration-300 select-none filter drop-shadow-lg">
                            {icon}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />

                    {img.mediaType === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors z-10 pointer-events-none">
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <PlayCircle className="h-8 w-8 text-white fill-white/20" />
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                      <ZoomIn className="h-7 w-7 text-white drop-shadow z-20" />
                      <span className="text-xs font-bold text-white tracking-wide z-20">{t("gallery.view")}</span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-white font-bold text-sm drop-shadow leading-snug">{img.label}</p>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm ${badge}`}>
                        {t(`gallery.categories.${img.category}`)}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3">
                      <span className="text-[10px] text-white/70 font-medium bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        #{String(img.id).padStart(2, "0")}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        </div>
      </section>

      {/* Lightbox */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-none bg-transparent shadow-none" aria-describedby="gallery-desc">
          <DialogTitle className="sr-only">Gallery</DialogTitle>
          <DialogDescription id="gallery-desc" className="sr-only">Photo lightbox view</DialogDescription>
          {selectedItem && (
            <div className="relative rounded-2xl overflow-hidden">
              <div className={`w-full aspect-square sm:aspect-video relative ${!selectedItem.src ? `bg-gradient-to-br ${GRADIENTS[selectedItem.category] ?? "from-slate-700 to-slate-900"}` : "bg-black"}`}>
                {selectedItem.mediaType === "video" && selectedItem.videoUrl && getYouTubeEmbedUrl(selectedItem.videoUrl) ? (
                  <iframe src={getYouTubeEmbedUrl(selectedItem.videoUrl)!.embedUrl} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
                ) : selectedItem.src ? (
                  <img src={selectedItem.src} alt={selectedItem.label} className="absolute inset-0 w-full h-full object-contain" />
                ) : (
                  <>
                    <div className="absolute inset-0 opacity-[0.08]"
                      style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-8xl select-none drop-shadow-2xl">{ICONS[selectedItem.category] ?? "🖼️"}</span>
                    </div>
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className={`inline-flex text-xs font-bold px-3 py-1 rounded-full border mb-2 ${CAT_BADGE[selectedItem.category] ?? "bg-white/10 text-white border-white/20"}`}>
                    {t(`gallery.categories.${selectedItem.category}`)}
                  </span>
                  <h3 className="text-white text-xl font-bold">{selectedItem.label}</h3>
                  <p className="text-white/60 text-sm mt-1">{selectedIndex !== null ? selectedIndex + 1 : 0} / {filtered.length}</p>
                </div>
              </div>

              {/* Navigation */}
              <button onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
              <button onClick={() => setSelectedIndex(null)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

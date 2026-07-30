import { Link } from "wouter";
import { useLanguage } from "@/hooks/useLanguage";
import { Facebook, Instagram, Send, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCmsSettings, useCmsContact } from "@/hooks/useCms";
import { pickLang } from "@/lib/cms";

export function Footer() {
  const { t, language } = useLanguage();
  const { data: settings } = useCmsSettings();
  const { data: contact } = useCmsContact();

  const schoolName = settings ? pickLang(settings.schoolName, language) : t("branding.name");
  const tagline = settings ? pickLang(settings.description, language) : t("footer.tagline");
  const address = contact ? pickLang(contact.address, language) : t("contact.mapSubtext");
  const phone = contact?.phone ?? settings?.phone ?? "+998 71 123 45 67";
  const email = contact?.email ?? settings?.email ?? "info@bekobod-school.uz";
  const copyright = settings?.copyright ?? `© ${new Date().getFullYear()} Bekobod tumani ixtisoslashtirilgan maktabi.`;
  const telegram = contact?.telegram ?? settings?.social?.telegram;
  const instagram = contact?.instagram ?? settings?.social?.instagram;

  return (
    <footer className="bg-sidebar border-t border-border mt-auto">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="School Logo"
                className="w-8 h-8 rounded object-contain shrink-0"
              />
              <span className="font-bold text-sm leading-tight tracking-tight text-foreground line-clamp-2 max-w-[200px]">{schoolName}</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">{tagline}</p>
            <div className="flex gap-4 pt-2">
              {telegram && (
                <a href={telegram} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-primary/10 hover:text-primary">
                    <Send className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-primary/10 hover:text-primary">
                    <Instagram className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {settings?.social?.youtube && (
                <a href={settings.social.youtube} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-primary/10 hover:text-primary">
                    <Facebook className="h-4 w-4" />
                  </Button>
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("nav.about")}</Link></li>
              <li><Link href="/admissions" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("nav.admissions")}</Link></li>
              <li><Link href="/teachers" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("nav.teachers")}</Link></li>
              <li><Link href="/news" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("nav.news")}</Link></li>
              <li><Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("nav.faq")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">{t("footer.academics")}</h3>
            <ul className="space-y-2">
              <li><Link href="/directions" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("nav.directions")}</Link></li>
              <li><Link href="/achievements" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("nav.achievements")}</Link></li>
              <li><Link href="/students" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("nav.students")}</Link></li>
              <li><Link href="/events" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("nav.events")}</Link></li>
              <li><Link href="/gallery" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("nav.gallery")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">{t("footer.contact")}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{address}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>{phone}{contact?.phone2 ? ` · ${contact.phone2}` : ""}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>{email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            {copyright} {t("footer.allRights")}
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">{t("footer.privacy")}</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">{t("footer.terms")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

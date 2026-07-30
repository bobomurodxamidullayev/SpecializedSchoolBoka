import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Settings, UserCog, BookOpen, Award, Newspaper,
  Image, Trophy, GraduationCap, Phone, FolderOpen, Menu, X, LogOut, ChevronRight,
  CalendarDays, HelpCircle, Medal, School, Info, CalendarClock
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/administration", label: "Rahbariyat", icon: UserCog },
  { href: "/admin/teachers", label: "O'qituvchilar", icon: BookOpen },
  { href: "/admin/certificates", label: "Sertifikatlar", icon: Award },
  { href: "/admin/news", label: "Yangiliklar", icon: Newspaper },
  { href: "/admin/gallery", label: "Galereya", icon: Image },
  { href: "/admin/students", label: "Talabalar", icon: Trophy },
  { href: "/admin/admissions", label: "Qabul", icon: GraduationCap },
  { href: "/admin/events", label: "Tadbirlar", icon: CalendarDays },
  { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
  { href: "/admin/timetable", label: "Dars jadvali", icon: CalendarClock },
  { href: "/admin/achievements", label: "Yutuqlar", icon: Medal },
  { href: "/admin/directions", label: "Yo'nalishlar", icon: School },
  { href: "/admin/about", label: "Maktab haqida", icon: Info },
  { href: "/admin/contact", label: "Bog'lanish", icon: Phone },
  { href: "/admin/settings", label: "Sozlamalar", icon: Settings },
  { href: "/admin/media", label: "Media", icon: FolderOpen },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAdmin();

  const isActive = (href: string) =>
    href === "/admin" ? location === "/admin" : location.startsWith(href);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center font-bold text-[#0f1b4d] text-sm">BA</div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">Bekobod Admin</p>
            <p className="text-xs text-slate-400">Panel</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <button
              onClick={() => setOpen(false)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                isActive(href)
                  ? "bg-amber-400/15 text-amber-400 font-medium"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              {isActive(href) && <ChevronRight className="w-3 h-3" />}
            </button>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/40 flex items-center justify-center text-xs font-bold text-white">
            {user?.name?.charAt(0) || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.username}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-400/10"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" /> Chiqish
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080e1e] text-white flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-[#0c1428] border-r border-white/10 fixed h-full z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative w-56 bg-[#0c1428] h-full flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-14 bg-[#0c1428] border-b border-white/10 flex items-center px-4 gap-3 sticky top-0 z-20">
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-slate-300"
            onClick={() => setOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <a href="/" target="_blank" className="text-xs text-slate-400 hover:text-amber-400 transition-colors">
            → Saytni ko'rish
          </a>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

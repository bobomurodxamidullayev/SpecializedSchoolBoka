import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { Link } from "wouter";
import { Users, BookOpen, Newspaper, Image, Trophy, Award, GraduationCap, UserCog, ExternalLink } from "lucide-react";

interface DashStats {
  administration: number; teachers: number; news: number; gallery: number;
  students: number; certificates: number; admissions: number;
}
interface NewsItem { id: string; title: { uz: string; en: string; ru: string } | string; status: string; publishDate: string; category: string }

const STAT_CARDS = [
  { key: "administration" as const, label: "Rahbariyat", icon: UserCog, href: "/admin/administration", color: "bg-blue-500/10 text-blue-400" },
  { key: "teachers" as const, label: "O'qituvchilar", icon: BookOpen, href: "/admin/teachers", color: "bg-purple-500/10 text-purple-400" },
  { key: "news" as const, label: "Yangiliklar", icon: Newspaper, href: "/admin/news", color: "bg-green-500/10 text-green-400" },
  { key: "gallery" as const, label: "Galereya rasmlari", icon: Image, href: "/admin/gallery", color: "bg-pink-500/10 text-pink-400" },
  { key: "students" as const, label: "Chempionlar", icon: Trophy, href: "/admin/students", color: "bg-amber-500/10 text-amber-400" },
  { key: "certificates" as const, label: "Sertifikatlar", icon: Award, href: "/admin/certificates", color: "bg-cyan-500/10 text-cyan-400" },
  { key: "admissions" as const, label: "Qabul bosqichlari", icon: GraduationCap, href: "/admin/admissions", color: "bg-orange-500/10 text-orange-400" },
];

function getLang(val: string | { uz: string }): string {
  if (typeof val === "string") return val;
  return val.uz || "";
}

export default function Dashboard() {
  const { api } = useAdmin();
  const [stats, setStats] = useState<DashStats | null>(null);
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ ok: boolean; data: { stats: DashStats; recentNews: NewsItem[] } }>("/dashboard")
      .then((d) => { setStats(d.data.stats); setRecentNews(d.data.recentNews); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [api]);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Sayt statistikasi va oxirgi yangiliklar</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STAT_CARDS.map(({ key, label, icon: Icon, href, color }) => (
              <Link key={key} href={href}>
                <div className="bg-[#0c1428] border border-white/10 rounded-xl p-4 hover:border-amber-400/30 transition-all cursor-pointer group">
                  <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">{stats?.[key] ?? 0}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{label}</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="bg-[#0c1428] border border-white/10 rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h2 className="font-semibold text-white">Oxirgi yangiliklar</h2>
            <Link href="/admin/news">
              <span className="text-xs text-amber-400 hover:underline flex items-center gap-1">
                Barchasi <ExternalLink className="w-3 h-3" />
              </span>
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {recentNews.length === 0 && (
              <p className="px-5 py-8 text-slate-500 text-sm text-center">Yangiliklar yo'q</p>
            )}
            {recentNews.map((n) => (
              <div key={n.id} className="px-5 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{getLang(n.title as string | { uz: string })}</p>
                  <p className="text-xs text-slate-500">{n.category} · {n.publishDate}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${n.status === "published" ? "bg-green-500/20 text-green-400" : "bg-slate-500/20 text-slate-400"}`}>
                  {n.status === "published" ? "Nashr" : "Qoralama"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

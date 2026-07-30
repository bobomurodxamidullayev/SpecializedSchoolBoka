import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { LangInput } from "@/components/admin/LangInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, Minus } from "lucide-react";

type LangObj = { uz: string; en: string; ru: string };
interface HeroStat { value: string; label: LangObj }
interface Settings {
  schoolName: LangObj; slogan: LangObj; description: LangObj; heroTitle: LangObj;
  heroStats: HeroStat[]; phone: string; phone2: string; email: string; email2: string;
  address: LangObj; workingHours: string; mapUrl: string;
  social: { telegram: string; instagram: string; youtube: string };
  seoTitle: LangObj; seoDescription: LangObj; copyright: string;
}
const DEF: Settings = {
  schoolName: { uz: "", en: "", ru: "" }, slogan: { uz: "", en: "", ru: "" }, description: { uz: "", en: "", ru: "" }, heroTitle: { uz: "", en: "", ru: "" },
  heroStats: [{ value: "", label: { uz: "", en: "", ru: "" } }], phone: "", phone2: "", email: "", email2: "",
  address: { uz: "", en: "", ru: "" }, workingHours: "", mapUrl: "",
  social: { telegram: "", instagram: "", youtube: "" },
  seoTitle: { uz: "", en: "", ru: "" }, seoDescription: { uz: "", en: "", ru: "" }, copyright: "",
};

export default function AdminSettings() {
  const { api } = useAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Settings>(DEF);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changePwOpen, setChangePwOpen] = useState(false);
  const [pw, setPw] = useState({ current: "", newPw: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    api<{ ok: boolean; data: Settings }>("/settings")
      .then((d) => setForm({ ...DEF, ...d.data, heroStats: d.data.heroStats || DEF.heroStats, social: { ...DEF.social, ...d.data.social } }))
      .catch(() => {}).finally(() => setLoading(false));
  }, [api]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await api("/settings", { method: "PUT", body: JSON.stringify(form) }); toast({ title: "Sozlamalar saqlandi" }); queryClient.invalidateQueries({ queryKey: ["cms", "settings"] }); }
    catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const addStat = () => setForm((f) => ({ ...f, heroStats: [...f.heroStats, { value: "", label: { uz: "", en: "", ru: "" } }] }));
  const removeStat = (i: number) => setForm((f) => ({ ...f, heroStats: f.heroStats.filter((_, idx) => idx !== i) }));
  const updateStat = (i: number, field: "value" | "label", val: string | LangObj) =>
    setForm((f) => ({ ...f, heroStats: f.heroStats.map((s, idx) => idx === i ? { ...s, [field]: val } : s) }));

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.newPw !== pw.confirm) { toast({ title: "Parollar mos kelmadi", variant: "destructive" }); return; }
    setPwSaving(true);
    try {
      await api("/password", { method: "PUT", body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.newPw }) });
      toast({ title: "Parol o'zgartirildi" }); setChangePwOpen(false); setPw({ current: "", newPw: "", confirm: "" });
    } catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
    finally { setPwSaving(false); }
  };

  if (loading) return <AdminLayout><div className="py-20 text-center text-slate-500">Yuklanmoqda...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6"><h1 className="text-xl font-bold text-white">Global Sozlamalar</h1><p className="text-slate-400 text-sm mt-1">Saytning barcha asosiy ma'lumotlari</p></div>
        <form onSubmit={save} className="space-y-6">
          <Section title="Maktab haqida">
            <LangInput label="Maktab nomi" value={form.schoolName} onChange={(v) => setForm({ ...form, schoolName: v })} />
            <LangInput label="Slogan" value={form.slogan} onChange={(v) => setForm({ ...form, slogan: v })} />
            <LangInput label="Tavsif" value={form.description} onChange={(v) => setForm({ ...form, description: v })} multiline />
            <LangInput label="Hero sarlavha" value={form.heroTitle} onChange={(v) => setForm({ ...form, heroTitle: v })} />
          </Section>

          <Section title="Statistika (Hero)">
            {form.heroStats.map((stat, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Statistika #{i + 1}</span>
                  {form.heroStats.length > 1 && <button type="button" onClick={() => removeStat(i)} className="text-red-400 hover:text-red-300"><Minus className="w-4 h-4" /></button>}
                </div>
                <F label="Qiymat (masalan: 1200+)"><Input value={stat.value} onChange={(e) => updateStat(i, "value", e.target.value)} className="bg-white/5 border-white/10 text-white" /></F>
                <LangInput label="Yorliq" value={stat.label} onChange={(v) => updateStat(i, "label", v)} />
              </div>
            ))}
            <Button type="button" variant="ghost" onClick={addStat} className="text-amber-400 hover:text-amber-300 text-sm"><Plus className="w-4 h-4 mr-1" /> Statistika qo'shish</Button>
          </Section>

          <Section title="Aloqa">
            <div className="grid grid-cols-2 gap-3">
              <F label="Asosiy telefon"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-white/5 border-white/10 text-white" /></F>
              <F label="Qo'shimcha telefon"><Input value={form.phone2} onChange={(e) => setForm({ ...form, phone2: e.target.value })} className="bg-white/5 border-white/10 text-white" /></F>
              <F label="Asosiy email"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-white/5 border-white/10 text-white" /></F>
              <F label="Director email"><Input value={form.email2} onChange={(e) => setForm({ ...form, email2: e.target.value })} className="bg-white/5 border-white/10 text-white" /></F>
            </div>
            <LangInput label="Manzil" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
            <F label="Ish vaqti"><Input value={form.workingHours} onChange={(e) => setForm({ ...form, workingHours: e.target.value })} className="bg-white/5 border-white/10 text-white" /></F>
            <F label="Google Maps embed URL"><Input value={form.mapUrl} onChange={(e) => setForm({ ...form, mapUrl: e.target.value })} className="bg-white/5 border-white/10 text-white" placeholder="https://www.google.com/maps/embed?pb=..." /></F>
          </Section>

          <Section title="Ijtimoiy tarmoqlar">
            <div className="space-y-3">
              <F label="Telegram"><Input value={form.social.telegram} onChange={(e) => setForm({ ...form, social: { ...form.social, telegram: e.target.value } })} className="bg-white/5 border-white/10 text-white" /></F>
              <F label="Instagram"><Input value={form.social.instagram} onChange={(e) => setForm({ ...form, social: { ...form.social, instagram: e.target.value } })} className="bg-white/5 border-white/10 text-white" /></F>
              <F label="YouTube"><Input value={form.social.youtube} onChange={(e) => setForm({ ...form, social: { ...form.social, youtube: e.target.value } })} className="bg-white/5 border-white/10 text-white" /></F>
            </div>
          </Section>

          <Section title="SEO">
            <LangInput label="SEO Sarlavha" value={form.seoTitle} onChange={(v) => setForm({ ...form, seoTitle: v })} />
            <LangInput label="SEO Tavsif" value={form.seoDescription} onChange={(v) => setForm({ ...form, seoDescription: v })} multiline />
            <F label="Copyright"><Input value={form.copyright} onChange={(e) => setForm({ ...form, copyright: e.target.value })} className="bg-white/5 border-white/10 text-white" /></F>
          </Section>

          <Button type="submit" disabled={saving} className="bg-amber-400 hover:bg-amber-500 text-[#0f1b4d] font-semibold w-full">
            <Save className="w-4 h-4 mr-2" />{saving ? "Saqlanmoqda..." : "Barcha sozlamalarni saqlash"}
          </Button>
        </form>

        <div className="mt-6 bg-[#0c1428] border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-semibold text-white">Admin paroli</p><p className="text-xs text-slate-400 mt-0.5">Login parolini o'zgartiring</p></div>
            <Button onClick={() => setChangePwOpen(!changePwOpen)} variant="ghost" className="text-amber-400 hover:text-amber-300 text-sm">O'zgartirish</Button>
          </div>
          {changePwOpen && (
            <form onSubmit={savePassword} className="mt-4 space-y-3">
              <F label="Joriy parol"><Input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required className="bg-white/5 border-white/10 text-white" /></F>
              <F label="Yangi parol"><Input type="password" value={pw.newPw} onChange={(e) => setPw({ ...pw, newPw: e.target.value })} required className="bg-white/5 border-white/10 text-white" /></F>
              <F label="Yangi parolni tasdiqlang"><Input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required className="bg-white/5 border-white/10 text-white" /></F>
              <Button type="submit" disabled={pwSaving} size="sm" className="bg-amber-400 hover:bg-amber-500 text-[#0f1b4d] font-semibold">{pwSaving ? "Saqlanmoqda..." : "Parolni o'zgartirish"}</Button>
            </form>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="bg-[#0c1428] border border-white/10 rounded-xl p-5 space-y-4"><h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wide">{title}</h2>{children}</div>;
}
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><label className="text-sm text-slate-300">{label}</label>{children}</div>;
}

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { LangInput } from "@/components/admin/LangInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

type LangObj = { uz: string; en: string; ru: string };
interface ContactData {
  phone: string; phone2: string; email: string; email2: string;
  address: LangObj; workingHours: LangObj; mapUrl: string; telegram: string; instagram: string;
}
const EMPTY: ContactData = { phone: "", phone2: "", email: "", email2: "", address: { uz: "", en: "", ru: "" }, workingHours: { uz: "", en: "", ru: "" }, mapUrl: "", telegram: "", instagram: "" };

export default function AdminContact() {
  const { api } = useAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ContactData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<{ ok: boolean; data: ContactData }>("/contact")
      .then((d) => setForm({ ...EMPTY, ...d.data })).catch(() => {}).finally(() => setLoading(false));
  }, [api]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await api("/contact", { method: "PUT", body: JSON.stringify(form) }); toast({ title: "Saqlandi" }); queryClient.invalidateQueries({ queryKey: ["cms", "contact"] }); }
    catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  if (loading) return <AdminLayout><div className="py-20 text-center text-slate-500">Yuklanmoqda...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6"><h1 className="text-xl font-bold text-white">Bog'lanish ma'lumotlari</h1><p className="text-slate-400 text-sm mt-1">Saytdagi aloqa ma'lumotlarini tahrirlang</p></div>
        <form onSubmit={save} className="space-y-6">
          <Section title="Telefon raqamlar">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Asosiy telefon"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+998 90 000 00 00" className="bg-white/5 border-white/10 text-white" /></Field>
              <Field label="Qo'shimcha telefon"><Input value={form.phone2} onChange={(e) => setForm({ ...form, phone2: e.target.value })} placeholder="+998 93 000 00 00" className="bg-white/5 border-white/10 text-white" /></Field>
            </div>
          </Section>
          <Section title="Email manzillar">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Asosiy email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-white/5 border-white/10 text-white" /></Field>
              <Field label="Director email"><Input type="email" value={form.email2} onChange={(e) => setForm({ ...form, email2: e.target.value })} className="bg-white/5 border-white/10 text-white" /></Field>
            </div>
          </Section>
          <Section title="Manzil va ish vaqti">
            <div className="space-y-4">
              <LangInput label="Manzil" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
              <LangInput label="Ish vaqti" value={form.workingHours} onChange={(v) => setForm({ ...form, workingHours: v })} />
            </div>
          </Section>
          <Section title="Xarita va ijtimoiy tarmoqlar">
            <div className="space-y-3">
              <Field label="Google Maps URL"><Input value={form.mapUrl} onChange={(e) => setForm({ ...form, mapUrl: e.target.value })} placeholder="https://www.google.com/maps/embed?..." className="bg-white/5 border-white/10 text-white" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Telegram"><Input value={form.telegram} onChange={(e) => setForm({ ...form, telegram: e.target.value })} placeholder="https://t.me/..." className="bg-white/5 border-white/10 text-white" /></Field>
                <Field label="Instagram"><Input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="https://instagram.com/..." className="bg-white/5 border-white/10 text-white" /></Field>
              </div>
            </div>
          </Section>
          <Button type="submit" disabled={saving} className="bg-amber-400 hover:bg-amber-500 text-[#0f1b4d] font-semibold w-full">
            <Save className="w-4 h-4 mr-2" />{saving ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </form>
      </div>
    </AdminLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0c1428] border border-white/10 rounded-xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><label className="text-sm text-slate-300">{label}</label>{children}</div>;
}

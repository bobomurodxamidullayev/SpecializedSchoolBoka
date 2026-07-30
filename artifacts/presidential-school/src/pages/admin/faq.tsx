import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { LangInput } from "@/components/admin/LangInput";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, HelpCircle } from "lucide-react";

type LangObj = { uz: string; en: string; ru: string };
interface FaqItem { id: string; order: number; category: string; question: LangObj; answer: LangObj }
const CATS = ["Admissions", "Academic", "Facilities", "Financial", "Other"];
const EMPTY: Omit<FaqItem, "id" | "order"> = { category: "Admissions", question: { uz: "", en: "", ru: "" }, answer: { uz: "", en: "", ru: "" } };

export default function AdminFaq() {
  const { api } = useAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [form, setForm] = useState<Omit<FaqItem, "id" | "order">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () => { api<{ ok: boolean; data: FaqItem[] }>("/faq").then((d) => setItems(d.data)).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (item: FaqItem) => { setEditing(item); setForm({ category: item.category, question: item.question, answer: item.answer }); setModalOpen(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await api(`/faq/${editing.id}`, { method: "PUT", body: JSON.stringify(form) });
      else await api("/faq", { method: "POST", body: JSON.stringify(form) });
      toast({ title: editing ? "Yangilandi" : "Qo'shildi" }); setModalOpen(false); load();
      queryClient.invalidateQueries({ queryKey: ["cms", "faq"] });
    } catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    if (!deleteId) return;
    try { await api(`/faq/${deleteId}`, { method: "DELETE" }); toast({ title: "O'chirildi" }); setDeleteId(null); load(); queryClient.invalidateQueries({ queryKey: ["cms", "faq"] }); }
    catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
  };

  const CAT_COLOR: Record<string, string> = { Admissions: "text-blue-400", Academic: "text-emerald-400", Facilities: "text-violet-400", Financial: "text-amber-400", Other: "text-slate-400" };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Ko'p so'raladigan savollar (FAQ)</h1>
            <p className="text-slate-400 text-sm mt-1">{items.length} ta savol</p>
          </div>
          <Button onClick={openAdd} className="bg-amber-400 hover:bg-amber-300 text-[#080e1e] font-semibold">
            <Plus className="w-4 h-4 mr-2" /> Qo'shish
          </Button>
        </div>

        {loading ? (
          <div className="text-slate-400 text-center py-16">Yuklanmoqda…</div>
        ) : items.length === 0 ? (
          <div className="text-slate-400 text-center py-16">Hali savol yo'q</div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-[#0c1428] border border-white/10 rounded-xl p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center shrink-0 mt-0.5">
                  <HelpCircle className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold ${CAT_COLOR[item.category] || "text-slate-400"}`}>{item.category}</span>
                  </div>
                  <div className="font-semibold text-white">{item.question.en || item.question.uz}</div>
                  <div className="text-slate-400 text-sm mt-1 line-clamp-2">{item.answer.en || item.answer.uz}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="icon" variant="ghost" className="text-slate-400 hover:text-amber-400" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-slate-400 hover:text-red-400" onClick={() => setDeleteId(item.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#0c1428] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Savol tahrirlash" : "Yangi savol"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4 mt-2">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Kategoriya</label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#0c1428] border-white/10">{CATS.map((c) => <SelectItem key={c} value={c} className="text-white">{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <LangInput label="Savol" value={form.question} onChange={(v) => setForm((f) => ({ ...f, question: v }))} required />
            <LangInput label="Javob" value={form.answer} onChange={(v) => setForm((f) => ({ ...f, answer: v }))} multiline required />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-slate-400">Bekor</Button>
              <Button type="submit" disabled={saving} className="bg-amber-400 hover:bg-amber-300 text-[#080e1e] font-semibold">{saving ? "Saqlanmoqda…" : "Saqlash"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onConfirm={remove} onCancel={() => setDeleteId(null)} title="O'chirishni tasdiqlaysizmi?" description="Bu amal qaytarib bo'lmaydi." />
    </AdminLayout>
  );
}

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { LangInput } from "@/components/admin/LangInput";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";

type LangObj = { uz: string; en: string; ru: string };
interface DirectionItem {
  id: string; order: number;
  name: LangObj; desc: LangObj;
  students: number; teachers: number; labs: number;
  subjects: LangObj; careers: LangObj;
}
const EMPTY: Omit<DirectionItem, "id" | "order"> = {
  name: { uz: "", en: "", ru: "" },
  desc: { uz: "", en: "", ru: "" },
  students: 0, teachers: 0, labs: 0,
  subjects: { uz: "", en: "", ru: "" },
  careers: { uz: "", en: "", ru: "" },
};

export default function AdminDirections() {
  const { api } = useAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<DirectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DirectionItem | null>(null);
  const [form, setForm] = useState<Omit<DirectionItem, "id" | "order">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () => { api<{ ok: boolean; data: DirectionItem[] }>("/directions").then((d) => setItems(d.data)).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (item: DirectionItem) => {
    setEditing(item);
    setForm({ name: item.name, desc: item.desc, students: item.students, teachers: item.teachers, labs: item.labs, subjects: item.subjects, careers: item.careers });
    setModalOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await api(`/directions/${editing.id}`, { method: "PUT", body: JSON.stringify(form) });
      else await api("/directions", { method: "POST", body: JSON.stringify(form) });
      toast({ title: editing ? "Yangilandi" : "Qo'shildi" }); setModalOpen(false); load();
      queryClient.invalidateQueries({ queryKey: ["cms", "directions"] });
    } catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    if (!deleteId) return;
    try { await api(`/directions/${deleteId}`, { method: "DELETE" }); toast({ title: "O'chirildi" }); setDeleteId(null); load(); queryClient.invalidateQueries({ queryKey: ["cms", "directions"] }); }
    catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
  };

  const setL = (key: keyof typeof form) => (v: LangObj) => setForm((f) => ({ ...f, [key]: v }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Yo'nalishlar</h1>
            <p className="text-slate-400 text-sm mt-1">{items.length} ta yo'nalish</p>
          </div>
          <Button onClick={openAdd} className="bg-amber-400 hover:bg-amber-300 text-[#080e1e] font-semibold">
            <Plus className="w-4 h-4 mr-2" /> Qo'shish
          </Button>
        </div>

        {loading ? (
          <div className="text-slate-400 text-center py-16">Yuklanmoqda…</div>
        ) : items.length === 0 ? (
          <div className="text-slate-400 text-center py-16">Hali yo'nalish yo'q</div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-[#0c1428] border border-white/10 rounded-xl p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white">{item.name.en || item.name.uz}</div>
                  <div className="text-slate-400 text-sm mt-1 line-clamp-2">{item.desc.en || item.desc.uz}</div>
                  <div className="flex gap-4 mt-2 text-xs text-slate-500">
                    <span>{item.students} ta o'quvchi</span>
                    <span>{item.teachers} ta o'qituvchi</span>
                    <span>{item.labs} ta laboratoriya</span>
                  </div>
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
          <DialogHeader><DialogTitle>{editing ? "Yo'nalish tahrirlash" : "Yangi yo'nalish"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4 mt-2">
            <LangInput label="Yo'nalish nomi" value={form.name} onChange={setL("name")} required />
            <LangInput label="Tavsif" value={form.desc} onChange={setL("desc")} multiline />
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-xs text-slate-400 mb-1 block">O'quvchilar</label><Input type="number" min={0} value={form.students} onChange={(e) => setForm((f) => ({ ...f, students: Number(e.target.value) }))} className="bg-white/5 border-white/10 text-white" /></div>
              <div><label className="text-xs text-slate-400 mb-1 block">O'qituvchilar</label><Input type="number" min={0} value={form.teachers} onChange={(e) => setForm((f) => ({ ...f, teachers: Number(e.target.value) }))} className="bg-white/5 border-white/10 text-white" /></div>
              <div><label className="text-xs text-slate-400 mb-1 block">Laboratoriyalar</label><Input type="number" min={0} value={form.labs} onChange={(e) => setForm((f) => ({ ...f, labs: Number(e.target.value) }))} className="bg-white/5 border-white/10 text-white" /></div>
            </div>
            <LangInput label="Fanlar (har bir fan yangi qatorda)" value={form.subjects} onChange={setL("subjects")} multiline />
            <LangInput label="Kasblar (har bir kasb yangi qatorda)" value={form.careers} onChange={setL("careers")} multiline />
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

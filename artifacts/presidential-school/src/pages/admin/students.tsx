import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { LangInput } from "@/components/admin/LangInput";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

type LangObj = { uz: string; en: string; ru: string };
interface Student { id: string; name: LangObj; achievement: LangObj; olympiad: LangObj; medalType: string; country: string; year: number; bio: LangObj; photo: string }
const EMPTY: Omit<Student, "id"> = { name: { uz: "", en: "", ru: "" }, achievement: { uz: "", en: "", ru: "" }, olympiad: { uz: "", en: "", ru: "" }, medalType: "gold", country: "", year: new Date().getFullYear(), bio: { uz: "", en: "", ru: "" }, photo: "" };

const MEDAL_COLOR: Record<string, string> = { gold: "bg-amber-400/20 text-amber-400", silver: "bg-slate-300/20 text-slate-300", bronze: "bg-orange-700/20 text-orange-500" };
const MEDAL_LABELS: Record<string, string> = { gold: "🥇 Oltin", silver: "🥈 Kumush", bronze: "🥉 Bronza" };

export default function AdminStudents() {
  const { api } = useAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<Omit<Student, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () => { api<{ ok: boolean; data: Student[] }>("/students").then((d) => setItems(d.data)).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  const openAdd = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (s: Student) => { setEditing(s); setForm({ ...s }); setModalOpen(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await api(`/students/${editing.id}`, { method: "PUT", body: JSON.stringify(form) });
      else await api("/students", { method: "POST", body: JSON.stringify(form) });
      toast({ title: editing ? "Yangilandi" : "Qo'shildi" }); setModalOpen(false); load();
      queryClient.invalidateQueries({ queryKey: ["cms", "students"] });
    } catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    if (!deleteId) return;
    try { await api(`/students/${deleteId}`, { method: "DELETE" }); toast({ title: "O'chirildi" }); setDeleteId(null); load(); queryClient.invalidateQueries({ queryKey: ["cms", "students"] }); }
    catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
  };

  const filtered = items.filter((s) => s.name.uz.toLowerCase().includes(search.toLowerCase()) || s.achievement.uz.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div><h1 className="text-xl font-bold text-white">Talabalar / Chempionlar</h1><p className="text-slate-400 text-sm">{items.length} ta</p></div>
          <Button onClick={openAdd} className="bg-amber-400 hover:bg-amber-500 text-[#0f1b4d] font-semibold"><Plus className="w-4 h-4 mr-1" /> Qo'shish</Button>
        </div>
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish..." className="pl-9 bg-white/5 border-white/10 text-white" /></div>

        <div className="bg-[#0c1428] border border-white/10 rounded-xl overflow-hidden">
          {loading ? <div className="p-8 text-center text-slate-500">Yuklanmoqda...</div>
            : filtered.length === 0 ? <div className="p-8 text-center text-slate-500">Ma'lumot yo'q</div>
              : <div className="divide-y divide-white/5">
                {filtered.map((s) => (
                  <div key={s.id} className="flex items-center gap-4 px-5 py-3">
                    {s.photo ? <img src={s.photo} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                      : <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center text-sm font-bold text-white shrink-0">{s.name.uz.charAt(0)}</div>}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{s.name.uz}</p>
                      <p className="text-xs text-slate-400 truncate">{s.olympiad.uz}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${MEDAL_COLOR[s.medalType] || "bg-slate-500/20 text-slate-400"}`}>{MEDAL_LABELS[s.medalType] || s.medalType}</span>
                    <p className="text-xs text-slate-500 hidden md:block shrink-0">{s.year}</p>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(s)} className="w-7 h-7 hover:bg-amber-400/10 hover:text-amber-400 text-slate-400"><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteId(s.id)} className="w-7 h-7 hover:bg-red-500/10 hover:text-red-400 text-slate-400"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </div>}
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#0c1428] border-white/10 text-white max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Tahrirlash" : "Yangi chempion"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4 pt-2">
            <LangInput label="Ism Familiya" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <LangInput label="Yutuq" value={form.achievement} onChange={(v) => setForm({ ...form, achievement: v })} required />
            <LangInput label="Olimpiada nomi" value={form.olympiad} onChange={(v) => setForm({ ...form, olympiad: v })} />
            <LangInput label="Biografiya" value={form.bio} onChange={(v) => setForm({ ...form, bio: v })} multiline />
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1"><label className="text-sm text-slate-300">Medal turi</label>
                <Select value={form.medalType} onValueChange={(v) => setForm({ ...form, medalType: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0c1428] border-white/10 text-white">
                    <SelectItem value="gold">🥇 Oltin</SelectItem><SelectItem value="silver">🥈 Kumush</SelectItem><SelectItem value="bronze">🥉 Bronza</SelectItem>
                  </SelectContent>
                </Select></div>
              <div className="space-y-1"><label className="text-sm text-slate-300">Mamlakat</label><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="🇬🇧 London, UK" className="bg-white/5 border-white/10 text-white" /></div>
              <div className="space-y-1"><label className="text-sm text-slate-300">Yil</label><Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: +e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
            </div>
            <div className="space-y-1"><label className="text-sm text-slate-300">Rasm</label><ImageUpload value={form.photo} onChange={(v) => setForm({ ...form, photo: v })} /></div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-slate-400">Bekor</Button>
              <Button type="submit" disabled={saving} className="bg-amber-400 hover:bg-amber-500 text-[#0f1b4d] font-semibold">{saving ? "Saqlanmoqda..." : "Saqlash"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)} onConfirm={remove} />
    </AdminLayout>
  );
}

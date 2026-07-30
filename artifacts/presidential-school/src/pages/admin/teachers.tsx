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

const SUBJECTS = ["English", "Math", "Physics", "Chemistry", "Biology", "Uzbek", "Russian", "IT", "History", "Geography", "Sports", "Other"];
const GRADES = ["Oliy toifa", "1-toifa", "2-toifa", "Yosh mutaxassis"];

type LangObj = { uz: string; en: string; ru: string };
interface Teacher {
  id: string; name: string; subject: string; grade: string; phone: string;
  university: string; graduationYear: number; experience: number; email: string; photo: string; bio: LangObj;
}
const EMPTY: Omit<Teacher, "id"> = { name: "", subject: "English", grade: "1-toifa", phone: "", university: "", graduationYear: 2020, experience: 1, email: "", photo: "", bio: { uz: "", en: "", ru: "" } };

const GRADE_COLOR: Record<string, string> = {
  "Oliy toifa": "bg-amber-400/20 text-amber-400",
  "1-toifa": "bg-blue-400/20 text-blue-400",
  "2-toifa": "bg-green-400/20 text-green-400",
  "Yosh mutaxassis": "bg-purple-400/20 text-purple-400",
};

export default function AdminTeachers() {
  const { api } = useAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<Teacher[]>([]);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [form, setForm] = useState<Omit<Teacher, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    api<{ ok: boolean; data: Teacher[] }>("/teachers")
      .then((d) => setItems(d.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (t: Teacher) => {
    setEditing(t);
    setForm({ ...t, bio: t.bio ?? { uz: "", en: "", ru: "" } });
    setModalOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) { await api(`/teachers/${editing.id}`, { method: "PUT", body: JSON.stringify(form) }); toast({ title: "Yangilandi" }); }
      else { await api("/teachers", { method: "POST", body: JSON.stringify(form) }); toast({ title: "Qo'shildi" }); }
      setModalOpen(false); load();
      queryClient.invalidateQueries({ queryKey: ["cms", "teachers"] });
    } catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    if (!deleteId) return; setDeleting(true);
    try { await api(`/teachers/${deleteId}`, { method: "DELETE" }); toast({ title: "O'chirildi" }); setDeleteId(null); load(); queryClient.invalidateQueries({ queryKey: ["cms", "teachers"] }); }
    catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
    finally { setDeleting(false); }
  };

  const filtered = items.filter((t) =>
    (subjectFilter === "All" || t.subject === subjectFilter) &&
    (t.name.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div><h1 className="text-xl font-bold text-white">O'qituvchilar</h1><p className="text-slate-400 text-sm">{items.length} ta</p></div>
          <Button onClick={openAdd} className="bg-amber-400 hover:bg-amber-500 text-[#0f1b4d] font-semibold"><Plus className="w-4 h-4 mr-1" /> Qo'shish</Button>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish..." className="pl-9 bg-white/5 border-white/10 text-white" />
          </div>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#0c1428] border-white/10 text-white">
              <SelectItem value="All">Barcha fanlar</SelectItem>
              {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-[#0c1428] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Ism</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Fan</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Toifa</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium hidden lg:table-cell">Tajriba</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium hidden lg:table-cell">Telefon</th>
              <th className="px-4 py-3 w-20"></th>
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Yuklanmoqda...</td></tr>
                : filtered.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Ma'lumot yo'q</td></tr>
                  : filtered.map((t) => (
                    <tr key={t.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-slate-200 font-medium">{t.name}</td>
                      <td className="px-4 py-3 text-slate-300">{t.subject}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${GRADE_COLOR[t.grade] || "bg-slate-500/20 text-slate-400"}`}>{t.grade}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 hidden lg:table-cell">{t.experience} yil</td>
                      <td className="px-4 py-3 text-slate-400 hidden lg:table-cell">{t.phone}</td>
                      <td className="px-4 py-3"><div className="flex gap-1 justify-end">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(t)} className="w-7 h-7 hover:bg-amber-400/10 hover:text-amber-400 text-slate-400"><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteId(t.id)} className="w-7 h-7 hover:bg-red-500/10 hover:text-red-400 text-slate-400"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div></td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#0c1428] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Tahrirlash" : "Yangi o'qituvchi"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-3 pt-2">
            <div className="space-y-1"><label className="text-sm text-slate-300">Ism Familiya *</label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-sm text-slate-300">Fan</label>
                <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0c1428] border-white/10 text-white">{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select></div>
              <div className="space-y-1"><label className="text-sm text-slate-300">Toifa</label>
                <Select value={form.grade} onValueChange={(v) => setForm({ ...form, grade: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0c1428] border-white/10 text-white">{GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-sm text-slate-300">Telefon</label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
              <div className="space-y-1"><label className="text-sm text-slate-300">Email</label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
            </div>
            <div className="space-y-1"><label className="text-sm text-slate-300">Universitet</label><Input value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-sm text-slate-300">Bitirgan yili</label><Input type="number" value={form.graduationYear} onChange={(e) => setForm({ ...form, graduationYear: +e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
              <div className="space-y-1"><label className="text-sm text-slate-300">Tajriba (yil)</label><Input type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: +e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
            </div>
            <LangInput label="Biografiya" value={form.bio} onChange={(v) => setForm({ ...form, bio: v })} multiline />
            <div className="space-y-1"><label className="text-sm text-slate-300">Rasm</label><ImageUpload value={form.photo} onChange={(url) => setForm({ ...form, photo: url })} /></div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-slate-400">Bekor</Button>
              <Button type="submit" disabled={saving} className="bg-amber-400 hover:bg-amber-500 text-[#0f1b4d] font-semibold">{saving ? "Saqlanmoqda..." : "Saqlash"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)} onConfirm={remove} loading={deleting} />
    </AdminLayout>
  );
}

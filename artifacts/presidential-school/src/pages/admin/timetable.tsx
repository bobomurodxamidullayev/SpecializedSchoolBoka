import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { type CmsTimetableItem } from "@/lib/cms";

const GRADES = ["5-sinf", "6-sinf", "7-sinf", "8-sinf", "9-sinf", "10-sinf", "11-sinf"];
const DAYS = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
const PERIODS = [
  { period: 1, time: "08:00 – 08:45" },
  { period: 2, time: "08:55 – 09:40" },
  { period: 3, time: "09:50 – 10:35" },
  { period: 4, time: "10:55 – 11:40" },
  { period: 5, time: "11:50 – 12:35" },
  { period: 6, time: "12:45 – 13:30" },
  { period: 7, time: "13:40 – 14:25" },
];

const EMPTY: Omit<CmsTimetableItem, "id"> = {
  grade: "5-sinf",
  day: "Dushanba",
  period: 1,
  time: "08:00 – 08:45",
  subject: "",
  teacher: "",
  room: "",
};

export default function AdminTimetable() {
  const { api } = useAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<CmsTimetableItem[]>([]);
  const [gradeFilter, setGradeFilter] = useState("5-sinf");
  const [dayFilter, setDayFilter] = useState("Dushanba");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CmsTimetableItem | null>(null);
  const [form, setForm] = useState<Omit<CmsTimetableItem, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    api<{ ok: boolean; data: CmsTimetableItem[] }>("/timetable")
      .then((d) => setItems(d.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filteredItems = items
    .filter((i) => i.grade === gradeFilter && i.day === dayFilter)
    .sort((a, b) => a.period - b.period);

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY, grade: gradeFilter, day: dayFilter }); setModalOpen(true); };
  const openEdit = (item: CmsTimetableItem) => {
    setEditing(item);
    setForm({ ...item });
    setModalOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.teacher || !form.room) {
      toast({ title: "Xato", description: "Barcha maydonlarni to'ldiring", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api(`/timetable/${editing.id}`, { method: "PUT", body: JSON.stringify(form) });
        toast({ title: "Saqlandi", description: "Dars muvaffaqiyatli yangilandi" });
      } else {
        await api("/timetable", { method: "POST", body: JSON.stringify(form) });
        toast({ title: "Qo'shildi", description: "Yangi dars muvaffaqiyatli qo'shildi" });
      }
      queryClient.invalidateQueries({ queryKey: ["cms", "timetable"] });
      setModalOpen(false);
      load();
    } catch (err) {
      toast({ title: "Xato", description: "Saqlashda xatolik yuz berdi", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api(`/timetable/${deleteId}`, { method: "DELETE" });
      toast({ title: "O'chirildi", description: "Dars o'chirildi" });
      queryClient.invalidateQueries({ queryKey: ["cms", "timetable"] });
      load();
    } catch (err) {
      toast({ title: "Xato", description: "O'chirishda xatolik", variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white">Dars jadvali</h1>
          <p className="text-slate-400 text-sm mt-1">Dars jadvalini tahrirlash</p>
        </div>
        <Button onClick={openAdd} className="bg-amber-400 hover:bg-amber-300 text-[#080e1e] font-semibold">
          <Plus className="w-4 h-4 mr-2" /> Yangi dars
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="w-full sm:w-48">
          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger className="bg-[#0c1428] border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#0c1428] border-white/10 text-white">
              {GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Select value={dayFilter} onValueChange={setDayFilter}>
            <SelectTrigger className="bg-[#0c1428] border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#0c1428] border-white/10 text-white">
              {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-[#0c1428] border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Yuklanmoqda...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-400">Bu kun uchun darslar topilmadi</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-slate-300 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-medium">Dars</th>
                  <th className="px-6 py-4 font-medium">Vaqti</th>
                  <th className="px-6 py-4 font-medium">Fan nomi</th>
                  <th className="px-6 py-4 font-medium">O'qituvchi</th>
                  <th className="px-6 py-4 font-medium">Xona</th>
                  <th className="px-6 py-4 font-medium text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-slate-300">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium">{item.period}-dars</td>
                    <td className="px-6 py-4">{item.time}</td>
                    <td className="px-6 py-4 text-amber-400">{item.subject}</td>
                    <td className="px-6 py-4">{item.teacher}</td>
                    <td className="px-6 py-4">{item.room}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(item)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(item.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#0c1428] border-white/10 text-white max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Darsni tahrirlash" : "Yangi dars qo'shish"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Sinf</label>
                <Select value={form.grade} onValueChange={(v) => setForm({ ...form, grade: v })}>
                  <SelectTrigger className="bg-black/20 border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0c1428] border-white/10 text-white">
                    {GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Kun</label>
                <Select value={form.day} onValueChange={(v) => setForm({ ...form, day: v })}>
                  <SelectTrigger className="bg-black/20 border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0c1428] border-white/10 text-white">
                    {DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Dars tartibi va vaqti</label>
              <Select value={String(form.period)} onValueChange={(v) => {
                const p = parseInt(v);
                setForm({ ...form, period: p, time: PERIODS[p - 1].time });
              }}>
                <SelectTrigger className="bg-black/20 border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#0c1428] border-white/10 text-white">
                  {PERIODS.map((p) => <SelectItem key={p.period} value={String(p.period)}>{p.period}-dars ({p.time})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Fan nomi</label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="bg-black/20 border-white/10" placeholder="Masalan: Matematika" />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">O'qituvchi</label>
              <Input value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} className="bg-black/20 border-white/10" placeholder="F.I.SH" />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Xona</label>
              <Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="bg-black/20 border-white/10" placeholder="Masalan: 105-xona" />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">Bekor qilish</Button>
              <Button type="submit" disabled={saving} className="bg-amber-400 hover:bg-amber-300 text-[#080e1e] font-semibold">{saving ? "Saqlanmoqda..." : "Saqlash"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={remove} title="O'chirishni tasdiqlaysizmi?" description="Dars jadvali qaytarib bo'lmaydigan qilib o'chiriladi." loading={deleting} />
    </AdminLayout>
  );
}

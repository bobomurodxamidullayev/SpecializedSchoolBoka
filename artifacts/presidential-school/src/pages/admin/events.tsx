import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { LangInput } from "@/components/admin/LangInput";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, CalendarDays } from "lucide-react";

type LangObj = { uz: string; en: string; ru: string };
interface EventItem {
  id: string;
  order: number;
  title: LangObj;
  date: string;
  time: string;
  location: LangObj;
  description: LangObj;
  category: string;
}
const CATS = ["Academic", "Competition", "Community", "Cultural", "Sports", "Other"];
const EMPTY: Omit<EventItem, "id" | "order"> = {
  title: { uz: "", en: "", ru: "" },
  date: new Date().toISOString().slice(0, 10),
  time: "10:00",
  location: { uz: "", en: "", ru: "" },
  description: { uz: "", en: "", ru: "" },
  category: "Academic",
};

export default function AdminEvents() {
  const { api } = useAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [form, setForm] = useState<Omit<EventItem, "id" | "order">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () => {
    api<{ ok: boolean; data: EventItem[] }>("/events")
      .then((d) => setItems(d.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (ev: EventItem) => { setEditing(ev); setForm({ title: ev.title, date: ev.date, time: ev.time, location: ev.location, description: ev.description, category: ev.category }); setModalOpen(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await api(`/events/${editing.id}`, { method: "PUT", body: JSON.stringify(form) });
      else await api("/events", { method: "POST", body: JSON.stringify(form) });
      toast({ title: editing ? "Yangilandi" : "Qo'shildi" });
      setModalOpen(false); load();
      queryClient.invalidateQueries({ queryKey: ["cms", "events"] });
    } catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    if (!deleteId) return;
    try { await api(`/events/${deleteId}`, { method: "DELETE" }); toast({ title: "O'chirildi" }); setDeleteId(null); load(); queryClient.invalidateQueries({ queryKey: ["cms", "events"] }); }
    catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
  };

  const setL = (key: keyof typeof form) => (v: LangObj) => setForm((f) => ({ ...f, [key]: v }));
  const setF = (key: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Tadbirlar</h1>
            <p className="text-slate-400 text-sm mt-1">{items.length} ta tadbir</p>
          </div>
          <Button onClick={openAdd} className="bg-amber-400 hover:bg-amber-300 text-[#080e1e] font-semibold">
            <Plus className="w-4 h-4 mr-2" /> Qo'shish
          </Button>
        </div>

        {loading ? (
          <div className="text-slate-400 text-center py-16">Yuklanmoqda…</div>
        ) : items.length === 0 ? (
          <div className="text-slate-400 text-center py-16">Hali tadbir yo'q</div>
        ) : (
          <div className="space-y-3">
            {items.map((ev) => (
              <div key={ev.id} className="bg-[#0c1428] border border-white/10 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center shrink-0">
                  <CalendarDays className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">{ev.title.en || ev.title.uz}</div>
                  <div className="text-slate-400 text-sm">{ev.date} · {ev.time} · {ev.location.en || ev.location.uz} · <span className="text-amber-400/80">{ev.category}</span></div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="icon" variant="ghost" className="text-slate-400 hover:text-amber-400" onClick={() => openEdit(ev)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-slate-400 hover:text-red-400" onClick={() => setDeleteId(ev.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#0c1428] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Tadbir tahrirlash" : "Yangi tadbir"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4 mt-2">
            <LangInput label="Sarlavha" value={form.title} onChange={setL("title")} required />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Sana</label>
                <Input type="date" value={form.date} onChange={(e) => setF("date")(e.target.value)} className="bg-white/5 border-white/10 text-white" required />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Vaqt</label>
                <Input type="time" value={form.time} onChange={(e) => setF("time")(e.target.value)} className="bg-white/5 border-white/10 text-white" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Kategoriya</label>
              <Select value={form.category} onValueChange={setF("category")}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#0c1428] border-white/10">{CATS.map((c) => <SelectItem key={c} value={c} className="text-white">{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <LangInput label="Joylashuv" value={form.location} onChange={setL("location")} />
            <LangInput label="Tavsif" value={form.description} onChange={setL("description")} multiline />
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

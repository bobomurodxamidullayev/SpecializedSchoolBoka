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
import { Plus, Pencil, Trash2, Save } from "lucide-react";

type LangObj = { uz: string; en: string; ru: string };
interface PhilosophyItem { id: string; order: number; title: LangObj; desc: LangObj }
interface TimelineItem { id: string; order: number; year: string; title: LangObj; desc: LangObj }
interface AboutDoc { mission: LangObj; vision: LangObj; philosophy: PhilosophyItem[]; timeline: TimelineItem[] }

const EMPTY_PHILO: Omit<PhilosophyItem, "id" | "order"> = { title: { uz: "", en: "", ru: "" }, desc: { uz: "", en: "", ru: "" } };
const EMPTY_TL: Omit<TimelineItem, "id" | "order"> = { year: String(new Date().getFullYear()), title: { uz: "", en: "", ru: "" }, desc: { uz: "", en: "", ru: "" } };

export default function AdminAbout() {
  const { api } = useAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"main" | "philo" | "timeline">("main");
  const [doc, setDoc] = useState<AboutDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [philoModal, setPhiloModal] = useState(false);
  const [editingPhilo, setEditingPhilo] = useState<PhilosophyItem | null>(null);
  const [formPhilo, setFormPhilo] = useState<Omit<PhilosophyItem, "id" | "order">>(EMPTY_PHILO);

  const [tlModal, setTlModal] = useState(false);
  const [editingTl, setEditingTl] = useState<TimelineItem | null>(null);
  const [formTl, setFormTl] = useState<Omit<TimelineItem, "id" | "order">>(EMPTY_TL);

  const [deleteTarget, setDeleteTarget] = useState<{ type: "philo" | "tl"; id: string } | null>(null);

  const load = () => {
    api<{ ok: boolean; data: AboutDoc }>("/about")
      .then((d) => setDoc(d.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const saveDoc = async () => {
    if (!doc) return; setSaving(true);
    try {
      await api("/about", { method: "PUT", body: JSON.stringify(doc) });
      toast({ title: "Saqlandi" });
      queryClient.invalidateQueries({ queryKey: ["cms", "about"] });
    } catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const savePhilo = async (e: React.FormEvent) => {
    e.preventDefault(); if (!doc) return; setSaving(true);
    try {
      const newDoc = { ...doc };
      if (editingPhilo) {
        newDoc.philosophy = doc.philosophy.map((p) => p.id === editingPhilo.id ? { ...p, ...formPhilo } : p);
      } else {
        newDoc.philosophy = [...doc.philosophy, { id: crypto.randomUUID(), order: doc.philosophy.length + 1, ...formPhilo }];
      }
      await api("/about", { method: "PUT", body: JSON.stringify(newDoc) });
      setDoc(newDoc); setPhiloModal(false);
      toast({ title: editingPhilo ? "Yangilandi" : "Qo'shildi" });
      queryClient.invalidateQueries({ queryKey: ["cms", "about"] });
    } catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const saveTl = async (e: React.FormEvent) => {
    e.preventDefault(); if (!doc) return; setSaving(true);
    try {
      const newDoc = { ...doc };
      if (editingTl) {
        newDoc.timeline = doc.timeline.map((t) => t.id === editingTl.id ? { ...t, ...formTl } : t);
      } else {
        newDoc.timeline = [...doc.timeline, { id: crypto.randomUUID(), order: doc.timeline.length + 1, ...formTl }];
      }
      await api("/about", { method: "PUT", body: JSON.stringify(newDoc) });
      setDoc(newDoc); setTlModal(false);
      toast({ title: editingTl ? "Yangilandi" : "Qo'shildi" });
      queryClient.invalidateQueries({ queryKey: ["cms", "about"] });
    } catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const deleteItem = async () => {
    if (!deleteTarget || !doc) return; setSaving(true);
    try {
      const newDoc = { ...doc };
      if (deleteTarget.type === "philo") newDoc.philosophy = doc.philosophy.filter((p) => p.id !== deleteTarget.id);
      else newDoc.timeline = doc.timeline.filter((t) => t.id !== deleteTarget.id);
      await api("/about", { method: "PUT", body: JSON.stringify(newDoc) });
      setDoc(newDoc); setDeleteTarget(null);
      toast({ title: "O'chirildi" });
      queryClient.invalidateQueries({ queryKey: ["cms", "about"] });
    } catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  if (loading) return <AdminLayout><div className="text-slate-400 text-center py-16">Yuklanmoqda…</div></AdminLayout>;
  if (!doc) return <AdminLayout><div className="text-slate-400 text-center py-16">Ma'lumot topilmadi</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-white">Maktab haqida</h1><p className="text-slate-400 text-sm mt-1">Missiya, falsafa va tarix</p></div>

        <div className="flex gap-2 border-b border-white/10">
          {(["main", "philo", "timeline"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === t ? "bg-amber-400/15 text-amber-400 border-b-2 border-amber-400" : "text-slate-400 hover:text-white"}`}>
              {t === "main" ? "Missiya va Vizyon" : t === "philo" ? `Falsafa (${doc.philosophy.length})` : `Tarix (${doc.timeline.length})`}
            </button>
          ))}
        </div>

        {tab === "main" && (
          <div className="space-y-6 max-w-3xl">
            <div className="bg-[#0c1428] border border-white/10 rounded-xl p-6 space-y-4">
              <h2 className="text-white font-semibold">Missiya</h2>
              <LangInput label="" value={doc.mission} onChange={(v) => setDoc((d) => d ? { ...d, mission: v } : d!)} multiline />
            </div>
            <div className="bg-[#0c1428] border border-white/10 rounded-xl p-6 space-y-4">
              <h2 className="text-white font-semibold">Vizyon</h2>
              <LangInput label="" value={doc.vision} onChange={(v) => setDoc((d) => d ? { ...d, vision: v } : d!)} multiline />
            </div>
            <div className="flex justify-end">
              <Button onClick={saveDoc} disabled={saving} className="bg-amber-400 hover:bg-amber-300 text-[#080e1e] font-semibold">
                <Save className="w-4 h-4 mr-2" />{saving ? "Saqlanmoqda…" : "Saqlash"}
              </Button>
            </div>
          </div>
        )}

        {tab === "philo" && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button onClick={() => { setEditingPhilo(null); setFormPhilo(EMPTY_PHILO); setPhiloModal(true); }} className="bg-amber-400 hover:bg-amber-300 text-[#080e1e] font-semibold"><Plus className="w-4 h-4 mr-2" /> Qo'shish</Button>
            </div>
            {doc.philosophy.length === 0 ? <div className="text-slate-400 text-center py-12">Hali falsafa elementi yo'q</div> : doc.philosophy.map((p) => (
              <div key={p.id} className="bg-[#0c1428] border border-white/10 rounded-xl p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white">{p.title.en || p.title.uz}</div>
                  <div className="text-slate-400 text-sm mt-1">{p.desc.en || p.desc.uz}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="icon" variant="ghost" className="text-slate-400 hover:text-amber-400" onClick={() => { setEditingPhilo(p); setFormPhilo({ title: p.title, desc: p.desc }); setPhiloModal(true); }}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-slate-400 hover:text-red-400" onClick={() => setDeleteTarget({ type: "philo", id: p.id })}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "timeline" && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button onClick={() => { setEditingTl(null); setFormTl(EMPTY_TL); setTlModal(true); }} className="bg-amber-400 hover:bg-amber-300 text-[#080e1e] font-semibold"><Plus className="w-4 h-4 mr-2" /> Qo'shish</Button>
            </div>
            {doc.timeline.length === 0 ? <div className="text-slate-400 text-center py-12">Hali tarix elementi yo'q</div> : doc.timeline.map((t) => (
              <div key={t.id} className="bg-[#0c1428] border border-white/10 rounded-xl p-4 flex items-start gap-4">
                <div className="w-16 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 font-bold text-primary text-sm">{t.year}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white">{t.title.en || t.title.uz}</div>
                  <div className="text-slate-400 text-sm mt-1">{t.desc.en || t.desc.uz}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="icon" variant="ghost" className="text-slate-400 hover:text-amber-400" onClick={() => { setEditingTl(t); setFormTl({ year: t.year, title: t.title, desc: t.desc }); setTlModal(true); }}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-slate-400 hover:text-red-400" onClick={() => setDeleteTarget({ type: "tl", id: t.id })}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={philoModal} onOpenChange={setPhiloModal}>
        <DialogContent className="bg-[#0c1428] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingPhilo ? "Falsafa tahrirlash" : "Yangi falsafa"}</DialogTitle></DialogHeader>
          <form onSubmit={savePhilo} className="space-y-4 mt-2">
            <LangInput label="Sarlavha" value={formPhilo.title} onChange={(v) => setFormPhilo((f) => ({ ...f, title: v }))} required />
            <LangInput label="Tavsif" value={formPhilo.desc} onChange={(v) => setFormPhilo((f) => ({ ...f, desc: v }))} multiline />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setPhiloModal(false)} className="text-slate-400">Bekor</Button>
              <Button type="submit" disabled={saving} className="bg-amber-400 hover:bg-amber-300 text-[#080e1e] font-semibold">{saving ? "Saqlanmoqda…" : "Saqlash"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={tlModal} onOpenChange={setTlModal}>
        <DialogContent className="bg-[#0c1428] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingTl ? "Tarix tahrirlash" : "Yangi tarix elementi"}</DialogTitle></DialogHeader>
          <form onSubmit={saveTl} className="space-y-4 mt-2">
            <div><label className="text-xs text-slate-400 mb-1 block">Yil</label><Input value={formTl.year} onChange={(e) => setFormTl((f) => ({ ...f, year: e.target.value }))} className="bg-white/5 border-white/10 text-white" placeholder="2024" required /></div>
            <LangInput label="Sarlavha" value={formTl.title} onChange={(v) => setFormTl((f) => ({ ...f, title: v }))} required />
            <LangInput label="Tavsif" value={formTl.desc} onChange={(v) => setFormTl((f) => ({ ...f, desc: v }))} multiline />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setTlModal(false)} className="text-slate-400">Bekor</Button>
              <Button type="submit" disabled={saving} className="bg-amber-400 hover:bg-amber-300 text-[#080e1e] font-semibold">{saving ? "Saqlanmoqda…" : "Saqlash"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onConfirm={deleteItem} onCancel={() => setDeleteTarget(null)} title="O'chirishni tasdiqlaysizmi?" description="Bu amal qaytarib bo'lmaydi." />
    </AdminLayout>
  );
}

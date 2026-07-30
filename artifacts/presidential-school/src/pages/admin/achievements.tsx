import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Globe, Trophy } from "lucide-react";

interface IntlItem { id: string; order: number; subject: string; competition: string; award: string; flag: string; country: string }
interface NatItem { id: string; order: number; subject: string; award: string; count: number; color: string }

const EMPTY_INT: Omit<IntlItem, "id" | "order"> = { subject: "", competition: "", award: "Gold Medal", flag: "🏅", country: "" };
const EMPTY_NAT: Omit<NatItem, "id" | "order"> = { subject: "", award: "1st Place", count: 1, color: "from-blue-500 to-indigo-600" };
const COLORS = ["from-blue-500 to-indigo-600", "from-violet-500 to-purple-600", "from-orange-500 to-red-600", "from-cyan-500 to-teal-600", "from-emerald-500 to-green-600", "from-amber-500 to-yellow-600", "from-pink-500 to-rose-600"];

export default function AdminAchievements() {
  const { api } = useAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"int" | "nat">("int");
  const [intl, setIntl] = useState<IntlItem[]>([]);
  const [natl, setNatl] = useState<NatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInt, setEditingInt] = useState<IntlItem | null>(null);
  const [editingNat, setEditingNat] = useState<NatItem | null>(null);
  const [formInt, setFormInt] = useState<Omit<IntlItem, "id" | "order">>(EMPTY_INT);
  const [formNat, setFormNat] = useState<Omit<NatItem, "id" | "order">>(EMPTY_NAT);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadInt = () => api<{ ok: boolean; data: IntlItem[] }>("/achievements-international").then((d) => setIntl(d.data)).catch(() => {});
  const loadNat = () => api<{ ok: boolean; data: NatItem[] }>("/achievements-national").then((d) => setNatl(d.data)).catch(() => {});
  const loadAll = () => { setLoading(true); Promise.all([loadInt(), loadNat()]).finally(() => setLoading(false)); };
  useEffect(() => { loadAll(); }, []);

  const openAddInt = () => { setEditingInt(null); setFormInt(EMPTY_INT); setTab("int"); setModalOpen(true); };
  const openAddNat = () => { setEditingNat(null); setFormNat(EMPTY_NAT); setTab("nat"); setModalOpen(true); };
  const openEditInt = (i: IntlItem) => { setEditingInt(i); setFormInt({ subject: i.subject, competition: i.competition, award: i.award, flag: i.flag, country: i.country }); setTab("int"); setModalOpen(true); };
  const openEditNat = (i: NatItem) => { setEditingNat(i); setFormNat({ subject: i.subject, award: i.award, count: i.count, color: i.color }); setTab("nat"); setModalOpen(true); };

  const saveInt = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editingInt) await api(`/achievements-international/${editingInt.id}`, { method: "PUT", body: JSON.stringify(formInt) });
      else await api("/achievements-international", { method: "POST", body: JSON.stringify(formInt) });
      toast({ title: editingInt ? "Yangilandi" : "Qo'shildi" }); setModalOpen(false); loadInt();
      queryClient.invalidateQueries({ queryKey: ["cms", "achievements-international"] });
    } catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const saveNat = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editingNat) await api(`/achievements-national/${editingNat.id}`, { method: "PUT", body: JSON.stringify(formNat) });
      else await api("/achievements-national", { method: "POST", body: JSON.stringify(formNat) });
      toast({ title: editingNat ? "Yangilandi" : "Qo'shildi" }); setModalOpen(false); loadNat();
      queryClient.invalidateQueries({ queryKey: ["cms", "achievements-national"] });
    } catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const removeInt = async () => {
    if (!deleteId) return;
    try { await api(`/achievements-international/${deleteId}`, { method: "DELETE" }); toast({ title: "O'chirildi" }); setDeleteId(null); loadInt(); queryClient.invalidateQueries({ queryKey: ["cms", "achievements-international"] }); }
    catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
  };
  const removeNat = async () => {
    if (!deleteId) return;
    try { await api(`/achievements-national/${deleteId}`, { method: "DELETE" }); toast({ title: "O'chirildi" }); setDeleteId(null); loadNat(); queryClient.invalidateQueries({ queryKey: ["cms", "achievements-national"] }); }
    catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
  };

  const isIntModal = tab === "int" || !!editingInt;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Yutuqlar</h1>
          <p className="text-slate-400 text-sm mt-1">Xalqaro va milliy olimpiada yutuqlari</p>
        </div>

        <div className="flex gap-2 border-b border-white/10 pb-0">
          {(["int", "nat"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === t ? "bg-amber-400/15 text-amber-400 border-b-2 border-amber-400" : "text-slate-400 hover:text-white"}`}>
              {t === "int" ? `Xalqaro (${intl.length})` : `Milliy (${natl.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-slate-400 text-center py-16">Yuklanmoqda…</div>
        ) : tab === "int" ? (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button onClick={openAddInt} className="bg-amber-400 hover:bg-amber-300 text-[#080e1e] font-semibold"><Plus className="w-4 h-4 mr-2" /> Qo'shish</Button>
            </div>
            {intl.length === 0 ? <div className="text-slate-400 text-center py-12">Hali yutuq yo'q</div> : intl.map((item) => (
              <div key={item.id} className="bg-[#0c1428] border border-white/10 rounded-xl p-4 flex items-center gap-4">
                <div className="text-3xl shrink-0">{item.flag}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white">{item.subject} — <span className="text-amber-400">{item.award}</span></div>
                  <div className="text-slate-400 text-sm">{item.competition} · {item.country}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="icon" variant="ghost" className="text-slate-400 hover:text-amber-400" onClick={() => openEditInt(item)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-slate-400 hover:text-red-400" onClick={() => setDeleteId(item.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button onClick={openAddNat} className="bg-amber-400 hover:bg-amber-300 text-[#080e1e] font-semibold"><Plus className="w-4 h-4 mr-2" /> Qo'shish</Button>
            </div>
            {natl.length === 0 ? <div className="text-slate-400 text-center py-12">Hali yutuq yo'q</div> : natl.map((item) => (
              <div key={item.id} className="bg-[#0c1428] border border-white/10 rounded-xl p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0`}>
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white">{item.subject} — <span className="text-amber-400">{item.award}</span></div>
                  <div className="text-slate-400 text-sm">{item.count} ta mukofot</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="icon" variant="ghost" className="text-slate-400 hover:text-amber-400" onClick={() => openEditNat(item)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-slate-400 hover:text-red-400" onClick={() => setDeleteId(item.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#0c1428] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {tab === "int" ? <Globe className="w-4 h-4 text-amber-400" /> : <Trophy className="w-4 h-4 text-amber-400" />}
              {tab === "int" ? (editingInt ? "Xalqaro yutuq tahrirlash" : "Yangi xalqaro yutuq") : (editingNat ? "Milliy yutuq tahrirlash" : "Yangi milliy yutuq")}
            </DialogTitle>
          </DialogHeader>

          {tab === "int" ? (
            <form onSubmit={saveInt} className="space-y-4 mt-2">
              <div><label className="text-xs text-slate-400 mb-1 block">Fan</label><Input value={formInt.subject} onChange={(e) => setFormInt((f) => ({ ...f, subject: e.target.value }))} className="bg-white/5 border-white/10 text-white" placeholder="Mathematics" required /></div>
              <div><label className="text-xs text-slate-400 mb-1 block">Musobaqa nomi</label><Input value={formInt.competition} onChange={(e) => setFormInt((f) => ({ ...f, competition: e.target.value }))} className="bg-white/5 border-white/10 text-white" placeholder="IMO 2024" required /></div>
              <div><label className="text-xs text-slate-400 mb-1 block">Mukofot</label><Input value={formInt.award} onChange={(e) => setFormInt((f) => ({ ...f, award: e.target.value }))} className="bg-white/5 border-white/10 text-white" placeholder="Gold Medal" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-slate-400 mb-1 block">Bayroq (emoji)</label><Input value={formInt.flag} onChange={(e) => setFormInt((f) => ({ ...f, flag: e.target.value }))} className="bg-white/5 border-white/10 text-white" placeholder="🇬🇧" /></div>
                <div><label className="text-xs text-slate-400 mb-1 block">Mamlakat</label><Input value={formInt.country} onChange={(e) => setFormInt((f) => ({ ...f, country: e.target.value }))} className="bg-white/5 border-white/10 text-white" placeholder="London, UK" /></div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-slate-400">Bekor</Button>
                <Button type="submit" disabled={saving} className="bg-amber-400 hover:bg-amber-300 text-[#080e1e] font-semibold">{saving ? "Saqlanmoqda…" : "Saqlash"}</Button>
              </div>
            </form>
          ) : (
            <form onSubmit={saveNat} className="space-y-4 mt-2">
              <div><label className="text-xs text-slate-400 mb-1 block">Fan</label><Input value={formNat.subject} onChange={(e) => setFormNat((f) => ({ ...f, subject: e.target.value }))} className="bg-white/5 border-white/10 text-white" placeholder="Mathematics" required /></div>
              <div><label className="text-xs text-slate-400 mb-1 block">Mukofot</label><Input value={formNat.award} onChange={(e) => setFormNat((f) => ({ ...f, award: e.target.value }))} className="bg-white/5 border-white/10 text-white" placeholder="1st Place" required /></div>
              <div><label className="text-xs text-slate-400 mb-1 block">Soni</label><Input type="number" min={1} value={formNat.count} onChange={(e) => setFormNat((f) => ({ ...f, count: Number(e.target.value) }))} className="bg-white/5 border-white/10 text-white" /></div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Rang</label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setFormNat((f) => ({ ...f, color: c }))} className={`h-8 rounded-lg bg-gradient-to-br ${c} border-2 transition-all ${formNat.color === c ? "border-amber-400 scale-105" : "border-transparent"}`} />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-slate-400">Bekor</Button>
                <Button type="submit" disabled={saving} className="bg-amber-400 hover:bg-amber-300 text-[#080e1e] font-semibold">{saving ? "Saqlanmoqda…" : "Saqlash"}</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onConfirm={tab === "int" ? removeInt : removeNat}
        onCancel={() => setDeleteId(null)}
        title="O'chirishni tasdiqlaysizmi?"
        description="Bu amal qaytarib bo'lmaydi."
      />
    </AdminLayout>
  );
}

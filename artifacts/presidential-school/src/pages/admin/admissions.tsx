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
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, GripVertical } from "lucide-react";

type LangObj = { uz: string; en: string; ru: string };
interface Stage { id: string; order: number; name: LangObj; description: LangObj; deadline: string; status: string }
interface Requirement { id: string; order: number; text: LangObj }
interface DateEntry { id: string; order: number; date: string; event: LangObj }

const STATUSES = ["active", "upcoming", "completed", "closed"];
const STATUS_COLOR: Record<string, string> = { active: "bg-green-500/20 text-green-400", upcoming: "bg-blue-500/20 text-blue-400", completed: "bg-slate-500/20 text-slate-400", closed: "bg-red-500/20 text-red-400" };
const EMPTY_STAGE: Omit<Stage, "id" | "order"> = { name: { uz: "", en: "", ru: "" }, description: { uz: "", en: "", ru: "" }, deadline: "", status: "upcoming" };
const EMPTY_REQ: Omit<Requirement, "id" | "order"> = { text: { uz: "", en: "", ru: "" } };
const EMPTY_DATE: Omit<DateEntry, "id" | "order"> = { date: "", event: { uz: "", en: "", ru: "" } };

type Tab = "stages" | "requirements" | "dates";

export default function AdminAdmissions() {
  const { api } = useAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("stages");

  /* ─── Stages ─── */
  const [stages, setStages] = useState<Stage[]>([]);
  const [stagesLoading, setStagesLoading] = useState(true);
  const [stageModal, setStageModal] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [stageForm, setStageForm] = useState<Omit<Stage, "id" | "order">>(EMPTY_STAGE);
  const [stageSaving, setStageSaving] = useState(false);
  const [deleteStageId, setDeleteStageId] = useState<string | null>(null);

  const loadStages = () => { api<{ ok: boolean; data: Stage[] }>("/admissions").then((d) => setStages(d.data)).catch(() => {}).finally(() => setStagesLoading(false)); };
  useEffect(() => { loadStages(); }, []);

  const saveStage = async (e: React.FormEvent) => {
    e.preventDefault(); setStageSaving(true);
    try {
      if (editingStage) await api(`/admissions/${editingStage.id}`, { method: "PUT", body: JSON.stringify(stageForm) });
      else await api("/admissions", { method: "POST", body: JSON.stringify(stageForm) });
      toast({ title: editingStage ? "Yangilandi" : "Qo'shildi" }); setStageModal(false); loadStages();
      queryClient.invalidateQueries({ queryKey: ["cms", "admissions"] });
    } catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
    finally { setStageSaving(false); }
  };

  const removeStage = async () => {
    if (!deleteStageId) return;
    try { await api(`/admissions/${deleteStageId}`, { method: "DELETE" }); toast({ title: "O'chirildi" }); setDeleteStageId(null); loadStages(); queryClient.invalidateQueries({ queryKey: ["cms", "admissions"] }); }
    catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
  };

  const reorderStage = async (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= stages.length) return;
    const ids = [...stages]; [ids[index], ids[next]] = [ids[next], ids[index]];
    try { await api("/admissions/reorder", { method: "PATCH", body: JSON.stringify({ ids: ids.map((s) => s.id) }) }); toast({ title: "Tartib yangilandi" }); loadStages(); }
    catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
  };

  /* ─── Requirements ─── */
  const [reqs, setReqs] = useState<Requirement[]>([]);
  const [reqsLoading, setReqsLoading] = useState(true);
  const [reqModal, setReqModal] = useState(false);
  const [editingReq, setEditingReq] = useState<Requirement | null>(null);
  const [reqForm, setReqForm] = useState<Omit<Requirement, "id" | "order">>(EMPTY_REQ);
  const [reqSaving, setReqSaving] = useState(false);
  const [deleteReqId, setDeleteReqId] = useState<string | null>(null);

  const loadReqs = () => { api<{ ok: boolean; data: Requirement[] }>("/admissions-requirements").then((d) => setReqs(d.data)).catch(() => {}).finally(() => setReqsLoading(false)); };
  useEffect(() => { loadReqs(); }, []);

  const saveReq = async (e: React.FormEvent) => {
    e.preventDefault(); setReqSaving(true);
    try {
      if (editingReq) await api(`/admissions-requirements/${editingReq.id}`, { method: "PUT", body: JSON.stringify(reqForm) });
      else await api("/admissions-requirements", { method: "POST", body: JSON.stringify(reqForm) });
      toast({ title: editingReq ? "Yangilandi" : "Qo'shildi" }); setReqModal(false); loadReqs();
      queryClient.invalidateQueries({ queryKey: ["cms", "admissions-requirements"] });
    } catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
    finally { setReqSaving(false); }
  };

  const removeReq = async () => {
    if (!deleteReqId) return;
    try { await api(`/admissions-requirements/${deleteReqId}`, { method: "DELETE" }); toast({ title: "O'chirildi" }); setDeleteReqId(null); loadReqs(); queryClient.invalidateQueries({ queryKey: ["cms", "admissions-requirements"] }); }
    catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
  };

  const reorderReq = async (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= reqs.length) return;
    const ids = [...reqs]; [ids[index], ids[next]] = [ids[next], ids[index]];
    try { await api("/admissions-requirements/reorder", { method: "PATCH", body: JSON.stringify({ ids: ids.map((r) => r.id) }) }); toast({ title: "Tartib yangilandi" }); loadReqs(); }
    catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
  };

  /* ─── Dates ─── */
  const [dates, setDates] = useState<DateEntry[]>([]);
  const [datesLoading, setDatesLoading] = useState(true);
  const [dateModal, setDateModal] = useState(false);
  const [editingDate, setEditingDate] = useState<DateEntry | null>(null);
  const [dateForm, setDateForm] = useState<Omit<DateEntry, "id" | "order">>(EMPTY_DATE);
  const [dateSaving, setDateSaving] = useState(false);
  const [deleteDateId, setDeleteDateId] = useState<string | null>(null);

  const loadDates = () => { api<{ ok: boolean; data: DateEntry[] }>("/admissions-dates").then((d) => setDates(d.data)).catch(() => {}).finally(() => setDatesLoading(false)); };
  useEffect(() => { loadDates(); }, []);

  const saveDate = async (e: React.FormEvent) => {
    e.preventDefault(); setDateSaving(true);
    try {
      if (editingDate) await api(`/admissions-dates/${editingDate.id}`, { method: "PUT", body: JSON.stringify(dateForm) });
      else await api("/admissions-dates", { method: "POST", body: JSON.stringify(dateForm) });
      toast({ title: editingDate ? "Yangilandi" : "Qo'shildi" }); setDateModal(false); loadDates();
      queryClient.invalidateQueries({ queryKey: ["cms", "admissions-dates"] });
    } catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
    finally { setDateSaving(false); }
  };

  const removeDate = async () => {
    if (!deleteDateId) return;
    try { await api(`/admissions-dates/${deleteDateId}`, { method: "DELETE" }); toast({ title: "O'chirildi" }); setDeleteDateId(null); loadDates(); queryClient.invalidateQueries({ queryKey: ["cms", "admissions-dates"] }); }
    catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
  };

  const reorderDate = async (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= dates.length) return;
    const ids = [...dates]; [ids[index], ids[next]] = [ids[next], ids[index]];
    try { await api("/admissions-dates/reorder", { method: "PATCH", body: JSON.stringify({ ids: ids.map((d) => d.id) }) }); toast({ title: "Tartib yangilandi" }); loadDates(); }
    catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: "stages", label: "Qabul bosqichlari" },
    { key: "requirements", label: "Talab hujjatlar" },
    { key: "dates", label: "Muhim sanalar" },
  ];

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-white">Qabul 2026</h1>
          <p className="text-slate-400 text-sm">Qabul sahifasini boshqaring</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-amber-400 text-[#0f1b4d]" : "text-slate-400 hover:text-white"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Stages Tab ── */}
        {tab === "stages" && (
          <>
            <div className="flex items-center justify-between gap-3">
              <p className="text-slate-400 text-sm">Qabul jarayonining bosqichlarini boshqaring</p>
              <Button onClick={() => { setEditingStage(null); setStageForm(EMPTY_STAGE); setStageModal(true); }} className="bg-amber-400 hover:bg-amber-500 text-[#0f1b4d] font-semibold shrink-0">
                <Plus className="w-4 h-4 mr-1" /> Bosqich qo'shish
              </Button>
            </div>
            {stagesLoading ? <div className="py-8 text-center text-slate-500">Yuklanmoqda...</div>
              : stages.length === 0 ? <div className="py-8 text-center text-slate-500">Ma'lumot yo'q</div>
                : <div className="space-y-3">
                  {stages.map((s, idx) => (
                    <div key={s.id} className="bg-[#0c1428] border border-white/10 rounded-xl p-4 flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1 pt-0.5">
                        <GripVertical className="w-4 h-4 text-slate-600" />
                        <span className="text-xs font-bold text-slate-500">#{idx + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-sm font-semibold text-white">{s.name.uz}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[s.status] || "bg-slate-500/20 text-slate-400"}`}>{s.status}</span>
                        </div>
                        <p className="text-xs text-slate-400 mb-1">{s.description.uz}</p>
                        {s.deadline && <p className="text-xs text-amber-400">📅 Muddat: {s.deadline}</p>}
                      </div>
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <Button size="icon" variant="ghost" disabled={idx === 0} onClick={() => reorderStage(idx, -1)} className="w-7 h-7 text-slate-400 hover:text-amber-400"><ChevronUp className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" disabled={idx === stages.length - 1} onClick={() => reorderStage(idx, 1)} className="w-7 h-7 text-slate-400 hover:text-amber-400"><ChevronDown className="w-3.5 h-3.5" /></Button>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => { setEditingStage(s); setStageForm({ name: s.name, description: s.description, deadline: s.deadline, status: s.status }); setStageModal(true); }} className="w-7 h-7 hover:bg-amber-400/10 hover:text-amber-400 text-slate-400"><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteStageId(s.id)} className="w-7 h-7 hover:bg-red-500/10 hover:text-red-400 text-slate-400"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                  ))}
                </div>}
          </>
        )}

        {/* ── Requirements Tab ── */}
        {tab === "requirements" && (
          <>
            <div className="flex items-center justify-between gap-3">
              <p className="text-slate-400 text-sm">Talab qilinadigan hujjatlar ro'yxatini boshqaring</p>
              <Button onClick={() => { setEditingReq(null); setReqForm(EMPTY_REQ); setReqModal(true); }} className="bg-amber-400 hover:bg-amber-500 text-[#0f1b4d] font-semibold shrink-0">
                <Plus className="w-4 h-4 mr-1" /> Hujjat qo'shish
              </Button>
            </div>
            {reqsLoading ? <div className="py-8 text-center text-slate-500">Yuklanmoqda...</div>
              : reqs.length === 0 ? <div className="py-8 text-center text-slate-500">Ma'lumot yo'q</div>
                : <div className="space-y-3">
                  {reqs.map((r, idx) => (
                    <div key={r.id} className="bg-[#0c1428] border border-white/10 rounded-xl p-4 flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1 pt-0.5">
                        <GripVertical className="w-4 h-4 text-slate-600" />
                        <span className="text-xs font-bold text-slate-500">#{idx + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">{r.text.uz}</p>
                        {r.text.en && <p className="text-xs text-slate-500 mt-0.5">{r.text.en}</p>}
                      </div>
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <Button size="icon" variant="ghost" disabled={idx === 0} onClick={() => reorderReq(idx, -1)} className="w-7 h-7 text-slate-400 hover:text-amber-400"><ChevronUp className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" disabled={idx === reqs.length - 1} onClick={() => reorderReq(idx, 1)} className="w-7 h-7 text-slate-400 hover:text-amber-400"><ChevronDown className="w-3.5 h-3.5" /></Button>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => { setEditingReq(r); setReqForm({ text: r.text }); setReqModal(true); }} className="w-7 h-7 hover:bg-amber-400/10 hover:text-amber-400 text-slate-400"><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteReqId(r.id)} className="w-7 h-7 hover:bg-red-500/10 hover:text-red-400 text-slate-400"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                  ))}
                </div>}
          </>
        )}

        {/* ── Dates Tab ── */}
        {tab === "dates" && (
          <>
            <div className="flex items-center justify-between gap-3">
              <p className="text-slate-400 text-sm">2026-yil muhim sanalarini boshqaring</p>
              <Button onClick={() => { setEditingDate(null); setDateForm(EMPTY_DATE); setDateModal(true); }} className="bg-amber-400 hover:bg-amber-500 text-[#0f1b4d] font-semibold shrink-0">
                <Plus className="w-4 h-4 mr-1" /> Sana qo'shish
              </Button>
            </div>
            {datesLoading ? <div className="py-8 text-center text-slate-500">Yuklanmoqda...</div>
              : dates.length === 0 ? <div className="py-8 text-center text-slate-500">Ma'lumot yo'q</div>
                : <div className="space-y-3">
                  {dates.map((d, idx) => (
                    <div key={d.id} className="bg-[#0c1428] border border-white/10 rounded-xl p-4 flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1 pt-0.5">
                        <GripVertical className="w-4 h-4 text-slate-600" />
                        <span className="text-xs font-bold text-slate-500">#{idx + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-amber-400">{d.date}</p>
                        <p className="text-sm text-white mt-0.5">{d.event.uz}</p>
                        {d.event.en && <p className="text-xs text-slate-500 mt-0.5">{d.event.en}</p>}
                      </div>
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <Button size="icon" variant="ghost" disabled={idx === 0} onClick={() => reorderDate(idx, -1)} className="w-7 h-7 text-slate-400 hover:text-amber-400"><ChevronUp className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" disabled={idx === dates.length - 1} onClick={() => reorderDate(idx, 1)} className="w-7 h-7 text-slate-400 hover:text-amber-400"><ChevronDown className="w-3.5 h-3.5" /></Button>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => { setEditingDate(d); setDateForm({ date: d.date, event: d.event }); setDateModal(true); }} className="w-7 h-7 hover:bg-amber-400/10 hover:text-amber-400 text-slate-400"><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteDateId(d.id)} className="w-7 h-7 hover:bg-red-500/10 hover:text-red-400 text-slate-400"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                  ))}
                </div>}
          </>
        )}
      </div>

      {/* Stage Modal */}
      <Dialog open={stageModal} onOpenChange={setStageModal}>
        <DialogContent className="bg-[#0c1428] border-white/10 text-white max-w-lg">
          <DialogHeader><DialogTitle>{editingStage ? "Bosqichni tahrirlash" : "Yangi bosqich"}</DialogTitle></DialogHeader>
          <form onSubmit={saveStage} className="space-y-4 pt-2">
            <LangInput label="Bosqich nomi" value={stageForm.name} onChange={(v) => setStageForm({ ...stageForm, name: v })} required />
            <LangInput label="Tavsif" value={stageForm.description} onChange={(v) => setStageForm({ ...stageForm, description: v })} multiline />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-sm text-slate-300">Muddat</label><Input type="date" value={stageForm.deadline} onChange={(e) => setStageForm({ ...stageForm, deadline: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
              <div className="space-y-1"><label className="text-sm text-slate-300">Holat</label>
                <Select value={stageForm.status} onValueChange={(v) => setStageForm({ ...stageForm, status: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0c1428] border-white/10 text-white">{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="ghost" onClick={() => setStageModal(false)} className="text-slate-400">Bekor</Button>
              <Button type="submit" disabled={stageSaving} className="bg-amber-400 hover:bg-amber-500 text-[#0f1b4d] font-semibold">{stageSaving ? "Saqlanmoqda..." : "Saqlash"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Requirement Modal */}
      <Dialog open={reqModal} onOpenChange={setReqModal}>
        <DialogContent className="bg-[#0c1428] border-white/10 text-white max-w-lg">
          <DialogHeader><DialogTitle>{editingReq ? "Hujjatni tahrirlash" : "Yangi hujjat"}</DialogTitle></DialogHeader>
          <form onSubmit={saveReq} className="space-y-4 pt-2">
            <LangInput label="Hujjat nomi" value={reqForm.text} onChange={(v) => setReqForm({ text: v })} required multiline />
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="ghost" onClick={() => setReqModal(false)} className="text-slate-400">Bekor</Button>
              <Button type="submit" disabled={reqSaving} className="bg-amber-400 hover:bg-amber-500 text-[#0f1b4d] font-semibold">{reqSaving ? "Saqlanmoqda..." : "Saqlash"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Date Modal */}
      <Dialog open={dateModal} onOpenChange={setDateModal}>
        <DialogContent className="bg-[#0c1428] border-white/10 text-white max-w-lg">
          <DialogHeader><DialogTitle>{editingDate ? "Sanani tahrirlash" : "Yangi sana"}</DialogTitle></DialogHeader>
          <form onSubmit={saveDate} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-sm text-slate-300">Sana (masalan: 1-may — 31-may)</label>
              <Input
                value={dateForm.date}
                onChange={(e) => setDateForm({ ...dateForm, date: e.target.value })}
                placeholder="1-may — 31-may"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                required
              />
            </div>
            <LangInput label="Tadbir nomi" value={dateForm.event} onChange={(v) => setDateForm({ ...dateForm, event: v })} required multiline />
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="ghost" onClick={() => setDateModal(false)} className="text-slate-400">Bekor</Button>
              <Button type="submit" disabled={dateSaving} className="bg-amber-400 hover:bg-amber-500 text-[#0f1b4d] font-semibold">{dateSaving ? "Saqlanmoqda..." : "Saqlash"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteStageId} onOpenChange={(v) => !v && setDeleteStageId(null)} onConfirm={removeStage} />
      <ConfirmDialog open={!!deleteReqId} onOpenChange={(v) => !v && setDeleteReqId(null)} onConfirm={removeReq} />
      <ConfirmDialog open={!!deleteDateId} onOpenChange={(v) => !v && setDeleteDateId(null)} onConfirm={removeDate} />
    </AdminLayout>
  );
}

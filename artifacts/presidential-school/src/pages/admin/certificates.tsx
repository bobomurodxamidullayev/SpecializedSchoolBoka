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
import { Plus, Pencil, Trash2, Search, Minus, Save, BookOpen, Globe, Calculator } from "lucide-react";

type LangObj = { uz: string; en: string; ru: string };

interface SubjectGrade { grade: string; count: number }
interface SubjectResult { id: string; name: string; iconKey: string; iconBg: string; iconColor: string; grades: SubjectGrade[] }
interface EnglishLevel { level: string; count: number }
interface GrowthRow { year: string; count: number }
interface EnglishCerts { levels: EnglishLevel[]; growthData: GrowthRow[] }
interface IntlCert { id: string; name: LangObj; subject: string; level: string; quantity: number; year: number }

const GRADES = ["A+", "A", "B+", "B", "C+", "C"];
const ICON_KEYS = ["Calculator", "BookOpen", "BookMarked", "FlaskConical", "Dna", "Zap", "Languages", "Globe", "Award", "GraduationCap", "FileCheck", "Scroll", "MessageCircle"];
const COLOR_PRESETS = [
  { label: "Ko'k", iconBg: "bg-blue-100 dark:bg-blue-900/40", iconColor: "text-blue-600 dark:text-blue-400" },
  { label: "Qizil", iconBg: "bg-red-100 dark:bg-red-900/40", iconColor: "text-red-600 dark:text-red-400" },
  { label: "Yashil", iconBg: "bg-emerald-100 dark:bg-emerald-900/40", iconColor: "text-emerald-600 dark:text-emerald-400" },
  { label: "Binafsha", iconBg: "bg-purple-100 dark:bg-purple-900/40", iconColor: "text-purple-600 dark:text-purple-400" },
  { label: "Moviy", iconBg: "bg-teal-100 dark:bg-teal-900/40", iconColor: "text-teal-600 dark:text-teal-400" },
  { label: "To'q sariq", iconBg: "bg-orange-100 dark:bg-orange-900/40", iconColor: "text-orange-600 dark:text-orange-400" },
  { label: "Sariq", iconBg: "bg-yellow-100 dark:bg-yellow-900/40", iconColor: "text-yellow-600 dark:text-yellow-400" },
  { label: "Indigo", iconBg: "bg-indigo-100 dark:bg-indigo-900/40", iconColor: "text-indigo-600 dark:text-indigo-400" },
];
const EMPTY_SUBJECT: Omit<SubjectResult, "id"> = { name: "", iconKey: "Calculator", iconBg: "bg-blue-100 dark:bg-blue-900/40", iconColor: "text-blue-600 dark:text-blue-400", grades: GRADES.map((g) => ({ grade: g, count: 0 })) };
const EMPTY_INTL: Omit<IntlCert, "id"> = { name: { uz: "", en: "", ru: "" }, subject: "", level: "International", quantity: 0, year: new Date().getFullYear() };

type Tab = "subjects" | "english" | "international";

export default function AdminCertificates() {
  const { api } = useAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("subjects");

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["cms", "certificates"] });
    queryClient.invalidateQueries({ queryKey: ["cms", "subject-results"] });
    queryClient.invalidateQueries({ queryKey: ["cms", "english-certs"] });
  };

  /* ───── Subject Results state ───── */
  const [subjects, setSubjects] = useState<SubjectResult[]>([]);
  const [subjLoading, setSubjLoading] = useState(true);
  const [subjModal, setSubjModal] = useState(false);
  const [editingSubj, setEditingSubj] = useState<SubjectResult | null>(null);
  const [subjForm, setSubjForm] = useState<Omit<SubjectResult, "id">>(EMPTY_SUBJECT);
  const [subjSaving, setSubjSaving] = useState(false);
  const [subjDeleteId, setSubjDeleteId] = useState<string | null>(null);

  const loadSubjects = () => {
    api<{ ok: boolean; data: SubjectResult[] }>("/subject-results")
      .then((d) => setSubjects(d.data ?? []))
      .catch(() => {})
      .finally(() => setSubjLoading(false));
  };
  useEffect(() => { loadSubjects(); }, []);

  const openAddSubj = () => { setEditingSubj(null); setSubjForm(EMPTY_SUBJECT); setSubjModal(true); };
  const openEditSubj = (s: SubjectResult) => { setEditingSubj(s); setSubjForm({ name: s.name, iconKey: s.iconKey, iconBg: s.iconBg, iconColor: s.iconColor, grades: [...s.grades.map((g) => ({ ...g }))] }); setSubjModal(true); };

  const saveSubj = async (e: React.FormEvent) => {
    e.preventDefault(); setSubjSaving(true);
    try {
      if (editingSubj) await api(`/subject-results/${editingSubj.id}`, { method: "PUT", body: JSON.stringify(subjForm) });
      else await api("/subject-results", { method: "POST", body: JSON.stringify(subjForm) });
      toast({ title: editingSubj ? "Yangilandi" : "Qo'shildi" }); setSubjModal(false); loadSubjects(); invalidate();
    } catch (err) { toast({ title: "Xato", description: (err as Error).message, variant: "destructive" }); }
    finally { setSubjSaving(false); }
  };

  const deleteSubj = async () => {
    if (!subjDeleteId) return;
    try { await api(`/subject-results/${subjDeleteId}`, { method: "DELETE" }); toast({ title: "O'chirildi" }); setSubjDeleteId(null); loadSubjects(); invalidate(); }
    catch (err) { toast({ title: "Xato", description: (err as Error).message, variant: "destructive" }); }
  };

  /* ───── English Certs state ───── */
  const [engData, setEngData] = useState<EnglishCerts>({ levels: [{ level: "B1", count: 0 }, { level: "B2", count: 0 }, { level: "C1", count: 0 }], growthData: [] });
  const [engLoading, setEngLoading] = useState(true);
  const [engSaving, setEngSaving] = useState(false);
  const [newGrowthYear, setNewGrowthYear] = useState("");
  const [newGrowthCount, setNewGrowthCount] = useState("");

  const loadEng = () => {
    api<{ ok: boolean; data: EnglishCerts }>("/english-certs")
      .then((d) => setEngData(d.data))
      .catch(() => {})
      .finally(() => setEngLoading(false));
  };
  useEffect(() => { loadEng(); }, []);

  const saveEng = async () => {
    setEngSaving(true);
    try {
      await api("/english-certs", { method: "PUT", body: JSON.stringify(engData) });
      toast({ title: "Saqlandi" }); invalidate();
    } catch (err) { toast({ title: "Xato", description: (err as Error).message, variant: "destructive" }); }
    finally { setEngSaving(false); }
  };

  const updateEngLevel = (idx: number, count: number) => {
    setEngData((prev) => { const levels = [...prev.levels]; levels[idx] = { ...levels[idx], count }; return { ...prev, levels }; });
  };

  const addGrowthRow = () => {
    if (!newGrowthYear.trim()) return;
    setEngData((prev) => ({ ...prev, growthData: [...prev.growthData, { year: newGrowthYear.trim(), count: Number(newGrowthCount) || 0 }] }));
    setNewGrowthYear(""); setNewGrowthCount("");
  };

  const updateGrowthRow = (idx: number, field: "year" | "count", val: string) => {
    setEngData((prev) => { const growthData = [...prev.growthData]; growthData[idx] = { ...growthData[idx], [field]: field === "count" ? Number(val) : val }; return { ...prev, growthData }; });
  };

  const removeGrowthRow = (idx: number) => {
    setEngData((prev) => ({ ...prev, growthData: prev.growthData.filter((_, i) => i !== idx) }));
  };

  /* ───── International (Foreign) certs state ───── */
  const [intlItems, setIntlItems] = useState<IntlCert[]>([]);
  const [intlLoading, setIntlLoading] = useState(true);
  const [intlSearch, setIntlSearch] = useState("");
  const [intlModal, setIntlModal] = useState(false);
  const [editingIntl, setEditingIntl] = useState<IntlCert | null>(null);
  const [intlForm, setIntlForm] = useState<Omit<IntlCert, "id">>(EMPTY_INTL);
  const [intlSaving, setIntlSaving] = useState(false);
  const [intlDeleteId, setIntlDeleteId] = useState<string | null>(null);

  const loadIntl = () => {
    api<{ ok: boolean; data: IntlCert[] }>("/certificates")
      .then((d) => setIntlItems(d.data ?? []))
      .catch(() => {})
      .finally(() => setIntlLoading(false));
  };
  useEffect(() => { loadIntl(); }, []);

  const openAddIntl = () => { setEditingIntl(null); setIntlForm(EMPTY_INTL); setIntlModal(true); };
  const openEditIntl = (c: IntlCert) => { setEditingIntl(c); setIntlForm({ ...c }); setIntlModal(true); };

  const saveIntl = async (e: React.FormEvent) => {
    e.preventDefault(); setIntlSaving(true);
    try {
      if (editingIntl) await api(`/certificates/${editingIntl.id}`, { method: "PUT", body: JSON.stringify(intlForm) });
      else await api("/certificates", { method: "POST", body: JSON.stringify(intlForm) });
      toast({ title: editingIntl ? "Yangilandi" : "Qo'shildi" }); setIntlModal(false); loadIntl(); invalidate();
    } catch (err) { toast({ title: "Xato", description: (err as Error).message, variant: "destructive" }); }
    finally { setIntlSaving(false); }
  };

  const adjustIntlQty = async (id: string, delta: number) => {
    try {
      await api(`/certificates/${id}/quantity`, { method: "PATCH", body: JSON.stringify({ delta }) });
      setIntlItems((prev) => prev.map((c) => c.id === id ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c));
    } catch (err) { toast({ title: "Xato", description: (err as Error).message, variant: "destructive" }); }
  };

  const deleteIntl = async () => {
    if (!intlDeleteId) return;
    try { await api(`/certificates/${intlDeleteId}`, { method: "DELETE" }); toast({ title: "O'chirildi" }); setIntlDeleteId(null); loadIntl(); invalidate(); }
    catch (err) { toast({ title: "Xato", description: (err as Error).message, variant: "destructive" }); }
  };

  const filteredIntl = intlItems.filter((c) => c.name.uz.toLowerCase().includes(intlSearch.toLowerCase()) || c.subject.toLowerCase().includes(intlSearch.toLowerCase()));

  const gradeColor = (g: string) => {
    if (g === "A+" || g === "A") return "bg-green-500/20 text-green-400";
    if (g === "B+" || g === "B") return "bg-blue-500/20 text-blue-400";
    return "bg-amber-500/20 text-amber-400";
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">Sertifikatlar</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit">
          {([
            { key: "subjects", icon: BookOpen, label: "Fan natijalari" },
            { key: "english", icon: Calculator, label: "Ingliz tili" },
            { key: "international", icon: Globe, label: "Xorijiy sertifikatlar" },
          ] as const).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === key ? "bg-amber-400 text-[#0f1b4d]" : "text-slate-400 hover:text-white"}`}
            >
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* ── TAB 1: Subject Results ── */}
        {tab === "subjects" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-slate-400 text-sm">{subjects.length} ta fan</p>
              <Button onClick={openAddSubj} className="bg-amber-400 hover:bg-amber-500 text-[#0f1b4d] font-semibold"><Plus className="w-4 h-4 mr-1" /> Fan qo'shish</Button>
            </div>

            {subjLoading ? (
              <div className="py-10 text-center text-slate-500">Yuklanmoqda...</div>
            ) : subjects.length === 0 ? (
              <div className="py-10 text-center text-slate-500">Ma'lumot yo'q</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjects.map((subj) => (
                  <div key={subj.id} className="bg-[#0c1428] border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${subj.iconBg}`}>
                          <span className={subj.iconColor}>{subj.iconKey.slice(0, 2)}</span>
                        </div>
                        <span className="font-semibold text-white">{subj.name}</span>
                        <span className="text-xs text-slate-500">{subj.grades.reduce((a, g) => a + g.count, 0)} ta</span>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEditSubj(subj)} className="w-7 h-7 hover:bg-amber-400/10 hover:text-amber-400 text-slate-400"><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setSubjDeleteId(subj.id)} className="w-7 h-7 hover:bg-red-500/10 hover:text-red-400 text-slate-400"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-6 gap-1.5">
                      {subj.grades.map((g) => (
                        <div key={g.grade} className={`rounded-lg p-1.5 text-center ${gradeColor(g.grade)}`}>
                          <div className="text-[10px] font-bold">{g.grade}</div>
                          <div className="text-base font-bold">{g.count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: English Certs ── */}
        {tab === "english" && (
          <div className="space-y-6">
            {engLoading ? (
              <div className="py-10 text-center text-slate-500">Yuklanmoqda...</div>
            ) : (
              <>
                <div className="bg-[#0c1428] border border-white/10 rounded-xl p-5 space-y-4">
                  <h3 className="text-white font-semibold">Ingliz tili darajalari (Milliy sertifikat)</h3>
                  <div className="flex flex-wrap gap-4">
                    {engData.levels.map((lvl, i) => (
                      <div key={lvl.level} className="flex flex-col gap-1.5 min-w-[120px]">
                        <label className="text-sm text-slate-300 font-semibold">{lvl.level} daraja</label>
                        <Input
                          type="number"
                          min={0}
                          value={lvl.count}
                          onChange={(e) => updateEngLevel(i, Number(e.target.value))}
                          className="bg-white/5 border-white/10 text-white w-28"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0c1428] border border-white/10 rounded-xl p-5 space-y-4">
                  <div>
                    <h3 className="text-white font-semibold">Yillik jami sertifikat soni (grafik uchun)</h3>
                    <p className="text-slate-400 text-xs mt-1">Har bir yil uchun <span className="text-amber-400 font-semibold">barcha</span> sertifikatlar yig'indisini kiriting: fan natijalari + ingliz tili + xorijiy sertifikatlar</p>
                  </div>
                  <div className="space-y-2">
                    {engData.growthData.map((row, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Input
                          value={row.year}
                          onChange={(e) => updateGrowthRow(i, "year", e.target.value)}
                          placeholder="Yil"
                          className="bg-white/5 border-white/10 text-white w-24"
                        />
                        <Input
                          type="number"
                          min={0}
                          value={row.count}
                          onChange={(e) => updateGrowthRow(i, "count", e.target.value)}
                          placeholder="Soni"
                          className="bg-white/5 border-white/10 text-white w-28"
                        />
                        <Button size="icon" variant="ghost" onClick={() => removeGrowthRow(i)} className="w-7 h-7 hover:bg-red-500/10 hover:text-red-400 text-slate-400"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    ))}
                    <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                      <Input
                        value={newGrowthYear}
                        onChange={(e) => setNewGrowthYear(e.target.value)}
                        placeholder="Yangi yil..."
                        className="bg-white/5 border-white/10 text-white w-24"
                      />
                      <Input
                        type="number"
                        min={0}
                        value={newGrowthCount}
                        onChange={(e) => setNewGrowthCount(e.target.value)}
                        placeholder="Soni"
                        className="bg-white/5 border-white/10 text-white w-28"
                      />
                      <Button onClick={addGrowthRow} variant="ghost" className="text-amber-400 hover:bg-amber-400/10"><Plus className="w-4 h-4 mr-1" />Qo'shish</Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={saveEng} disabled={engSaving} className="bg-amber-400 hover:bg-amber-500 text-[#0f1b4d] font-semibold">
                    <Save className="w-4 h-4 mr-1" />{engSaving ? "Saqlanmoqda..." : "Saqlash"}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── TAB 3: International / Foreign Certs ── */}
        {tab === "international" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-slate-400 text-sm">{intlItems.length} ta sertifikat</p>
              <Button onClick={openAddIntl} className="bg-amber-400 hover:bg-amber-500 text-[#0f1b4d] font-semibold"><Plus className="w-4 h-4 mr-1" /> Qo'shish</Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input value={intlSearch} onChange={(e) => setIntlSearch(e.target.value)} placeholder="Qidirish..." className="pl-9 bg-white/5 border-white/10 text-white" />
            </div>

            <div className="bg-[#0c1428] border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Nomi</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Fan / Daraja</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Soni</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium hidden lg:table-cell">Yil</th>
                  <th className="px-4 py-3 w-24"></th>
                </tr></thead>
                <tbody className="divide-y divide-white/5">
                  {intlLoading ? <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Yuklanmoqda...</td></tr>
                    : filteredIntl.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Ma'lumot yo'q</td></tr>
                    : filteredIntl.map((c) => (
                      <tr key={c.id} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-slate-200 font-medium">{c.name.uz}</td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="text-slate-300">{c.subject}</div>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-400">{c.level}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => adjustIntlQty(c.id, -1)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 text-slate-400"><Minus className="w-3 h-3" /></button>
                            <span className="text-white font-semibold w-8 text-center">{c.quantity}</span>
                            <button onClick={() => adjustIntlQty(c.id, 1)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 text-slate-400"><Plus className="w-3 h-3" /></button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-400 hidden lg:table-cell">{c.year}</td>
                        <td className="px-4 py-3"><div className="flex gap-1 justify-end">
                          <Button size="icon" variant="ghost" onClick={() => openEditIntl(c)} className="w-7 h-7 hover:bg-amber-400/10 hover:text-amber-400 text-slate-400"><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => setIntlDeleteId(c.id)} className="w-7 h-7 hover:bg-red-500/10 hover:text-red-400 text-slate-400"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Subject Modal ── */}
      <Dialog open={subjModal} onOpenChange={setSubjModal}>
        <DialogContent className="bg-[#0c1428] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingSubj ? "Fanni tahrirlash" : "Yangi fan"}</DialogTitle></DialogHeader>
          <form onSubmit={saveSubj} className="space-y-4 pt-2">
            <div className="space-y-1"><label className="text-sm text-slate-300">Fan nomi</label>
              <Input value={subjForm.name} onChange={(e) => setSubjForm({ ...subjForm, name: e.target.value })} className="bg-white/5 border-white/10 text-white" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-sm text-slate-300">Belgi (icon)</label>
                <Select value={subjForm.iconKey} onValueChange={(v) => setSubjForm({ ...subjForm, iconKey: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0c1428] border-white/10 text-white">
                    {ICON_KEYS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><label className="text-sm text-slate-300">Rang</label>
                <Select value={subjForm.iconBg} onValueChange={(v) => { const p = COLOR_PRESETS.find((c) => c.iconBg === v)!; setSubjForm({ ...subjForm, iconBg: p.iconBg, iconColor: p.iconColor }); }}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0c1428] border-white/10 text-white">
                    {COLOR_PRESETS.map((p) => <SelectItem key={p.iconBg} value={p.iconBg}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Baholar bo'yicha natijalar</label>
              <div className="grid grid-cols-3 gap-2">
                {subjForm.grades.map((g, i) => (
                  <div key={g.grade} className={`rounded-lg p-2 text-center ${gradeColor(g.grade)}`}>
                    <div className="text-xs font-bold mb-1">{g.grade}</div>
                    <Input
                      type="number"
                      min={0}
                      value={g.count}
                      onChange={(e) => { const grades = [...subjForm.grades]; grades[i] = { ...grades[i], count: Number(e.target.value) }; setSubjForm({ ...subjForm, grades }); }}
                      className="bg-black/20 border-white/10 text-white text-center h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="ghost" onClick={() => setSubjModal(false)} className="text-slate-400">Bekor</Button>
              <Button type="submit" disabled={subjSaving} className="bg-amber-400 hover:bg-amber-500 text-[#0f1b4d] font-semibold">{subjSaving ? "Saqlanmoqda..." : "Saqlash"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── International Cert Modal ── */}
      <Dialog open={intlModal} onOpenChange={setIntlModal}>
        <DialogContent className="bg-[#0c1428] border-white/10 text-white max-w-md">
          <DialogHeader><DialogTitle>{editingIntl ? "Tahrirlash" : "Yangi xorijiy sertifikat"}</DialogTitle></DialogHeader>
          <form onSubmit={saveIntl} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-sm text-slate-300">Nomi (UZ)</label>
              <Input value={intlForm.name.uz} onChange={(e) => setIntlForm({ ...intlForm, name: { ...intlForm.name, uz: e.target.value } })} className="bg-white/5 border-white/10 text-white" required />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-300">Nomi (EN)</label>
              <Input value={intlForm.name.en} onChange={(e) => setIntlForm({ ...intlForm, name: { ...intlForm.name, en: e.target.value } })} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-300">Nomi (RU)</label>
              <Input value={intlForm.name.ru} onChange={(e) => setIntlForm({ ...intlForm, name: { ...intlForm.name, ru: e.target.value } })} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-sm text-slate-300">Fan / Daraja (masalan: IELTS 7.0+)</label>
                <Input value={intlForm.subject} onChange={(e) => setIntlForm({ ...intlForm, subject: e.target.value })} className="bg-white/5 border-white/10 text-white" />
              </div>
              <div className="space-y-1"><label className="text-sm text-slate-300">Tur</label>
                <Select value={intlForm.level} onValueChange={(v) => setIntlForm({ ...intlForm, level: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0c1428] border-white/10 text-white">
                    <SelectItem value="International">International</SelectItem>
                    <SelectItem value="National">National</SelectItem>
                    <SelectItem value="Regional">Regional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-sm text-slate-300">Soni</label>
                <Input type="number" min={0} value={intlForm.quantity} onChange={(e) => setIntlForm({ ...intlForm, quantity: +e.target.value })} className="bg-white/5 border-white/10 text-white" />
              </div>
              <div className="space-y-1"><label className="text-sm text-slate-300">Yil</label>
                <Input type="number" value={intlForm.year} onChange={(e) => setIntlForm({ ...intlForm, year: +e.target.value })} className="bg-white/5 border-white/10 text-white" />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="ghost" onClick={() => setIntlModal(false)} className="text-slate-400">Bekor</Button>
              <Button type="submit" disabled={intlSaving} className="bg-amber-400 hover:bg-amber-500 text-[#0f1b4d] font-semibold">{intlSaving ? "Saqlanmoqda..." : "Saqlash"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!subjDeleteId} onOpenChange={(v) => !v && setSubjDeleteId(null)} onConfirm={deleteSubj} />
      <ConfirmDialog open={!!intlDeleteId} onOpenChange={(v) => !v && setIntlDeleteId(null)} onConfirm={deleteIntl} />
    </AdminLayout>
  );
}

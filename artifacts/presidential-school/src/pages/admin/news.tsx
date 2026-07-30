import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { LangInput } from "@/components/admin/LangInput";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Star, Video, Image as ImageIcon } from "lucide-react";
import { getYouTubeEmbedUrl } from "@/lib/cms";

type LangObj = { uz: string; en: string; ru: string };
interface NewsItem { id: string; title: LangObj; slug: string; content: LangObj; category: string; author: string; readTime: string; publishDate: string; coverImage: string; status: string; featured: boolean; mediaType?: "image" | "video"; videoUrl?: string; }
const CATS = ["Achievements", "Facilities", "Events", "Academic", "Other"];
const EMPTY: Omit<NewsItem, "id"> = { title: { uz: "", en: "", ru: "" }, slug: "", content: { uz: "", en: "", ru: "" }, category: "Achievements", author: "", readTime: "3", publishDate: new Date().toISOString().slice(0, 10), coverImage: "", status: "published", featured: false, mediaType: "image", videoUrl: "" };

const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 80);

const STATUS_COLOR: Record<string, string> = { published: "bg-green-500/20 text-green-400", draft: "bg-slate-500/20 text-slate-400" };

export default function AdminNews() {
  const { api } = useAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [form, setForm] = useState<Omit<NewsItem, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () => { api<{ ok: boolean; data: NewsItem[] }>("/news").then((d) => setItems(d.data)).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  const openAdd = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (n: NewsItem) => { setEditing(n); setForm({ ...n }); setModalOpen(true); };

  const handleTitleChange = (v: LangObj) => {
    setForm((f) => ({ ...f, title: v, slug: f.slug || slugify(v.en || v.uz) }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setSaving(true);
    let finalForm = { ...form };
    if (finalForm.mediaType === "video" && finalForm.videoUrl) {
      const yt = getYouTubeEmbedUrl(finalForm.videoUrl);
      if (yt && !finalForm.coverImage) {
        finalForm.coverImage = yt.thumbnailUrl;
      }
    }
    try {
      if (editing) await api(`/news/${editing.id}`, { method: "PUT", body: JSON.stringify(finalForm) });
      else await api("/news", { method: "POST", body: JSON.stringify(finalForm) });
      toast({ title: editing ? "Yangilandi" : "Qo'shildi" }); setModalOpen(false); load();
      queryClient.invalidateQueries({ queryKey: ["cms", "news"] });
    } catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    if (!deleteId) return;
    try { await api(`/news/${deleteId}`, { method: "DELETE" }); toast({ title: "O'chirildi" }); setDeleteId(null); load(); queryClient.invalidateQueries({ queryKey: ["cms", "news"] }); }
    catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
  };

  const filtered = items.filter((n) => n.title.uz.toLowerCase().includes(search.toLowerCase()) || n.title.en.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div><h1 className="text-xl font-bold text-white">Yangiliklar</h1><p className="text-slate-400 text-sm">{items.length} ta maqola</p></div>
          <Button onClick={openAdd} className="bg-amber-400 hover:bg-amber-500 text-[#0f1b4d] font-semibold"><Plus className="w-4 h-4 mr-1" /> Yangi maqola</Button>
        </div>
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish..." className="pl-9 bg-white/5 border-white/10 text-white" /></div>

        <div className="bg-[#0c1428] border border-white/10 rounded-xl overflow-hidden">
          {loading ? <div className="p-8 text-center text-slate-500">Yuklanmoqda...</div>
            : filtered.length === 0 ? <div className="p-8 text-center text-slate-500">Ma'lumot yo'q</div>
              : <div className="divide-y divide-white/5">
                {filtered.map((n) => (
                  <div key={n.id} className="flex items-center gap-3 px-5 py-3">
                    {n.coverImage ? <img src={n.coverImage} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" /> : <div className="w-12 h-12 rounded-lg bg-white/5 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-medium text-slate-200 truncate">{n.title.en || n.title.uz}</p>
                        {n.mediaType === "video" && <Video className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                        {n.featured && <Star className="w-3 h-3 text-amber-400 shrink-0" fill="currentColor" />}
                      </div>
                      <p className="text-xs text-slate-500">{n.category} · {n.publishDate} · {n.author}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLOR[n.status] || "bg-slate-500/20 text-slate-400"}`}>{n.status}</span>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(n)} className="w-7 h-7 hover:bg-amber-400/10 hover:text-amber-400 text-slate-400"><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteId(n.id)} className="w-7 h-7 hover:bg-red-500/10 hover:text-red-400 text-slate-400"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </div>}
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#0c1428] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Maqolani tahrirlash" : "Yangi maqola"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4 pt-2">
            <LangInput label="Sarlavha" value={form.title} onChange={handleTitleChange} required />
            <div className="space-y-1"><label className="text-sm text-slate-300">Slug (URL)</label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} className="bg-white/5 border-white/10 text-white font-mono text-sm" />
            </div>
            <LangInput label="Matn" value={form.content} onChange={(v) => setForm({ ...form, content: v })} multiline rows={5} />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-sm text-slate-300">Kategoriya</label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0c1428] border-white/10 text-white">{CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select></div>
              <div className="space-y-1"><label className="text-sm text-slate-300">Holat</label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0c1428] border-white/10 text-white">
                    <SelectItem value="draft">Qoralama</SelectItem><SelectItem value="published">Nashr etilgan</SelectItem>
                  </SelectContent>
                </Select></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1"><label className="text-sm text-slate-300">Muallif</label><Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
              <div className="space-y-1"><label className="text-sm text-slate-300">O'qish vaqti (min)</label><Input value={form.readTime} onChange={(e) => setForm({ ...form, readTime: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
              <div className="space-y-1"><label className="text-sm text-slate-300">Sana</label><Input type="date" value={form.publishDate} onChange={(e) => setForm({ ...form, publishDate: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4" />
              <label htmlFor="featured" className="text-sm text-slate-300">Asosiy yangilik (Featured)</label>
            </div>
            <div className="space-y-1"><label className="text-sm text-slate-300">Media turi</label>
              <Select value={form.mediaType || "image"} onValueChange={(v: "image" | "video") => setForm({ ...form, mediaType: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#0c1428] border-white/10 text-white">
                  <SelectItem value="image"><div className="flex items-center"><ImageIcon className="w-4 h-4 mr-2"/> Rasm (Image)</div></SelectItem>
                  <SelectItem value="video"><div className="flex items-center"><Video className="w-4 h-4 mr-2"/> YouTube Video</div></SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {form.mediaType === "video" && (
              <div className="space-y-2 p-3 bg-white/5 border border-white/10 rounded-lg">
                <label className="text-sm text-slate-300">YouTube Video Linki</label>
                <Input placeholder="https://youtube.com/watch?v=..." value={form.videoUrl || ""} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                {form.videoUrl && getYouTubeEmbedUrl(form.videoUrl) && (
                  <div className="mt-2 aspect-video rounded-lg overflow-hidden border border-white/10">
                    <iframe src={getYouTubeEmbedUrl(form.videoUrl)!.embedUrl} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1"><label className="text-sm text-slate-300">Muqova rasmi (Thumbnail)</label><ImageUpload value={form.coverImage} onChange={(v) => setForm({ ...form, coverImage: v })} /></div>
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

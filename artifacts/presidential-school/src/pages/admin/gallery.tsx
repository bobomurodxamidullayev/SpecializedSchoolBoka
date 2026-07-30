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
import { Plus, Pencil, Trash2, Search, X, Upload, Video, Image as ImageIcon } from "lucide-react";
import { getYouTubeEmbedUrl } from "@/lib/cms";

type LangObj = { uz: string; en: string; ru: string };
interface GalleryItem { id: string; title: LangObj; description: LangObj; category: string; date: string; images: string[]; mediaType?: "image" | "video"; videoUrl?: string; }
const CATS = ["Events", "Lessons", "Competitions", "School Life"];
const EMPTY: Omit<GalleryItem, "id"> = { title: { uz: "", en: "", ru: "" }, description: { uz: "", en: "", ru: "" }, category: "Events", date: new Date().toISOString().slice(0, 10), images: [], mediaType: "image", videoUrl: "" };

export default function AdminGallery() {
  const { api } = useAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState<Omit<GalleryItem, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = () => { api<{ ok: boolean; data: GalleryItem[] }>("/gallery").then((d) => setItems((d.data ?? []).map((g) => ({ ...g, images: Array.isArray(g.images) ? g.images : [] })))).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  const openAdd = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (g: GalleryItem) => { setEditing(g); setForm({ ...g, images: [...g.images] }); setModalOpen(true); };

  const uploadImages = async (files: FileList) => {
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      const res = await fetch("/api/admin/upload/multiple", { method: "POST", credentials: "include", body: fd });
      const data = await res.json() as { ok: boolean; data?: { url: string }[] };
      if (!data.ok) throw new Error("Upload failed");
      const urls = data.data!.map((f) => f.url);
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    } catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
    finally { setUploading(false); }
  };

  const removeImg = (idx: number) => setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    let finalForm = { ...form };
    if (finalForm.mediaType === "video" && finalForm.videoUrl) {
      const yt = getYouTubeEmbedUrl(finalForm.videoUrl);
      if (yt && finalForm.images.length === 0) {
        finalForm.images = [yt.thumbnailUrl];
      }
    }
    try {
      if (editing) await api(`/gallery/${editing.id}`, { method: "PUT", body: JSON.stringify(finalForm) });
      else await api("/gallery", { method: "POST", body: JSON.stringify(finalForm) });
      toast({ title: editing ? "Yangilandi" : "Qo'shildi" }); setModalOpen(false); load();
      queryClient.invalidateQueries({ queryKey: ["cms", "gallery"] });
    } catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    if (!deleteId) return;
    try { await api(`/gallery/${deleteId}`, { method: "DELETE" }); toast({ title: "O'chirildi" }); setDeleteId(null); load(); queryClient.invalidateQueries({ queryKey: ["cms", "gallery"] }); }
    catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
  };

  const filtered = items.filter((g) => g.title.uz.toLowerCase().includes(search.toLowerCase()) || g.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div><h1 className="text-xl font-bold text-white">Galereya</h1><p className="text-slate-400 text-sm">{items.length} ta albom</p></div>
          <Button onClick={openAdd} className="bg-amber-400 hover:bg-amber-500 text-[#0f1b4d] font-semibold"><Plus className="w-4 h-4 mr-1" /> Qo'shish</Button>
        </div>
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish..." className="pl-9 bg-white/5 border-white/10 text-white" /></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? <div className="col-span-3 py-8 text-center text-slate-500">Yuklanmoqda...</div>
            : filtered.length === 0 ? <div className="col-span-3 py-8 text-center text-slate-500">Ma'lumot yo'q</div>
              : filtered.map((g) => (
                <div key={g.id} className="bg-[#0c1428] border border-white/10 rounded-xl overflow-hidden group">
                  <div className="h-36 bg-white/5 relative">
                    {g.images[0] ? <img src={g.images[0]} alt="" className="w-full h-full object-cover" />
                      : <div className="flex items-center justify-center h-full text-slate-600 text-sm">Rasm yo'q</div>}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                      <Button size="icon" onClick={() => openEdit(g)} className="w-8 h-8 bg-amber-400 hover:bg-amber-500 text-[#0f1b4d]"><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" onClick={() => setDeleteId(g.id)} className="w-8 h-8 bg-red-600 hover:bg-red-700"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <p className="text-sm font-medium text-white truncate flex-1">{g.title.uz}</p>
                      {g.mediaType === "video" && <Video className="w-4 h-4 text-blue-400 shrink-0" />}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-400">{g.category}</span>
                      <span className="text-xs text-slate-500">{g.mediaType === "video" ? "1 video" : `${g.images.length} rasm`}</span>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#0c1428] border-white/10 text-white max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Albomni tahrirlash" : "Yangi albom"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4 pt-2">
            <LangInput label="Nomi" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
            <LangInput label="Tavsif" value={form.description} onChange={(v) => setForm({ ...form, description: v })} multiline />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-sm text-slate-300">Kategoriya</label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0c1428] border-white/10 text-white">{CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select></div>
              <div className="space-y-1"><label className="text-sm text-slate-300">Sana</label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
            </div>
            
            <div className="space-y-1"><label className="text-sm text-slate-300">Media turi</label>
              <Select value={form.mediaType || "image"} onValueChange={(v: "image" | "video") => setForm({ ...form, mediaType: v, images: [] })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#0c1428] border-white/10 text-white">
                  <SelectItem value="image"><div className="flex items-center"><ImageIcon className="w-4 h-4 mr-2"/> Rasm (Image)</div></SelectItem>
                  <SelectItem value="video"><div className="flex items-center"><Video className="w-4 h-4 mr-2"/> YouTube Video</div></SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.mediaType === "video" ? (
              <div className="space-y-2 p-3 bg-white/5 border border-white/10 rounded-lg">
                <label className="text-sm text-slate-300">YouTube Video Linki</label>
                <Input placeholder="https://youtube.com/watch?v=..." value={form.videoUrl || ""} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                {form.videoUrl && getYouTubeEmbedUrl(form.videoUrl) && (
                  <div className="mt-2 aspect-video rounded-lg overflow-hidden border border-white/10">
                    <iframe src={getYouTubeEmbedUrl(form.videoUrl)!.embedUrl} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Rasmlar ({form.images.length})</label>
                {form.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {form.images.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-white/5">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImg(i)} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center hover:bg-red-600 text-white">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/20 hover:border-amber-400/50 cursor-pointer text-sm text-slate-400 hover:text-amber-400 transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                  <Upload className="w-4 h-4" />
                  {uploading ? "Yuklanmoqda..." : "Rasmlar qo'shish"}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && uploadImages(e.target.files)} />
                </label>
              </div>
            )}
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

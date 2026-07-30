import { useEffect, useState, useRef } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, Search, Trash2, Copy, Check, Image as ImageIcon } from "lucide-react";

interface MediaFile { filename: string; url: string; size: number; createdAt: string }

function fmtSize(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminMedia() {
  const { api } = useAdmin();
  const { toast } = useToast();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteFile, setDeleteFile] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = () => { api<{ ok: boolean; data: MediaFile[] }>("/media").then((d) => setFiles(d.data)).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const uploadFiles = async (fileList: FileList) => {
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(fileList).forEach((f) => fd.append("files", f));
      const res = await fetch("/api/admin/upload/multiple", { method: "POST", credentials: "include", body: fd });
      const data = await res.json() as { ok: boolean; error?: string };
      if (!data.ok) throw new Error(data.error);
      toast({ title: `${fileList.length} ta rasm yuklandi` }); load();
    } catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ""; }
  };

  const copy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(url); setTimeout(() => setCopied(null), 2000);
    toast({ title: "URL nusxalandi" });
  };

  const remove = async () => {
    if (!deleteFile) return; setDeleting(true);
    try { await api(`/media/${encodeURIComponent(deleteFile)}`, { method: "DELETE" }); toast({ title: "O'chirildi" }); setDeleteFile(null); if (selected === deleteFile) setSelected(null); load(); }
    catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
    finally { setDeleting(false); }
  };

  const filtered = files.filter((f) => f.filename.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div><h1 className="text-xl font-bold text-white">Media kutubxona</h1><p className="text-slate-400 text-sm">{files.length} ta fayl</p></div>
          <Button onClick={() => inputRef.current?.click()} disabled={uploading} className="bg-amber-400 hover:bg-amber-500 text-[#0f1b4d] font-semibold">
            <Upload className="w-4 h-4 mr-1" />{uploading ? "Yuklanmoqda..." : "Rasm yuklash"}
          </Button>
        </div>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && uploadFiles(e.target.files)} />

        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish..." className="pl-9 bg-white/5 border-white/10 text-white" /></div>

        {loading ? <div className="py-12 text-center text-slate-500">Yuklanmoqda...</div>
          : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Rasmlar yo'q. Yuklash uchun yuqoridagi tugmani bosing.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filtered.map((f) => (
                <div
                  key={f.filename}
                  onClick={() => setSelected(selected === f.filename ? null : f.filename)}
                  className={`group relative rounded-xl overflow-hidden bg-[#0c1428] border cursor-pointer transition-all ${selected === f.filename ? "border-amber-400" : "border-white/10 hover:border-white/20"}`}
                >
                  <div className="aspect-square">
                    <img src={f.url} alt={f.filename} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity">
                    <button type="button" onClick={(e) => { e.stopPropagation(); copy(f.url); }} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white">
                      {copied === f.url ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setDeleteFile(f.filename); }} className="p-1.5 bg-red-600/80 hover:bg-red-600 rounded-lg text-white">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-1.5">
                    <p className="text-xs text-slate-400 truncate">{f.filename}</p>
                    <p className="text-xs text-slate-600">{fmtSize(f.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {selected && (() => {
        const f = files.find((x) => x.filename === selected);
        if (!f) return null;
        return (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#0c1428] border border-white/20 rounded-xl p-4 flex items-center gap-4 shadow-2xl z-50 max-w-sm w-full mx-4">
            <img src={f.url} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
            <div className="flex-1 min-w-0"><p className="text-xs text-slate-200 truncate">{f.filename}</p><p className="text-xs text-slate-500">{fmtSize(f.size)}</p></div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => copy(f.url)} className="w-8 h-8 hover:bg-white/10 text-slate-400">{copied === f.url ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}</Button>
              <Button size="icon" variant="ghost" onClick={() => setDeleteFile(f.filename)} className="w-8 h-8 hover:bg-red-500/10 text-red-400"><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        );
      })()}

      <ConfirmDialog open={!!deleteFile} onOpenChange={(v) => !v && setDeleteFile(null)} onConfirm={remove} loading={deleting}
        title="Rasmni o'chirish" description={`"${deleteFile}" faylini o'chirishni tasdiqlaysizmi? Bu amalni bekor qilib bo'lmaydi.`} />
    </AdminLayout>
  );
}

import { useRef, useState } from "react";
import { Upload, X, Image } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json() as { ok: boolean; data?: { url: string }; error?: string };
      if (!data.ok) throw new Error(data.error);
      onChange(data.data!.url);
      toast({ title: "Rasm yuklandi" });
    } catch (e) {
      toast({ title: "Xato", description: (e as Error).message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="relative w-full h-40 rounded-lg overflow-hidden bg-white/5 border border-white/10">
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1 rounded-full bg-black/60 hover:bg-red-600 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="w-full h-32 rounded-lg border-2 border-dashed border-white/20 hover:border-amber-400/50 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-amber-400 transition-colors"
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          ) : (
            <>
              <Upload className="w-6 h-6" />
              <span className="text-sm">Rasm yuklash</span>
            </>
          )}
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }}
      />
      {value && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Rasm URL manzili"
          className="w-full text-xs px-3 py-2 rounded bg-white/5 border border-white/10 text-slate-300 placeholder:text-slate-600"
        />
      )}
    </div>
  );
}

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type LangObj = { uz: string; en: string; ru: string };

interface LangInputProps {
  label?: string;
  value: LangObj;
  onChange: (v: LangObj) => void;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  placeholder?: string;
}

const LANGS: { key: keyof LangObj; label: string; flag: string }[] = [
  { key: "uz", label: "O'zbekcha", flag: "🇺🇿" },
  { key: "en", label: "English", flag: "🇬🇧" },
  { key: "ru", label: "Русский", flag: "🇷🇺" },
];

export function LangInput({ label, value, onChange, multiline, rows = 3, required, placeholder }: LangInputProps) {
  const [active, setActive] = useState<keyof LangObj>("uz");

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-slate-300">
          {label}{required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="flex gap-1 mb-1">
        {LANGS.map(({ key, label: langLabel, flag }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            className={cn(
              "px-2.5 py-1 rounded text-xs font-medium transition-all",
              active === key
                ? "bg-amber-400 text-[#0f1b4d]"
                : "bg-white/5 text-slate-400 hover:bg-white/10"
            )}
          >
            {flag} {langLabel}
          </button>
        ))}
      </div>
      {multiline ? (
        <Textarea
          rows={rows}
          value={value[active] || ""}
          onChange={(e) => onChange({ ...value, [active]: e.target.value })}
          placeholder={placeholder}
          className="bg-white/5 border-white/20 text-white placeholder:text-slate-500 resize-none"
        />
      ) : (
        <Input
          value={value[active] || ""}
          onChange={(e) => onChange({ ...value, [active]: e.target.value })}
          placeholder={placeholder}
          className="bg-white/5 border-white/20 text-white placeholder:text-slate-500"
        />
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  inputClassName?: string;
}

export function EditableLabel({ value, onSave, className, inputClassName }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(value);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [editing, value]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    setEditing(false);
  };

  if (editing) {
    return (
      <span className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(false);
          }}
          className={cn(
            "px-1.5 py-0.5 border border-border rounded text-sm bg-background text-foreground outline-none focus:border-link-fg",
            inputClassName
          )}
        />
        <button onClick={commit} className="p-0.5 hover:text-link-fg transition-colors">
          <Check className="w-3 h-3" />
        </button>
        <button onClick={() => setEditing(false)} className="p-0.5 hover:text-destructive transition-colors">
          <X className="w-3 h-3" />
        </button>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1 group/edit", className)}>
      <span>{value}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setEditing(true);
        }}
        className="p-0.5 opacity-0 group-hover/edit:opacity-60 hover:!opacity-100 transition-opacity"
        title="Modifier"
      >
        <Pencil className="w-3 h-3" />
      </button>
    </span>
  );
}

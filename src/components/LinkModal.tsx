import { useState, useEffect, useRef } from "react";

interface Props {
  open: boolean;
  docName: string;
  currentUrl: string;
  onSave: (url: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

export function LinkModal({ open, docName, currentUrl, onSave, onRemove, onClose }: Props) {
  const [url, setUrl] = useState(currentUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUrl(currentUrl);
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open, currentUrl]);

  if (!open) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSave(url.trim());
    if (e.key === "Escape") onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/35" onClick={onClose} />
      <div className="relative bg-background rounded-xl p-5 w-[min(420px,90vw)] shadow-xl">
        <div className="text-sm font-medium text-foreground mb-1">Ajouter un lien au document</div>
        <div className="text-xs text-muted-foreground mb-3">{docName}</div>
        <input
          ref={inputRef}
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-muted text-foreground outline-none focus:border-link-fg transition-colors"
        />
        <div className="flex gap-2 mt-3 justify-end">
          {currentUrl && (
            <button
              onClick={onRemove}
              className="mr-auto px-4 py-1.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:opacity-85 transition-opacity"
            >
              Supprimer
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:opacity-85 transition-opacity"
          >
            Annuler
          </button>
          <button
            onClick={() => onSave(url.trim())}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-link-fg text-white hover:opacity-85 transition-opacity"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

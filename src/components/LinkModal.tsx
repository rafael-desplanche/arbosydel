import { useState, useEffect, useRef } from "react";

interface Props {
  open: boolean;
  docName: string;
  currentUrl: string;
  onSave: (url: string) => void;
  onCreateReference: (name: string, url: string) => Promise<boolean>;
  onRemove: () => void;
  onClose: () => void;
}

export function LinkModal({ open, docName, currentUrl, onSave, onCreateReference, onRemove, onClose }: Props) {
  const [url, setUrl] = useState(currentUrl);
  const [referenceName, setReferenceName] = useState(docName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUrl(currentUrl);
    setReferenceName(docName);
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open, currentUrl, docName]);

  if (!open) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSave(url.trim());
    if (e.key === "Escape") onClose();
  };

  const handleCreateReference = async () => {
    const ok = await onCreateReference(referenceName.trim(), url.trim());
    if (!ok) {
      alert("Impossible de créer la référence. Vérifiez le nom et le lien.");
      return;
    }
    alert("Référence enregistrée.");
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
        <div className="mt-3 rounded-lg border border-border p-2 bg-muted/40">
          <div className="text-[11px] font-medium text-foreground mb-1">Référencer un document</div>
          <div className="flex gap-2 items-center">
            <input
              value={referenceName}
              onChange={(e) => setReferenceName(e.target.value)}
              placeholder="Nom du document de référence"
              className="flex-1 min-w-0 px-2 py-1 border border-border rounded-md text-xs bg-background text-foreground outline-none focus:border-link-fg"
            />
            <button
              onClick={() => void handleCreateReference()}
              className="px-2 py-1 rounded-md text-[10px] font-medium bg-link-bg text-link-fg border border-link-fg hover:opacity-85 transition-opacity"
            >
              Créer la référence
            </button>
          </div>
        </div>
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

import { useEffect, useRef, useState } from "react";

interface Props {
  open: boolean;
  onCreate: (title: string, details: string) => Promise<boolean>;
  onClose: () => void;
}

export function ExtractionModal({ open, onCreate, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setDetails("");
    setTimeout(() => titleRef.current?.focus(), 50);
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    const ok = await onCreate(title, details);
    if (!ok) {
      alert("Impossible de créer la demande d'extraction.");
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/35" onClick={onClose} />
      <div className="relative bg-background rounded-xl p-5 w-[min(520px,90vw)] shadow-xl">
        <div className="text-sm font-medium text-foreground mb-1">Nouvelle demande d'extraction</div>
        <div className="text-xs text-muted-foreground mb-3">Créez une demande et précisez le besoin.</div>

        <input
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleSubmit();
            if (e.key === "Escape") onClose();
          }}
          placeholder="Titre de la demande"
          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-muted text-foreground outline-none focus:border-link-fg transition-colors"
        />

        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
          }}
          placeholder="Détails (optionnel)"
          className="mt-2 w-full min-h-24 px-3 py-2 border border-border rounded-lg text-sm bg-muted text-foreground outline-none focus:border-link-fg transition-colors"
        />

        <div className="flex gap-2 mt-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:opacity-85 transition-opacity"
          >
            Annuler
          </button>
          <button
            onClick={() => void handleSubmit()}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-link-fg text-white hover:opacity-85 transition-opacity"
          >
            Créer
          </button>
        </div>
      </div>
    </div>
  );
}

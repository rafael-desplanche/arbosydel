import { ExternalLink, Link as LinkIcon, Pencil } from "lucide-react";
import type { DocSection } from "@/data/treeData";
import { makeKey } from "@/hooks/useDocumentLinks";
import { cn } from "@/lib/utils";

interface Props {
  docs: DocSection[];
  treePath: string;
  links: Record<string, string>;
  onEditLink: (treePath: string, section: string, docName: string, currentUrl: string) => void;
}

export function DocumentList({ docs, treePath, links, onEditLink }: Props) {
  return (
    <div className="ml-7 my-1 pl-3 border-l-2 border-border text-xs text-muted-foreground leading-loose">
      {docs.map((group, gi) => (
        <div key={gi}>
          <div className={cn("font-medium text-foreground text-[11px] uppercase tracking-wide", gi > 0 && "mt-2")}>
            {group.section}
          </div>
          {group.items.map((item, ii) => {
            const key = makeKey(treePath, group.section, item.name);
            const url = links[key];
            return (
              <div key={ii} className="flex items-center gap-2 pl-2.5 relative doc-row">
                <span className="absolute left-0 text-muted-foreground/50 text-xs">•</span>
                <span className={cn("flex-1 min-w-0", item.optional && "opacity-60 italic")}>
                  {item.name}{item.optional && " (optionnel)"}
                </span>
                {url ? (
                  <>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-link-bg text-link-fg border border-link-fg text-[10px] font-medium hover:opacity-80 transition-opacity"
                    >
                      <ExternalLink className="w-2.5 h-2.5" /> Accéder au document
                    </a>
                    <button
                      onClick={() => onEditLink(treePath, group.section, item.name, url)}
                      className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                      title="Modifier le lien"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onEditLink(treePath, group.section, item.name, "")}
                    className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-dashed border-muted-foreground/30 text-muted-foreground text-[10px] hover:border-link-fg hover:text-link-fg hover:bg-link-bg transition-all"
                  >
                    <Pencil className="w-2.5 h-2.5" /> Ajouter un lien
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

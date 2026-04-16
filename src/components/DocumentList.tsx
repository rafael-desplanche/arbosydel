import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { DocSection } from "@/data/treeData";
import { EditableLabel } from "./EditableLabel";
import { cn } from "@/lib/utils";

interface TreeActions {
  addSection: (path: number[], sectionName: string) => void;
  deleteSection: (path: number[], sectionIdx: number) => void;
  renameSection: (path: number[], sectionIdx: number, newName: string) => void;
  addDocument: (path: number[], sectionIdx: number, docName: string, optional?: boolean) => void;
  deleteDocument: (path: number[], sectionIdx: number, docIdx: number) => void;
  renameDocument: (path: number[], sectionIdx: number, docIdx: number, newName: string) => void;
  toggleDocOptional: (path: number[], sectionIdx: number, docIdx: number) => void;
}

interface Props {
  docs: DocSection[];
  nodePath: number[];
  actions: TreeActions;
  editMode: boolean;
}

export function DocumentList({
  docs,
  nodePath,
  actions,
  editMode,
}: Props) {
  const [addingSectionName, setAddingSectionName] = useState("");
  const [showAddSection, setShowAddSection] = useState(false);
  const [addingDocInSection, setAddingDocInSection] = useState<number | null>(null);
  const [newDocName, setNewDocName] = useState("");

  const handleAddSection = () => {
    const trimmed = addingSectionName.trim();
    if (trimmed) {
      actions.addSection(nodePath, trimmed);
      setAddingSectionName("");
      setShowAddSection(false);
    }
  };

  const handleAddDoc = (sectionIdx: number) => {
    const trimmed = newDocName.trim();
    if (trimmed) {
      actions.addDocument(nodePath, sectionIdx, trimmed);
      setNewDocName("");
      setAddingDocInSection(null);
    }
  };

  return (
    <div className="ml-7 my-1 pl-3 border-l-2 border-border text-xs text-muted-foreground leading-loose">
      {docs.map((group, gi) => (
        <div key={gi}>
          <div className={cn("font-medium text-foreground text-[11px] uppercase tracking-wide flex items-center gap-1 group/section", gi > 0 && "mt-2")}>
            {editMode ? (
              <EditableLabel
                value={group.section}
                onSave={(v) => actions.renameSection(nodePath, gi, v)}
                inputClassName="text-[11px]"
              />
            ) : (
              group.section
            )}
            {editMode && (
              <button
                onClick={() => {
                  if (confirm(`Supprimer la section "${group.section}" ?`)) actions.deleteSection(nodePath, gi);
                }}
                className="p-0.5 opacity-0 group-hover/section:opacity-60 hover:!opacity-100 text-destructive transition-opacity"
                title="Supprimer la section"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
          {group.items.map((item, ii) => {
            return (
              <div key={ii} className="flex items-center gap-2 pl-2.5 relative doc-row group/doc">
                <span className="absolute left-0 text-muted-foreground/50 text-xs">•</span>
                <span className={cn("flex-1 min-w-0", item.optional && "opacity-60 italic")}>
                  {editMode ? (
                    <EditableLabel
                      value={item.name}
                      onSave={(v) => actions.renameDocument(nodePath, gi, ii, v)}
                      inputClassName="text-xs"
                    />
                  ) : (
                    item.name
                  )}
                  {item.optional && " (optionnel)"}
                </span>

                <span className="shrink-0 px-2 py-0.5 rounded-md border border-dashed border-muted-foreground/30 text-[10px] text-muted-foreground">
                  Lien désactivé
                </span>

                {editMode && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover/doc:opacity-100 transition-opacity">
                    <button
                      onClick={() => actions.toggleDocOptional(nodePath, gi, ii)}
                      className={cn("px-1.5 py-0.5 rounded text-[9px] border transition-colors", item.optional ? "border-tag-amber-fg text-tag-amber-fg bg-tag-amber" : "border-muted-foreground/30 text-muted-foreground")}
                      title="Basculer optionnel"
                    >
                      Opt
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Supprimer "${item.name}" ?`)) actions.deleteDocument(nodePath, gi, ii);
                      }}
                      className="p-0.5 hover:text-destructive text-muted-foreground transition-colors"
                      title="Supprimer le document"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {editMode && (
            <>
              {addingDocInSection === gi ? (
                <div className="flex items-center gap-2 pl-2.5 mt-1">
                  <input
                    autoFocus
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddDoc(gi);
                      if (e.key === "Escape") { setAddingDocInSection(null); setNewDocName(""); }
                    }}
                    placeholder="Nom du document…"
                    className="px-2 py-0.5 border border-border rounded text-[11px] bg-background text-foreground outline-none focus:border-link-fg"
                  />
                  <button onClick={() => handleAddDoc(gi)} className="px-2 py-0.5 rounded text-[10px] bg-link-bg text-link-fg border border-link-fg">Ajouter</button>
                  <button onClick={() => { setAddingDocInSection(null); setNewDocName(""); }} className="text-[10px] text-muted-foreground">Annuler</button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingDocInSection(gi)}
                  className="inline-flex items-center gap-1 pl-2.5 mt-0.5 text-[10px] text-muted-foreground hover:text-link-fg transition-colors"
                >
                  <Plus className="w-2.5 h-2.5" /> Ajouter un document
                </button>
              )}
            </>
          )}
        </div>
      ))}

      {editMode && (
        <>
          {showAddSection ? (
            <div className="flex items-center gap-2 mt-2">
              <input
                autoFocus
                value={addingSectionName}
                onChange={(e) => setAddingSectionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddSection();
                  if (e.key === "Escape") { setShowAddSection(false); setAddingSectionName(""); }
                }}
                placeholder="Nom de la section…"
                className="px-2 py-0.5 border border-border rounded text-[11px] bg-background text-foreground outline-none focus:border-link-fg"
              />
              <button onClick={handleAddSection} className="px-2 py-0.5 rounded text-[10px] bg-link-bg text-link-fg border border-link-fg">Ajouter</button>
              <button onClick={() => { setShowAddSection(false); setAddingSectionName(""); }} className="text-[10px] text-muted-foreground">Annuler</button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddSection(true)}
              className="inline-flex items-center gap-1 mt-2 text-[10px] text-muted-foreground hover:text-link-fg transition-colors"
            >
              <Plus className="w-2.5 h-2.5" /> Ajouter une section
            </button>
          )}
        </>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { useTreeData } from "@/hooks/useTreeData";
import { useExtractionRequests } from "@/hooks/useExtractionRequests";
import { TreeBranch } from "@/components/TreeBranch";
import { ExtractionModal } from "@/components/ExtractionModal";
import { Pencil, Redo2, Undo2 } from "lucide-react";

const Index = () => {
  const { createExtractionRequest } = useExtractionRequests();
  const {
    tree, loading: treeLoading,
    canUndo, canRedo, undo, redo,
    addChild, deleteNode, renameNode,
    addSection, deleteSection, renameSection,
    addDocument, deleteDocument, renameDocument, toggleDocOptional,
  } = useTreeData();

  const [globalToggle, setGlobalToggle] = useState(0);
  const [expanded, setExpanded] = useState<boolean | undefined>(undefined);
  const [editMode, setEditMode] = useState(false);
  const [extractionModalOpen, setExtractionModalOpen] = useState(false);

  const expandAll = () => { setExpanded(true); setGlobalToggle((t) => t + 1); };
  const collapseAll = () => { setExpanded(false); setGlobalToggle((t) => t + 1); };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!editMode || !(event.ctrlKey || event.metaKey)) return;
      if (event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        void undo();
        return;
      }
      if (event.key.toLowerCase() === "y" || (event.key.toLowerCase() === "z" && event.shiftKey)) {
        event.preventDefault();
        void redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editMode, undo, redo]);

  const actions = {
    addChild, deleteNode, renameNode,
    addSection, deleteSection, renameSection,
    addDocument, deleteDocument, renameDocument, toggleDocOptional,
  };

  if (treeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground text-sm">
        Chargement…
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground text-sm">
        Aucune arborescence trouvée.
      </div>
    );
  }

  return (
    <div className="tree-container max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button onClick={expandAll} className="toolbar-btn">Tout déplier</button>
        <button onClick={collapseAll} className="toolbar-btn">Tout replier</button>
        <button
          onClick={() => setEditMode(!editMode)}
          className={editMode ? "toolbar-btn !border-link-fg !text-link-fg !bg-link-bg" : "toolbar-btn"}
        >
          <Pencil className="w-3 h-3 inline mr-1" />
          {editMode ? "Fin édition" : "Éditer l'arbre"}
        </button>
        <button onClick={() => setExtractionModalOpen(true)} className="toolbar-btn">
          Nouvelle demande d'extraction
        </button>
        <button onClick={() => void undo()} className="toolbar-btn" disabled={!canUndo} title="Revenir en arrière (Ctrl/Cmd + Z)">
          <Undo2 className="w-3 h-3 inline mr-1" /> Annuler
        </button>
        <button onClick={() => void redo()} className="toolbar-btn" disabled={!canRedo} title="Revenir en avant (Ctrl/Cmd + Y)">
          <Redo2 className="w-3 h-3 inline mr-1" /> Rétablir
        </button>
      </div>

      <ul className="tree-root">
        <TreeBranch
          node={tree}
          path=""
          indexPath={[]}
          depth={0}
          expanded={expanded}
          globalToggle={globalToggle}
          actions={actions}
          editMode={editMode}
        />
      </ul>

      <ExtractionModal
        open={extractionModalOpen}
        onCreate={createExtractionRequest}
        onClose={() => setExtractionModalOpen(false)}
      />
    </div>
  );
};

export default Index;

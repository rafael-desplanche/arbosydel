import { useState, useCallback, useEffect } from "react";
import { useTreeData } from "@/hooks/useTreeData";
import { useDocumentLinks } from "@/hooks/useDocumentLinks";
import { useExtractionRequests } from "@/hooks/useExtractionRequests";
import { TreeBranch } from "@/components/TreeBranch";
import { LinkModal } from "@/components/LinkModal";
import { ExtractionModal } from "@/components/ExtractionModal";
import { Pencil, Redo2, Undo2 } from "lucide-react";

const Index = () => {
  const {
    links,
    docReferences,
    referenceOptions,
    loading: linksLoading,
    saveLink,
    removeLink,
    createReference,
    setDocumentReference,
    linkCount,
  } = useDocumentLinks();
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

  const [modal, setModal] = useState<{
    open: boolean;
    treePath: string;
    section: string;
    docName: string;
    currentUrl: string;
  }>({ open: false, treePath: "", section: "", docName: "", currentUrl: "" });

  const handleEditLink = useCallback((treePath: string, section: string, docName: string, currentUrl: string) => {
    setModal({ open: true, treePath, section, docName, currentUrl });
  }, []);

  const handleSave = useCallback(async (url: string) => {
    if (url) await saveLink(modal.treePath, modal.section, modal.docName, url);
    setModal((m) => ({ ...m, open: false }));
  }, [modal, saveLink]);

  const handleRemove = useCallback(async () => {
    await removeLink(modal.treePath, modal.section, modal.docName);
    setModal((m) => ({ ...m, open: false }));
  }, [modal, removeLink]);

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

  if (treeLoading || linksLoading) {
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
        <span className="text-[11px] text-muted-foreground ml-auto">
          {linkCount > 0 ? `${linkCount} lien${linkCount > 1 ? "s" : ""} enregistré${linkCount > 1 ? "s" : ""}` : ""}
        </span>
      </div>

      <ul className="tree-root">
        <TreeBranch
          node={tree}
          path=""
          indexPath={[]}
          depth={0}
          expanded={expanded}
          globalToggle={globalToggle}
          links={links}
          docReferences={docReferences}
          referenceOptions={referenceOptions}
          onEditLink={handleEditLink}
          onReferenceDocument={setDocumentReference}
          actions={actions}
          editMode={editMode}
        />
      </ul>

      <LinkModal
        open={modal.open}
        docName={modal.docName}
        currentUrl={modal.currentUrl}
        onSave={handleSave}
        onCreateReference={createReference}
        onRemove={handleRemove}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
      />

      <ExtractionModal
        open={extractionModalOpen}
        onCreate={createExtractionRequest}
        onClose={() => setExtractionModalOpen(false)}
      />
    </div>
  );
};

export default Index;

import { useState, useCallback } from "react";
import { useTreeData } from "@/hooks/useTreeData";
import { useDocumentLinks } from "@/hooks/useDocumentLinks";
import { TreeBranch } from "@/components/TreeBranch";
import { LinkModal } from "@/components/LinkModal";
import { Pencil } from "lucide-react";

const Index = () => {
  const { links, loading: linksLoading, saveLink, removeLink, linkCount } = useDocumentLinks();
  const {
    tree, loading: treeLoading,
    addChild, deleteNode, renameNode, toggleLeaf,
    addSection, deleteSection, renameSection,
    addDocument, deleteDocument, renameDocument, toggleDocOptional,
  } = useTreeData();

  const [globalToggle, setGlobalToggle] = useState(0);
  const [expanded, setExpanded] = useState<boolean | undefined>(undefined);
  const [editMode, setEditMode] = useState(false);

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

  const actions = {
    addChild, deleteNode, renameNode, toggleLeaf,
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
          onEditLink={handleEditLink}
          actions={actions}
          editMode={editMode}
        />
      </ul>

      <LinkModal
        open={modal.open}
        docName={modal.docName}
        currentUrl={modal.currentUrl}
        onSave={handleSave}
        onRemove={handleRemove}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
      />
    </div>
  );
};

export default Index;

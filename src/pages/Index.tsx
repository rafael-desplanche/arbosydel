import { useState, useCallback } from "react";
import { treeData } from "@/data/treeData";
import { useDocumentLinks } from "@/hooks/useDocumentLinks";
import { TreeBranch } from "@/components/TreeBranch";
import { LinkModal } from "@/components/LinkModal";

const Index = () => {
  const { links, loading, saveLink, removeLink, linkCount } = useDocumentLinks();
  const [globalToggle, setGlobalToggle] = useState(0);
  const [expanded, setExpanded] = useState<boolean | undefined>(undefined);

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
    if (url) {
      await saveLink(modal.treePath, modal.section, modal.docName, url);
    }
    setModal((m) => ({ ...m, open: false }));
  }, [modal, saveLink]);

  const handleRemove = useCallback(async () => {
    await removeLink(modal.treePath, modal.section, modal.docName);
    setModal((m) => ({ ...m, open: false }));
  }, [modal, removeLink]);

  const expandAll = () => {
    setExpanded(true);
    setGlobalToggle((t) => t + 1);
  };

  const collapseAll = () => {
    setExpanded(false);
    setGlobalToggle((t) => t + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground text-sm">
        Chargement…
      </div>
    );
  }

  return (
    <div className="tree-container max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button onClick={expandAll} className="toolbar-btn">
          Tout déplier
        </button>
        <button onClick={collapseAll} className="toolbar-btn">
          Tout replier
        </button>
        <span className="text-[11px] text-muted-foreground ml-auto">
          {linkCount > 0 ? `${linkCount} lien${linkCount > 1 ? "s" : ""} enregistré${linkCount > 1 ? "s" : ""}` : ""}
        </span>
      </div>

      <ul className="tree-root">
        <TreeBranch
          node={treeData}
          path=""
          depth={0}
          expanded={expanded}
          globalToggle={globalToggle}
          links={links}
          onEditLink={handleEditLink}
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

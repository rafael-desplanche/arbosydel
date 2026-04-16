import { useState } from "react";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import type { TreeNode } from "@/data/treeData";
import { DocumentList } from "./DocumentList";
import { EditableLabel } from "./EditableLabel";
import { cn } from "@/lib/utils";

interface TreeActions {
  addChild: (parentPath: number[], label: string) => void;
  deleteNode: (path: number[]) => void;
  renameNode: (path: number[], newLabel: string) => void;
  addSection: (path: number[], sectionName: string) => void;
  deleteSection: (path: number[], sectionIdx: number) => void;
  renameSection: (path: number[], sectionIdx: number, newName: string) => void;
  addDocument: (path: number[], sectionIdx: number, docName: string, optional?: boolean) => void;
  deleteDocument: (path: number[], sectionIdx: number, docIdx: number) => void;
  renameDocument: (path: number[], sectionIdx: number, docIdx: number, newName: string) => void;
  toggleDocOptional: (path: number[], sectionIdx: number, docIdx: number) => void;
}

interface Props {
  node: TreeNode;
  path: string;
  indexPath: number[];
  depth: number;
  expanded: boolean | undefined;
  globalToggle: number;
  links: Record<string, string>;
  docReferences: Record<string, string>;
  referenceOptions: string[];
  onEditLink: (treePath: string, section: string, docName: string, currentUrl: string) => void;
  onReferenceDocument: (treePath: string, section: string, docName: string, referenceName: string) => Promise<boolean>;
  actions: TreeActions;
  editMode: boolean;
}

const tagColors: Record<string, string> = {
  blue: "bg-tag-blue text-tag-blue-fg",
  green: "bg-tag-green text-tag-green-fg",
  orange: "bg-tag-orange text-tag-orange-fg",
  purple: "bg-tag-purple text-tag-purple-fg",
  gray: "bg-tag-gray text-tag-gray-fg",
  teal: "bg-tag-teal text-tag-teal-fg",
  amber: "bg-tag-amber text-tag-amber-fg",
  pink: "bg-tag-pink text-tag-pink-fg",
};

export function TreeBranch({
  node,
  path,
  indexPath,
  depth,
  expanded,
  globalToggle,
  links,
  docReferences,
  referenceOptions,
  onEditLink,
  onReferenceDocument,
  actions,
  editMode,
}: Props) {
  const hasChildren = !!(node.children && node.children.length > 0);
  const hasContent = hasChildren || node.leaf;
  const defaultOpen = depth < 2;

  const [isOpen, setIsOpen] = useState(expanded ?? defaultOpen);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");

  const [lastToggle, setLastToggle] = useState(globalToggle);
  if (globalToggle !== lastToggle) {
    setLastToggle(globalToggle);
    if (expanded !== undefined) setIsOpen(expanded);
  }

  const currentPath = path ? `${path} > ${node.label}` : node.label;

  const handleAddChild = () => {
    const trimmed = newLabel.trim();
    if (trimmed) {
      actions.addChild(indexPath, trimmed);
      setNewLabel("");
      setAdding(false);
    }
  };

  return (
    <li className={cn("relative", depth > 0 && "tree-branch")}>
      <div className="flex items-center gap-1 group/branch">
        <span
          className={cn(
            "inline-flex items-center gap-2 py-1 px-3 rounded-lg text-sm leading-relaxed transition-colors",
            hasContent && "cursor-pointer font-medium hover:bg-muted",
            !hasContent && "cursor-default"
          )}
          onClick={() => hasContent && setIsOpen(!isOpen)}
        >
          {hasContent && (
            <ChevronRight
              className={cn("w-4 h-4 shrink-0 transition-transform duration-200", isOpen && "rotate-90")}
            />
          )}
          {editMode ? (
            <EditableLabel
              value={node.label}
              onSave={(v) => actions.renameNode(indexPath, v)}
            />
          ) : (
            node.label
          )}
          {node.tag && (
            <span className={cn("inline-block px-2 py-0.5 rounded-lg text-[11px] font-medium ml-1", tagColors[node.tagColor || "gray"])}>
              {node.tag}
            </span>
          )}
          {node.note && (
            <span className="text-[11px] text-muted-foreground ml-1">({node.note})</span>
          )}
        </span>

        {editMode && depth > 0 && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover/branch:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); setAdding(true); }}
              className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title="Ajouter une sous-branche"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Supprimer "${node.label}" ?`)) actions.deleteNode(indexPath);
              }}
              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {editMode && adding && (
        <div className="ml-10 mt-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <input
            autoFocus
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddChild();
              if (e.key === "Escape") { setAdding(false); setNewLabel(""); }
            }}
            placeholder="Nom de la branche…"
            className="px-2 py-1 border border-border rounded text-xs bg-background text-foreground outline-none focus:border-link-fg"
          />
          <button onClick={handleAddChild} className="px-2 py-1 rounded text-xs bg-link-bg text-link-fg border border-link-fg hover:opacity-80">
            Ajouter
          </button>
          <button onClick={() => { setAdding(false); setNewLabel(""); }} className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground">
            Annuler
          </button>
        </div>
      )}

      {isOpen && hasChildren && (
        <ul className="pl-7 relative tree-children">
          {node.children!.map((child, i) => (
            <TreeBranch
              key={i}
              node={child}
              path={currentPath}
              indexPath={[...indexPath, i]}
              depth={depth + 1}
              expanded={expanded}
              globalToggle={globalToggle}
              links={links}
              docReferences={docReferences}
              referenceOptions={referenceOptions}
              onEditLink={onEditLink}
              onReferenceDocument={onReferenceDocument}
              actions={actions}
              editMode={editMode}
            />
          ))}
          {editMode && (
            <li className="pl-3 py-1">
              <button
                onClick={() => setAdding(true)}
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-link-fg transition-colors"
              >
                <Plus className="w-3 h-3" /> Ajouter une branche
              </button>
            </li>
          )}
        </ul>
      )}

      {isOpen && node.leaf && (
        <DocumentList
          docs={node.docs || []}
          treePath={currentPath}
          nodePath={indexPath}
          links={links}
          docReferences={docReferences}
          referenceOptions={referenceOptions}
          onEditLink={onEditLink}
          onReferenceDocument={onReferenceDocument}
          actions={actions}
          editMode={editMode}
        />
      )}
    </li>
  );
}

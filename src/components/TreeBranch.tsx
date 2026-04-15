import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { TreeNode } from "@/data/treeData";
import { DocumentList } from "./DocumentList";
import { cn } from "@/lib/utils";

interface Props {
  node: TreeNode;
  path: string;
  depth: number;
  expanded: boolean | undefined; // undefined = use default
  globalToggle: number; // changes to force re-render
  links: Record<string, string>;
  onEditLink: (treePath: string, section: string, docName: string, currentUrl: string) => void;
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

export function TreeBranch({ node, path, depth, expanded, globalToggle, links, onEditLink }: Props) {
  const hasChildren = !!(node.children && node.children.length > 0);
  const hasContent = hasChildren || node.leaf;
  const defaultOpen = depth < 2 && !node.leaf;
  
  const [isOpen, setIsOpen] = useState(expanded ?? defaultOpen);

  // React to global toggle
  const [lastToggle, setLastToggle] = useState(globalToggle);
  if (globalToggle !== lastToggle) {
    setLastToggle(globalToggle);
    if (expanded !== undefined) {
      setIsOpen(expanded);
    }
  }

  const currentPath = path ? `${path} > ${node.label}` : node.label;

  return (
    <li className={cn("relative", depth > 0 && "tree-branch")}>
      <span
        className={cn(
          "inline-flex items-center gap-2 py-1 px-3 rounded-lg text-sm leading-relaxed transition-colors",
          hasContent && "cursor-pointer font-medium hover:bg-muted",
          !hasContent && "cursor-default",
          node.leaf && "text-muted-foreground text-[13px]"
        )}
        onClick={() => hasContent && setIsOpen(!isOpen)}
      >
        {hasContent && (
          <ChevronRight
            className={cn(
              "w-4 h-4 shrink-0 transition-transform duration-200",
              isOpen && "rotate-90"
            )}
          />
        )}
        {node.label}
        {node.tag && (
          <span className={cn("inline-block px-2 py-0.5 rounded-lg text-[11px] font-medium ml-1", tagColors[node.tagColor || "gray"])}>
            {node.tag}
          </span>
        )}
        {node.note && (
          <span className="text-[11px] text-muted-foreground ml-1">({node.note})</span>
        )}
      </span>

      {isOpen && hasChildren && (
        <ul className="pl-7 relative tree-children">
          {node.children!.map((child, i) => (
            <TreeBranch
              key={i}
              node={child}
              path={currentPath}
              depth={depth + 1}
              expanded={expanded}
              globalToggle={globalToggle}
              links={links}
              onEditLink={onEditLink}
            />
          ))}
        </ul>
      )}

      {isOpen && node.leaf && node.docs && (
        <DocumentList
          docs={node.docs}
          treePath={currentPath}
          links={links}
          onEditLink={onEditLink}
        />
      )}
    </li>
  );
}

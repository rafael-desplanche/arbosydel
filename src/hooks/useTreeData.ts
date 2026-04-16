import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { TreeNode, DocSection, DocItem } from "@/data/treeData";

export function useTreeData() {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [configId, setConfigId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTree = useCallback(async () => {
    const { data } = await supabase
      .from("tree_config")
      .select("id, data")
      .limit(1)
      .single();

    if (data) {
      setConfigId(data.id);
      setTree(data.data as unknown as TreeNode);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const saveTree = useCallback(
    async (newTree: TreeNode) => {
      if (!configId) return;
      setTree(newTree);
      await supabase
        .from("tree_config")
        .update({ data: JSON.parse(JSON.stringify(newTree)) })
        .eq("id", configId);
    },
    [configId]
  );

  // Helper: deep clone + update a node at a given path
  const updateNodeAtPath = useCallback(
    (path: number[], updater: (node: TreeNode) => TreeNode) => {
      if (!tree) return;
      const newTree = JSON.parse(JSON.stringify(tree)) as TreeNode;
      let current = newTree;
      for (let i = 0; i < path.length - 1; i++) {
        current = current.children![path[i]];
      }
      if (path.length === 0) {
        saveTree(updater(newTree));
        return;
      }
      const lastIdx = path[path.length - 1];
      current.children![lastIdx] = updater(current.children![lastIdx]);
      saveTree(newTree);
    },
    [tree, saveTree]
  );

  const addChild = useCallback(
    (parentPath: number[], label: string) => {
      if (!tree) return;
      const newTree = JSON.parse(JSON.stringify(tree)) as TreeNode;
      let current = newTree;
      for (const idx of parentPath) {
        current = current.children![idx];
      }
      if (!current.children) current.children = [];
      current.children.push({ label, children: [] });
      saveTree(newTree);
    },
    [tree, saveTree]
  );

  const deleteNode = useCallback(
    (path: number[]) => {
      if (!tree || path.length === 0) return;
      const newTree = JSON.parse(JSON.stringify(tree)) as TreeNode;
      let current = newTree;
      for (let i = 0; i < path.length - 1; i++) {
        current = current.children![path[i]];
      }
      current.children!.splice(path[path.length - 1], 1);
      saveTree(newTree);
    },
    [tree, saveTree]
  );

  const renameNode = useCallback(
    (path: number[], newLabel: string) => {
      updateNodeAtPath(path, (node) => ({ ...node, label: newLabel }));
    },
    [updateNodeAtPath]
  );

  const updateNodeTag = useCallback(
    (path: number[], tag: string, tagColor: string) => {
      updateNodeAtPath(path, (node) => ({ ...node, tag, tagColor }));
    },
    [updateNodeAtPath]
  );

  const updateNodeNote = useCallback(
    (path: number[], note: string) => {
      updateNodeAtPath(path, (node) => ({ ...node, note: note || undefined }));
    },
    [updateNodeAtPath]
  );

  const toggleLeaf = useCallback(
    (path: number[]) => {
      updateNodeAtPath(path, (node) => {
        if (node.leaf) {
          // Convert leaf to branch
          const { leaf, docs, ...rest } = node;
          return { ...rest, children: [] };
        } else {
          // Convert branch to leaf
          const { children, ...rest } = node;
          return { ...rest, leaf: true, docs: [] };
        }
      });
    },
    [updateNodeAtPath]
  );

  // Document operations
  const addSection = useCallback(
    (path: number[], sectionName: string) => {
      updateNodeAtPath(path, (node) => {
        const docs = [...(node.docs || []), { section: sectionName, items: [] }];
        return { ...node, docs };
      });
    },
    [updateNodeAtPath]
  );

  const deleteSection = useCallback(
    (path: number[], sectionIdx: number) => {
      updateNodeAtPath(path, (node) => {
        const docs = [...(node.docs || [])];
        docs.splice(sectionIdx, 1);
        return { ...node, docs };
      });
    },
    [updateNodeAtPath]
  );

  const renameSection = useCallback(
    (path: number[], sectionIdx: number, newName: string) => {
      updateNodeAtPath(path, (node) => {
        const docs = JSON.parse(JSON.stringify(node.docs || [])) as DocSection[];
        docs[sectionIdx].section = newName;
        return { ...node, docs };
      });
    },
    [updateNodeAtPath]
  );

  const addDocument = useCallback(
    (path: number[], sectionIdx: number, docName: string, optional: boolean = false) => {
      updateNodeAtPath(path, (node) => {
        const docs = JSON.parse(JSON.stringify(node.docs || [])) as DocSection[];
        docs[sectionIdx].items.push({ name: docName, optional: optional || undefined });
        return { ...node, docs };
      });
    },
    [updateNodeAtPath]
  );

  const deleteDocument = useCallback(
    (path: number[], sectionIdx: number, docIdx: number) => {
      updateNodeAtPath(path, (node) => {
        const docs = JSON.parse(JSON.stringify(node.docs || [])) as DocSection[];
        docs[sectionIdx].items.splice(docIdx, 1);
        return { ...node, docs };
      });
    },
    [updateNodeAtPath]
  );

  const renameDocument = useCallback(
    (path: number[], sectionIdx: number, docIdx: number, newName: string) => {
      updateNodeAtPath(path, (node) => {
        const docs = JSON.parse(JSON.stringify(node.docs || [])) as DocSection[];
        docs[sectionIdx].items[docIdx].name = newName;
        return { ...node, docs };
      });
    },
    [updateNodeAtPath]
  );

  const toggleDocOptional = useCallback(
    (path: number[], sectionIdx: number, docIdx: number) => {
      updateNodeAtPath(path, (node) => {
        const docs = JSON.parse(JSON.stringify(node.docs || [])) as DocSection[];
        docs[sectionIdx].items[docIdx].optional = !docs[sectionIdx].items[docIdx].optional || undefined;
        return { ...node, docs };
      });
    },
    [updateNodeAtPath]
  );

  return {
    tree,
    loading,
    addChild,
    deleteNode,
    renameNode,
    updateNodeTag,
    updateNodeNote,
    toggleLeaf,
    addSection,
    deleteSection,
    renameSection,
    addDocument,
    deleteDocument,
    renameDocument,
    toggleDocOptional,
  };
}

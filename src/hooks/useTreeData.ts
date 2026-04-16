import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { TreeNode, DocSection, DocItem } from "@/data/treeData";

const cloneTree = (node: TreeNode) => JSON.parse(JSON.stringify(node)) as TreeNode;

export function useTreeData() {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [configId, setConfigId] = useState<string | null>(null);
  const [historyPast, setHistoryPast] = useState<TreeNode[]>([]);
  const [historyFuture, setHistoryFuture] = useState<TreeNode[]>([]);
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
      setHistoryPast([]);
      setHistoryFuture([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const persistTree = useCallback(
    async (newTree: TreeNode) => {
      if (!configId) return;
      await supabase
        .from("tree_config")
        .update({ data: cloneTree(newTree) })
        .eq("id", configId);
    },
    [configId]
  );

  const saveTree = useCallback(
    async (newTree: TreeNode, options?: { skipHistory?: boolean }) => {
      if (!configId) return;

      if (!options?.skipHistory && tree) {
        setHistoryPast((prev) => [...prev, cloneTree(tree)]);
        setHistoryFuture([]);
      }

      setTree(newTree);
      await persistTree(newTree);
    },
    [configId, tree, persistTree]
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

  const undo = useCallback(async () => {
    if (!tree || historyPast.length === 0) return;

    const previous = cloneTree(historyPast[historyPast.length - 1]);
    setHistoryPast((prev) => prev.slice(0, -1));
    setHistoryFuture((prev) => [cloneTree(tree), ...prev]);
    setTree(previous);
    await persistTree(previous);
  }, [tree, historyPast, persistTree]);

  const redo = useCallback(async () => {
    if (!tree || historyFuture.length === 0) return;

    const next = cloneTree(historyFuture[0]);
    setHistoryFuture((prev) => prev.slice(1));
    setHistoryPast((prev) => [...prev, cloneTree(tree)]);
    setTree(next);
    await persistTree(next);
  }, [tree, historyFuture, persistTree]);

  return {
    tree,
    loading,
    canUndo: historyPast.length > 0,
    canRedo: historyFuture.length > 0,
    undo,
    redo,
    addChild,
    deleteNode,
    renameNode,
    updateNodeTag,
    updateNodeNote,
    addSection,
    deleteSection,
    renameSection,
    addDocument,
    deleteDocument,
    renameDocument,
    toggleDocOptional,
  };
}

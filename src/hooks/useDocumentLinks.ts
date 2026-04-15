import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LinkMap {
  [compositeKey: string]: string; // key = "treePath||section||docName" -> url
}

export function makeKey(treePath: string, section: string, docName: string) {
  return `${treePath}||${section}||${docName}`;
}

export function useDocumentLinks() {
  const [links, setLinks] = useState<LinkMap>({});
  const [loading, setLoading] = useState(true);

  const fetchLinks = useCallback(async () => {
    const { data } = await supabase
      .from("document_links")
      .select("tree_path, section, document_name, url");
    
    if (data) {
      const map: LinkMap = {};
      for (const row of data) {
        if (row.url) {
          map[makeKey(row.tree_path, row.section, row.document_name)] = row.url;
        }
      }
      setLinks(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const saveLink = useCallback(async (treePath: string, section: string, docName: string, url: string) => {
    const { error } = await supabase
      .from("document_links")
      .upsert(
        { tree_path: treePath, section, document_name: docName, url },
        { onConflict: "tree_path,section,document_name" }
      );
    
    if (!error) {
      setLinks((prev) => ({ ...prev, [makeKey(treePath, section, docName)]: url }));
    }
    return !error;
  }, []);

  const removeLink = useCallback(async (treePath: string, section: string, docName: string) => {
    await supabase
      .from("document_links")
      .delete()
      .eq("tree_path", treePath)
      .eq("section", section)
      .eq("document_name", docName);
    
    setLinks((prev) => {
      const next = { ...prev };
      delete next[makeKey(treePath, section, docName)];
      return next;
    });
  }, []);

  const linkCount = Object.keys(links).length;

  return { links, loading, saveLink, removeLink, linkCount };
}

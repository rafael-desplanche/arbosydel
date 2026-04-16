import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LinkMap {
  [compositeKey: string]: string; // key = "treePath||section||docName" -> url
}

interface ReferenceMap {
  [compositeKey: string]: string; // key = "treePath||section||docName" -> reference name
}

interface ReferenceCatalog {
  [referenceName: string]: string; // key = reference name -> url
}

export function makeKey(treePath: string, section: string, docName: string) {
  return `${treePath}||${section}||${docName}`;
}

export function useDocumentLinks() {
  const [links, setLinks] = useState<LinkMap>({});
  const [docReferences, setDocReferences] = useState<ReferenceMap>({});
  const [referenceCatalog, setReferenceCatalog] = useState<ReferenceCatalog>({});
  const [loading, setLoading] = useState(true);

  const fetchLinks = useCallback(async () => {
    const { data } = await supabase
      .from("document_links")
      .select("tree_path, section, document_name, url, reference_document_name");

    const { data: refsData } = await supabase
      .from("document_references")
      .select("name, url");
    
    if (data) {
      const map: LinkMap = {};
      const refs: ReferenceMap = {};
      for (const row of data) {
        const key = makeKey(row.tree_path, row.section, row.document_name);
        if (row.url) {
          map[key] = row.url;
        }
        if (row.reference_document_name) {
          refs[key] = row.reference_document_name;
        }
      }
      setLinks(map);
      setDocReferences(refs);
    }

    if (refsData) {
      const catalog: ReferenceCatalog = {};
      for (const row of refsData) {
        if (row.name && row.url) {
          catalog[row.name] = row.url;
        }
      }
      setReferenceCatalog(catalog);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const saveLink = useCallback(async (treePath: string, section: string, docName: string, url: string) => {
    const key = makeKey(treePath, section, docName);
    const { error } = await supabase
      .from("document_links")
      .upsert(
        { tree_path: treePath, section, document_name: docName, url, reference_document_name: null },
        { onConflict: "tree_path,section,document_name" }
      );
    
    if (!error) {
      setLinks((prev) => ({ ...prev, [key]: url }));
      setDocReferences((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    return !error;
  }, []);

  const createReference = useCallback(async (name: string, url: string) => {
    const cleanName = name.trim();
    const cleanUrl = url.trim();
    if (!cleanName || !cleanUrl) return false;

    const { error } = await supabase
      .from("document_references")
      .upsert({ name: cleanName, url: cleanUrl }, { onConflict: "name" });

    if (!error) {
      setReferenceCatalog((prev) => ({ ...prev, [cleanName]: cleanUrl }));
    }

    return !error;
  }, []);

  const setDocumentReference = useCallback(async (treePath: string, section: string, docName: string, referenceName: string) => {
    const key = makeKey(treePath, section, docName);
    const cleanReference = referenceName.trim();

    if (!cleanReference) {
      const { error } = await supabase
        .from("document_links")
        .upsert(
          {
            tree_path: treePath,
            section,
            document_name: docName,
            url: links[key] || null,
            reference_document_name: null,
          },
          { onConflict: "tree_path,section,document_name" }
        );

      if (!error) {
        setDocReferences((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }

      return !error;
    }

    const referencedUrl = referenceCatalog[cleanReference];
    if (!referencedUrl) {
      return false;
    }

    const { error } = await supabase
      .from("document_links")
      .upsert(
        {
          tree_path: treePath,
          section,
          document_name: docName,
          url: referencedUrl,
          reference_document_name: cleanReference,
        },
        { onConflict: "tree_path,section,document_name" }
      );

    if (!error) {
      setLinks((prev) => ({ ...prev, [key]: referencedUrl }));
      setDocReferences((prev) => ({ ...prev, [key]: cleanReference }));
    }

    return !error;
  }, [links, referenceCatalog]);

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
    setDocReferences((prev) => {
      const next = { ...prev };
      delete next[makeKey(treePath, section, docName)];
      return next;
    });
  }, []);

  const linkCount = Object.keys(links).length;

  return {
    links,
    docReferences,
    referenceOptions: Object.keys(referenceCatalog).sort((a, b) => a.localeCompare(b, "fr")),
    loading,
    saveLink,
    removeLink,
    createReference,
    setDocumentReference,
    linkCount,
  };
}

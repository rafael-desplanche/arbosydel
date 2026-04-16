import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useExtractionRequests() {
  const createExtractionRequest = useCallback(async (title: string, details: string) => {
    const cleanTitle = title.trim();
    const cleanDetails = details.trim();

    if (!cleanTitle) return false;

    const { error } = await supabase
      .from("extraction_requests")
      .insert({ title: cleanTitle, details: cleanDetails || null });

    return !error;
  }, []);

  return { createExtractionRequest };
}

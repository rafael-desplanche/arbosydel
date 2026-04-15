
CREATE TABLE public.document_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tree_path TEXT NOT NULL,
  section TEXT NOT NULL,
  document_name TEXT NOT NULL,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (tree_path, section, document_name)
);

ALTER TABLE public.document_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all select" ON public.document_links FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.document_links FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.document_links FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON public.document_links FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_document_links_updated_at
  BEFORE UPDATE ON public.document_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

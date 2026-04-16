ALTER TABLE public.document_links
  ADD COLUMN reference_document_name TEXT;

CREATE TABLE public.document_references (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.document_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all select" ON public.document_references FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.document_references FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.document_references FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON public.document_references FOR DELETE USING (true);

CREATE TRIGGER update_document_references_updated_at
  BEFORE UPDATE ON public.document_references
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

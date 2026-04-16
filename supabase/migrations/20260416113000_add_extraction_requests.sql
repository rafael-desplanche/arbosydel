CREATE TABLE public.extraction_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.extraction_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all select" ON public.extraction_requests FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.extraction_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.extraction_requests FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON public.extraction_requests FOR DELETE USING (true);

CREATE TRIGGER update_extraction_requests_updated_at
  BEFORE UPDATE ON public.extraction_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

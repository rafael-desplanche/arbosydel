
-- Table to store the full tree structure as JSON
CREATE TABLE public.tree_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tree_config ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth required, same as document_links)
CREATE POLICY "Allow all select" ON public.tree_config FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.tree_config FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.tree_config FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON public.tree_config FOR DELETE USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_tree_config_updated_at
  BEFORE UPDATE ON public.tree_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

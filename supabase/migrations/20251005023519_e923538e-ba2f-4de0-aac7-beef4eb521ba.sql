-- Create portfolio_items table for provider portfolios
CREATE TABLE public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for portfolio_items
CREATE POLICY "Public can view portfolio items"
  ON public.portfolio_items FOR SELECT
  USING (true);

CREATE POLICY "Providers can insert own portfolio items"
  ON public.portfolio_items FOR INSERT
  WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can update own portfolio items"
  ON public.portfolio_items FOR UPDATE
  USING (auth.uid() = provider_id);

CREATE POLICY "Providers can delete own portfolio items"
  ON public.portfolio_items FOR DELETE
  USING (auth.uid() = provider_id);

-- Add selected_proposal_id to requests table
ALTER TABLE public.requests 
ADD COLUMN selected_proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL;

-- Create storage bucket for portfolio images
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', true);

-- Storage policies for portfolio images
CREATE POLICY "Public can view portfolio images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio-images');

CREATE POLICY "Authenticated users can upload portfolio images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'portfolio-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own portfolio images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'portfolio-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own portfolio images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'portfolio-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Update trigger for portfolio_items
CREATE TRIGGER update_portfolio_items_updated_at
  BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
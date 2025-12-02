-- Create storage bucket for image library
INSERT INTO storage.buckets (id, name, public)
VALUES ('image-library', 'image-library', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for image library bucket
CREATE POLICY "Users can view their own images in library"
ON storage.objects FOR SELECT
USING (bucket_id = 'image-library' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload images to their library"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'image-library' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own library images"
ON storage.objects FOR DELETE
USING (bucket_id = 'image-library' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create table for image metadata and tags
CREATE TABLE IF NOT EXISTS public.image_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.image_library ENABLE ROW LEVEL SECURITY;

-- Create policies for image_library table
CREATE POLICY "Users can view their own image metadata"
ON public.image_library FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own image metadata"
ON public.image_library FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own image metadata"
ON public.image_library FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own image metadata"
ON public.image_library FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_image_library_updated_at
BEFORE UPDATE ON public.image_library
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
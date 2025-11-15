-- Enable RLS on hashtag_trends table
ALTER TABLE public.hashtag_trends ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read hashtag trends (public data)
CREATE POLICY "Anyone can view hashtag trends"
ON public.hashtag_trends
FOR SELECT
USING (true);
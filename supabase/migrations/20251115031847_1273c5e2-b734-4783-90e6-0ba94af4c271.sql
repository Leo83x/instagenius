-- Add AI token/credit control to company profiles
ALTER TABLE public.company_profiles 
ADD COLUMN ai_credits_remaining integer DEFAULT 100,
ADD COLUMN ai_credits_total integer DEFAULT 100,
ADD COLUMN ai_credits_last_reset timestamp with time zone DEFAULT now();

-- Create table for post analytics/metrics
CREATE TABLE public.post_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.generated_posts(id) ON DELETE CASCADE,
  instagram_media_id text,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  reach integer DEFAULT 0,
  impressions integer DEFAULT 0,
  engagement_rate numeric(5,2) DEFAULT 0,
  last_updated timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on post_analytics
ALTER TABLE public.post_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for post_analytics
CREATE POLICY "Users can view analytics for their own posts"
ON public.post_analytics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.generated_posts
    WHERE generated_posts.id = post_analytics.post_id
    AND generated_posts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert analytics for their own posts"
ON public.post_analytics
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.generated_posts
    WHERE generated_posts.id = post_analytics.post_id
    AND generated_posts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update analytics for their own posts"
ON public.post_analytics
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.generated_posts
    WHERE generated_posts.id = post_analytics.post_id
    AND generated_posts.user_id = auth.uid()
  )
);

-- Create table for hashtag suggestions and trends
CREATE TABLE public.hashtag_trends (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hashtag text NOT NULL,
  category text,
  usage_count integer DEFAULT 0,
  trending_score numeric(5,2) DEFAULT 0,
  last_updated timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for hashtag search
CREATE INDEX idx_hashtag_trends_hashtag ON public.hashtag_trends(hashtag);
CREATE INDEX idx_hashtag_trends_category ON public.hashtag_trends(category);

-- Create table for post theme suggestions
CREATE TABLE public.theme_suggestions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  theme_name text NOT NULL,
  description text,
  suggested_hashtags text[],
  category text,
  frequency text DEFAULT 'weekly',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on theme_suggestions
ALTER TABLE public.theme_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS policies for theme_suggestions
CREATE POLICY "Users can view their own theme suggestions"
ON public.theme_suggestions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own theme suggestions"
ON public.theme_suggestions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own theme suggestions"
ON public.theme_suggestions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own theme suggestions"
ON public.theme_suggestions
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for theme_suggestions updated_at
CREATE TRIGGER update_theme_suggestions_updated_at
BEFORE UPDATE ON public.theme_suggestions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create table for payment/subscription info (Stripe preparation)
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan_type text DEFAULT 'free',
  status text DEFAULT 'active',
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscriptions
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON public.subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for subscriptions updated_at
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
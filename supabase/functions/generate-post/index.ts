import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyD9oRxUQY92A9YalCobdHnop3afdAsBWI0';

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      objective,
      theme,
      tone = 'professional',
      style = 'photography',
      cta,
      customCaption,
      postType = 'feed',
      brandColors = [],
      companyName,
      targetAudience,
      keywords = [],
      maxHashtags = 10,
      userId,
      includeLogo = false,
      logoUrl,
      includeTextOverlay = false,
      suggestedText,
      textPosition = 'center'
    } = await req.json();

    const safeTheme = theme || '';
    const safeCompanyName = companyName || 'Company';
    const safeBrandColors = Array.isArray(brandColors) ? brandColors : [];

    console.log('Generating post with params:', { objective, theme: safeTheme, tone, style, postType });

    // AI Credits Check
    if (userId) {
      const { data: creditResult, error: creditError } = await supabase.rpc('decrement_ai_credits', {
        user_uuid: userId,
        amount: 1
      });

      if (creditError) {
        console.error('Error checking credits:', creditError);
      } else if (creditResult && creditResult.length > 0 && !creditResult[0].success) {
        return new Response(JSON.stringify({
          error: 'Insufficient AI credits. Please upgrade your plan.',
          creditsRemaining: creditResult[0].remaining
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Compliance Validation
    const checkCompliance = (text: string): { safe: boolean; reason?: string } => {
      const healthClaims = /garant|cura|milagre|100%|promessa/gi;
      if (healthClaims.test(text)) {
        return { safe: false, reason: 'Contains unauthorized health claims' };
      }
      return { safe: true };
    };

    const compliance = checkCompliance(safeTheme);
    if (!compliance.safe) {
      return new Response(JSON.stringify({
        error: 'Content not allowed',
        reason: compliance.reason,
        requiresReview: true
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aspectRatio = postType === 'story' ? '9:16' : '1:1';
    const maxCaptionLength = postType === 'story' ? 125 : 300;
    const isCarousel = postType === 'carousel';
    const carouselSlides = isCarousel ? 5 : 0;

    const systemPrompt = `You are a digital marketing specialist. Your role is to generate professional Instagram posts.
    
REGRAS OBRIGATÓRIAS:
1. Generate EXACTLY 2 variations for A/B testing:
   - Variant A: Direct, conversion focused.
   - Variant B: Emotional, storytelling focused.

2. Instagram Limits:
   - Caption max: 2200 chars (Recommended: ${maxCaptionLength} for engagement).
   - Hashtags: max 30 (Recommended: 5-15).

3. Caption Structure:
   - Hook: Catchy first line.
   - Body: 1-2 explanatory lines.
   - CTA: Clear call-to-action.

4. ${includeTextOverlay ? `TEXT OVERLAY (Text on image):
   - Generate a "headlineText" (max 6 words) in PORTUGUESE.
   - Must be catchy and complement the image.
   ${suggestedText ? `- Base it on this suggestion: "${suggestedText}"` : ''}` : ''}

RETORNE UM JSON VÁLIDO:
{
  "variations": [
    {
      "variant": "A",
      "caption": "legenda",
      "hashtags": ["#tag"],
      "imagePrompt": {
        "description": "detailed description in ENGLISH",
        "style": "${style}",
        "aspectRatio": "${aspectRatio}"
      },
      "altText": "SEO alt text",
      "rationale": "strategy",
      ${includeTextOverlay ? `"headlineText": "Texto para imagem",` : ''}
      "textOverlay": { "position": "${textPosition}" }
    }
  ]
}`;

    const userPrompt = `Company: ${safeCompanyName}\nObjective: ${objective}\nTheme: ${safeTheme}\nStyle: ${style}`;

    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }],
        generationConfig: { temperature: 0.8, responseMimeType: "application/json" }
      }),
    });

    if (!aiResponse.ok) throw new Error(`AI API Error: ${aiResponse.status}`);

    const aiData = await aiResponse.json();
    const content = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error('Empty AI response');

    const result = JSON.parse(content);
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    for (const variation of result.variations) {
      try {
        const desc = variation.imagePrompt?.description || 'Professional Instagram post';
        const finalPrompt = encodeURIComponent(`${desc}, ${style} style, high quality`);
        const width = 1080, height = postType === 'story' ? 1920 : 1080;

        const pollinationUrl = `https://image.pollinations.ai/prompt/${finalPrompt}?width=${width}&height=${height}&nologo=true`;
        const fallbackUrl = `https://loremflickr.com/${width}/${height}/${encodeURIComponent(variation.altText || 'business')}`;

        let imgResponse = await fetch(pollinationUrl);
        if (!imgResponse.ok) imgResponse = await fetch(fallbackUrl);

        if (imgResponse.ok) {
          const blob = await imgResponse.blob();
          const fileName = `${crypto.randomUUID()}.png`;
          const filePath = `${userId || 'anonymous'}/${fileName}`;

          const { error: uploadError } = await supabaseClient.storage
            .from('generated-images')
            .upload(filePath, await blob.arrayBuffer(), { contentType: 'image/png' });

          if (!uploadError) {
            const { data: urlData } = supabaseClient.storage.from('generated-images').getPublicUrl(filePath);
            variation.imageUrl = urlData.publicUrl;
          } else {
            variation.imageUrl = pollinationUrl;
          }
        }
      } catch (e) {
        console.error('Image loop error:', e);
        variation.imageUrl = `https://loremflickr.com/1080/1080/business`;
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Final Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

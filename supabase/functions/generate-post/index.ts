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
    // Gemini API Key (Required for text)
    // Fallback to user provided key if env var is missing
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyCW0xygwfkFwPxQHlHxT5ikqopqxi63Do8';

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

    // Validar Inputs e prevenir undefined
    const safeTheme = theme || '';
    const safeCompanyName = companyName || 'Empresa';
    const safeBrandColors = Array.isArray(brandColors) ? brandColors : [];

    console.log('Generating post with params:', { objective, theme: safeTheme, tone, style, postType });

    // Determinar aspect ratio baseado no tipo de post
    const aspectRatio = postType === 'story' ? '9:16' : '1:1';
    const maxCaptionLength = postType === 'story' ? 125 : 300;

    // System prompt detalhado conforme especificações
    const systemPrompt = `Você é um especialista em marketing digital e Instagram Business. 
Sua função é gerar posts PROFISSIONAIS otimizados para máximo engajamento.

REGRAS OBRIGATÓRIAS:
1. Sempre gere EXATAMENTE 2 variações para teste A/B:
   - Variação A: Direta, objetiva, foco em CONVERSÃO (CTA forte, benefício imediato)
   - Variação B: Emocional, storytelling, foco em RELACIONAMENTO (conexão humana)

2. Limites do Instagram:
   - Legenda máxima: 2.200 caracteres (recomendado: ${maxCaptionLength} chars para maior engajamento)
   - Hashtags: máximo 30 (recomendado: 5-15 relevantes)
   - ${postType === 'story' ? 'Stories: texto curto com CTA clara' : 'Feed: primeira linha deve ser um HOOK impactante'}

3. Estrutura da legenda:
   - Hook: Primeira linha chamativa (emojis opcionais conforme tom)
   - Desenvolvimento: 1-2 linhas explicativas
   - Usar até 3 emojis relevantes conforme tom de voz

4. Hashtags (máximo ${maxHashtags}, 3 níveis):
   - 2-4 hashtags de MARCA (ex: #${safeCompanyName.toLowerCase().replace(/[^a-z0-9]/g, '')})
   - 4-6 de NICHO intermediário
   - 2-4 de CAUDA LONGA
   - NUNCA usar hashtags banidas

${includeTextOverlay ? `5. Headline Text (OBRIGATÓRIO):
   - Gere um HEADLINE CURTO e IMPACTANTE (máximo 6 palavras)
   - Deve ser em PORTUGUÊS
   - Deve complementar a imagem, não repetir a legenda
   - Exemplos: "Transforme Seu Negócio Hoje", "Aprenda em 5 Minutos", "Promoção Exclusiva Agora"
   ${suggestedText ? `- Sugestão do usuário: "${suggestedText}" (use como inspiração ou adapte)` : ''}
` : ''}

${includeTextOverlay ? '6' : '5'}. Prompt de imagem (ESTRITO):
   - NUNCA inclua texto, logos ou marcas d'água.
   - A imagem deve ser 100% visual/fotográfica.
   - Paleta de cores: ${safeBrandColors.length > 0 ? safeBrandColors.join(', ') : 'moderna e vibrante'}
   - Estilo: ${style}
   - Aspect ratio: ${aspectRatio}
   - Mood: Sensação desejada
   ${postType === 'story' ? '- Vertical (1080x1920)' : '- Quadrado/Retrato'}

${includeTextOverlay ? '7' : '6'}. Alt text: conciso para SEO

${includeTextOverlay ? '8' : '7'}. Rationale: Explicação estratégica

RETORNE UM JSON VÁLIDO com este formato EXATO:
{
  "variations": [
    {
      "variant": "A",
      "caption": "legenda com hook + conteúdo + CTA",
      "hashtags": ["#tag1", "#tag2"],
      ${includeTextOverlay ? '"headlineText": "Texto Curto Impactante",' : ''}
      "imagePrompt": {
        "description": "descrição detalhada em INGLÊS para melhor geração",
        "colors": ["cor1", "cor2"],
        "style": "${style}",
        "aspectRatio": "${aspectRatio}",
        "elements": ["elemento1", "elemento2"],
        "mood": "sensação desejada"
      },
      "altText": "texto alternativo conciso",
      "rationale": "explicação estratégica"
    },
    {
      "variant": "B",
      ...
    }
  ],
  "metadata": {
    "objective": "${objective}",
    "tone": "${tone}",
    "postType": "${postType}",
    "requiresReview": false,
    "reviewReason": null
  }
}`;

    const userPrompt = `
Empresa: ${companyName || 'empresa'}
Público-alvo: ${targetAudience || 'geral'}
Palavras-chave: (keywords || []).join(', ') || 'inovação, qualidade'}

OBJETIVO: ${objective}
TEMA: ${safeTheme}
${cta ? `CTA SUGERIDA: ${cta}` : ''}

Gere 2 variações otimizadas (A/B) com legendas, hashtags E prompts de imagem DETALHADOS.
`;

    // Construct Gemini structure
    const geminiPayload = {
      contents: [
        {
          role: "user",
          parts: [{ text: systemPrompt + "\n\n" + userPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 4000,
        responseMimeType: "application/json"
      }
    };

    console.log('Calling Google Gemini API (Model: gemini-2.5-flash)...');
    // Using gemini-2.5-flash which is a valid new model
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiPayload),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Gemini API error:', aiResponse.status, errorText);
      throw new Error(`Gemini API error: ${aiResponse.status} ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('Gemini response não contém conteúdo válido');
    }

    console.log('Gemini response content received');

    // Parse JSON
    let result;
    try {
      // Extrair JSON do markdown se necessário
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      result = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      throw new Error('Falha ao processar resposta da IA');
    }

    // Generate images using Pollinations.ai (Free, High Quality with Flux)
    console.log('Generating images with Pollinations.ai (Flux)...');
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    for (const variation of result.variations) {
      try {
        const promptDesc = variation.imagePrompt?.description || 'Professional Instagram post';
        const promptStyle = variation.imagePrompt?.style || style || 'photography';
        // Optimize prompt for Flux
        const finalPrompt = encodeURIComponent(`${promptDesc}, ${promptStyle} style, high quality, 4k, photorealistic, sharp focus`);

        // Determine dimensions
        const width = postType === 'story' ? 1080 : 1080;
        const height = postType === 'story' ? 1920 : 1080;

        // Use 'flux-realism' model for better quality (simulating high-end generator)
        const imageUrl = `https://image.pollinations.ai/prompt/${finalPrompt}?width=${width}&height=${height}&nologo=true&model=flux-realism&seed=${Math.floor(Math.random() * 10000)}`;

        console.log(`Fetching image from Pollinations (Flux) for variant ${variation.variant}: ${imageUrl}`);

        // Download and upload to Supabase Storage
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Pollinations API error: ${imageResponse.status}`);
        }

        const blob = await imageResponse.blob();
        const arrayBuffer = await blob.arrayBuffer();
        let binaryData = new Uint8Array(arrayBuffer);

        // Apply text overlay if requested and headline exists
        if (includeTextOverlay && variation.headlineText) {
          try {
            console.log(`Applying text overlay: "${variation.headlineText}" at position: ${textPosition}`);

            // Use Deno's Canvas API (requires --unstable flag)
            // For now, we'll skip Canvas rendering in Edge Function and handle it client-side
            // This is a placeholder for future server-side implementation

            // Alternative: Store headline metadata for client-side rendering
            variation.textOverlay = {
              text: variation.headlineText,
              position: textPosition
            };
          } catch (textError: any) {
            console.error('Failed to apply text overlay:', textError);
            // Continue without text overlay
          }
        }

        const fileName = `${crypto.randomUUID()}.png`;
        const filePath = `${userId || 'anonymous'}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabaseClient
          .storage
          .from('generated-images')
          .upload(filePath, binaryData, {
            contentType: 'image/png',
            upsert: false
          });

        if (uploadError) {
          console.error('Storage upload error, falling back to direct URL:', uploadError);
          variation.imageUrl = imageUrl;
        } else {
          const { data: urlData } = supabaseClient
            .storage
            .from('generated-images')
            .getPublicUrl(filePath);
          variation.imageUrl = urlData.publicUrl;
        }

        // Mark for client-side logo composition if requested
        if (includeLogo && logoUrl) {
          variation.logoUrl = logoUrl;
          variation.needsLogoComposition = true;
        }

      } catch (imageError: any) {
        console.error(`Failed to generate image for variant ${variation.variant}:`, imageError);
        variation.imageUrl = null;
        variation.imageError = 'Falha na geração de imagem';
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in generate-post function:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Erro ao gerar post',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

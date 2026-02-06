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
Palavras-chave: ${(keywords || []).join(', ') || 'inovação, qualidade'}

OBJETIVO: ${objective}
TEMA: ${safeTheme}
${cta ? `CTA SUGERIDA: ${cta}` : ''}

Gere 2 variações otimizadas (A/B) com legendas, hashtags E prompts de imagem DETALHADOS.
`;

    console.log('Parameters validated. Preparing Gemini payload...');
    const geminiPayload = {
      contents: [
        {
          role: "user",
          parts: [{ text: systemPrompt + "\n\n" + userPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 2000,
        responseMimeType: "application/json"
      }
    };

    console.log('Calling Google Gemini API (Model: gemini-2.0-flash)...');
    // Using gemini-2.0-flash as it was verified in diagnostics
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: geminiPayload.contents,
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 4000,
          responseMimeType: "application/json"
        }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Gemini API error:', aiResponse.status, errorText);

      let friendlyError = `Erro na IA (${aiResponse.status}): ${errorText.substring(0, 100)}`;
      if (aiResponse.status === 429) {
        friendlyError = "IA ocupada (Limite atingido). Tente novamente em 1 minuto.";
      }
      throw new Error(friendlyError);
    }

    const aiData = await aiResponse.json();
    const content = aiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      console.error('Empty Gemini content. Full data:', JSON.stringify(aiData));
      return new Response(JSON.stringify({
        error: 'A IA retornou um conteúdo vazio',
        variations: []
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Gemini response content received successfully');

    // Parse JSON
    let result;
    try {
      // Extrair JSON do markdown se necessário
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      result = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      console.error('Content that failed to parse:', content);
      return new Response(JSON.stringify({
        error: 'Erro ao processar dados da IA',
        debug_content: content.substring(0, 100),
        variations: []
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate images using Pollinations.ai (Free, High Quality with Flux)
    console.log('Generating images with Pollinations.ai...');
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    for (const variation of result.variations) {
      try {
        const promptDesc = variation.imagePrompt?.description || 'Professional Instagram post';
        const promptStyle = variation.imagePrompt?.style || style || 'photography';

        // LIMIT PROMPT LENGTH to prevent 414/Long URL issues
        const truncatedPrompt = promptDesc.substring(0, 200);
        const finalPrompt = encodeURIComponent(`${truncatedPrompt}, ${promptStyle} style, high quality`);

        const width = postType === 'story' ? 1080 : 1080;
        const height = postType === 'story' ? 1920 : 1080;

        const pollinationUrl = `https://image.pollinations.ai/prompt/${finalPrompt}?width=${width}&height=${height}&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;

        // Final fallback: Guaranteed working Unsplash source
        const searchTerms = variation.imagePrompt?.elements?.join(',') || variation.altText || 'business';
        const hardFallbackUrl = `https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=${width}&h=${height}&fit=crop`; // Stable laptop on desk
        const dynamicFallbackUrl = `https://loremflickr.com/${width}/${height}/${encodeURIComponent(searchTerms)}?lock=${Math.floor(Math.random() * 1000)}`;

        console.log(`Generating images for variant ${variation.variant}...`);

        let imageResponse;
        let successfulUrl = pollinationUrl;

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
          imageResponse = await fetch(pollinationUrl, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (!imageResponse.ok) throw new Error(`Pollinations error: ${imageResponse.status}`);
        } catch (e) {
          console.warn(`Pollinations failed, trying LoremFlickr...`);
          successfulUrl = dynamicFallbackUrl;
          try {
            imageResponse = await fetch(successfulUrl);
          } catch (e2) {
            console.error('All fetch attempts failed in Edge Function');
          }
        }

        // Processing Storage
        if (imageResponse && imageResponse.ok) {
          try {
            const blob = await imageResponse.blob();
            const rawContentType = imageResponse.headers.get('content-type') || 'image/png';
            const contentType = rawContentType.split(';')[0].trim();
            const extension = contentType.split('/')[1] || 'png';

            const arrayBuffer = await blob.arrayBuffer();
            const binaryData = new Uint8Array(arrayBuffer);

            const fileName = `${crypto.randomUUID()}.${extension}`;
            const filePath = `${userId || 'anonymous'}/${fileName}`;

            const { error: uploadError } = await supabaseClient
              .storage
              .from('generated-images')
              .upload(filePath, binaryData, {
                contentType: contentType,
                cacheControl: '3600'
              });

            if (!uploadError) {
              const { data: urlData } = supabaseClient.storage.from('generated-images').getPublicUrl(filePath);
              variation.supabaseUrl = urlData.publicUrl;
              variation.storagePath = filePath;
            } else {
              console.error('Storage upload failed:', uploadError);
              variation.supabaseUrl = hardFallbackUrl; // Backup link even on storage error
            }
          } catch (e) {
            console.error('Processing error:', e);
            variation.supabaseUrl = hardFallbackUrl;
          }
        } else {
          variation.supabaseUrl = hardFallbackUrl;
        }

        // ALWAYS ensure imageUrl is a working link
        variation.imageUrl = successfulUrl || hardFallbackUrl;

        // If supabaseUrl is still empty (highly unlikely now), use the hard fallback
        if (!variation.supabaseUrl) variation.supabaseUrl = hardFallbackUrl;

        // Store headline metadata for client-side rendering
        if (includeTextOverlay && variation.headlineText) {
          variation.textOverlay = {
            text: variation.headlineText,
            position: textPosition
          };
        }

        // Mark for client-side logo composition if requested
        if (includeLogo && logoUrl) {
          variation.logoUrl = logoUrl;
          variation.needsLogoComposition = true;
        }

      } catch (err: any) {
        console.error(`Serious error in generation loop for variant ${variation.variant}:`, err);
        variation.imageUrl = `https://loremflickr.com/1080/1080/business?random=${Math.random()}`;
        variation.imageError = err.message;
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

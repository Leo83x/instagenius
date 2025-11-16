import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get company profile
    const { data: profile, error: profileError } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `Você é um especialista em marketing de conteúdo e estratégia de redes sociais. 
Baseado no perfil da empresa fornecido, sugira 5 temas de conteúdo estratégicos e relevantes.

Para cada tema, forneça:
- theme_name: Nome criativo e atrativo do tema
- description: Descrição detalhada do tema (2-3 frases)
- category: Uma das seguintes: "Conteúdo Educativo", "Promoções", "Engajamento", "Bastidores", "Dicas"
- frequency: Uma das seguintes: "daily", "weekly", "biweekly", "monthly"
- suggested_hashtags: Array de 5-8 hashtags relevantes (inclua # no início)

Considere o público-alvo, nicho de mercado, tom de voz e palavras-chave da empresa para criar sugestões personalizadas e efetivas.`;

    const userPrompt = `Perfil da Empresa:
- Nome: ${profile.company_name}
- Categoria: ${profile.category || 'Não especificada'}
- Bio: ${profile.bio || 'Não especificada'}
- Tom de Voz: ${profile.default_tone || 'professional'}
- Público-Alvo: ${profile.target_audience || 'Não especificado'}
- Palavras-chave: ${profile.keywords?.join(', ') || 'Nenhuma'}

Gere 5 temas de conteúdo personalizados para esta empresa.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'suggest_themes',
            description: 'Retorna 5 sugestões de temas de conteúdo',
            parameters: {
              type: 'object',
              properties: {
                themes: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      theme_name: { type: 'string' },
                      description: { type: 'string' },
                      category: { 
                        type: 'string',
                        enum: ['Conteúdo Educativo', 'Promoções', 'Engajamento', 'Bastidores', 'Dicas']
                      },
                      frequency: { 
                        type: 'string',
                        enum: ['daily', 'weekly', 'biweekly', 'monthly']
                      },
                      suggested_hashtags: {
                        type: 'array',
                        items: { type: 'string' }
                      }
                    },
                    required: ['theme_name', 'description', 'category', 'frequency', 'suggested_hashtags']
                  }
                }
              },
              required: ['themes']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'suggest_themes' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de taxa excedido. Tente novamente mais tarde.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos ao seu workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'Erro ao gerar sugestões' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const themesData = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ suggestions: themesData.themes }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in suggest-themes:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
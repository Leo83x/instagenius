import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch historical posts with analytics
    const { data: posts } = await supabase
      .from("generated_posts")
      .select("id, theme, caption, post_type, tone, style, objective, hashtags, created_at, post_analytics(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    // Get recent draft posts for prediction
    const { data: drafts } = await supabase
      .from("generated_posts")
      .select("id, theme, caption, post_type, tone, style, objective, hashtags")
      .eq("user_id", user.id)
      .eq("status", "draft")
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: profile } = await supabase
      .from("company_profiles")
      .select("company_name, category, target_audience")
      .eq("user_id", user.id)
      .maybeSingle();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const historicalPosts = (posts || []).map(p => ({
      id: p.id,
      theme: p.theme,
      caption: p.caption?.substring(0, 100),
      type: p.post_type,
      tone: p.tone,
      style: p.style,
      objective: p.objective,
      hashtags_count: p.hashtags?.length || 0,
      analytics: p.post_analytics?.[0] ? {
        likes: p.post_analytics[0].likes_count,
        comments: p.post_analytics[0].comments_count,
        reach: p.post_analytics[0].reach,
        engagement_rate: p.post_analytics[0].engagement_rate
      } : null
    }));

    const draftPosts = (drafts || []).map(d => ({
      id: d.id,
      theme: d.theme,
      caption: d.caption?.substring(0, 100),
      type: d.post_type,
      tone: d.tone,
      style: d.style,
      objective: d.objective,
      hashtags_count: d.hashtags?.length || 0
    }));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em analytics preditivo para Instagram. Analise o histórico de posts e preveja a performance dos posts em draft.

REGRAS:
- Use os dados de analytics históricos para criar um modelo de previsão
- Considere: tipo de post, tom, estilo, tema, quantidade de hashtags
- Se não houver dados de analytics suficientes, use benchmarks do mercado
- Forneça previsões com percentual de confiança
- Identifique fatores positivos e negativos para cada previsão
- Dê recomendações actionáveis`
          },
          {
            role: "user",
            content: `Empresa: ${profile?.company_name || "N/A"} | Categoria: ${profile?.category || "N/A"}

Histórico de posts com analytics: ${JSON.stringify(historicalPosts)}

Posts em draft para previsão: ${JSON.stringify(draftPosts)}

Analise e preveja a performance de cada draft.`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "predict_performance",
            description: "Retorna previsões de performance para posts",
            parameters: {
              type: "object",
              properties: {
                predictions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      post_id: { type: "string" },
                      post_caption: { type: "string" },
                      post_theme: { type: "string" },
                      predicted_engagement_rate: { type: "number" },
                      predicted_reach: { type: "number" },
                      performance_vs_average: { type: "string", description: "Ex: 20% acima da média" },
                      confidence: { type: "number" },
                      factors: {
                        type: "object",
                        properties: {
                          positive: { type: "array", items: { type: "string" } },
                          negative: { type: "array", items: { type: "string" } }
                        },
                        required: ["positive", "negative"]
                      },
                      recommendation: { type: "string" }
                    },
                    required: ["post_id", "post_caption", "post_theme", "predicted_engagement_rate", "predicted_reach", "performance_vs_average", "confidence", "factors", "recommendation"]
                  }
                },
                summary: {
                  type: "object",
                  properties: {
                    average_predicted_engagement: { type: "number" },
                    best_performing_type: { type: "string" },
                    best_performing_tone: { type: "string" },
                    overall_trend: { type: "string" },
                    insights: { type: "array", items: { type: "string" } }
                  },
                  required: ["average_predicted_engagement", "best_performing_type", "best_performing_tone", "overall_trend", "insights"]
                }
              },
              required: ["predictions", "summary"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "predict_performance" } }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      if (response.status === 429) return new Response(JSON.stringify({ error: "Limite de taxa excedido." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Créditos insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI API error");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

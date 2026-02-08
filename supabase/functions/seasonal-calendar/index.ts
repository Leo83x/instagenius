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

    const { data: profile } = await supabase
      .from("company_profiles")
      .select("company_name, category, target_audience, keywords")
      .eq("user_id", user.id)
      .maybeSingle();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const today = new Date().toISOString().split("T")[0];

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
            content: `Você é um especialista em marketing de conteúdo brasileiro. Gere um calendário de datas comemorativas e sazonais relevantes para a empresa.

REGRAS:
- Considere APENAS datas dos próximos 60 dias a partir de hoje (${today})
- Inclua datas nacionais brasileiras, datas comerciais e datas do nicho da empresa
- Para cada data, sugira 2-3 ideias concretas de posts
- Ordene por proximidade (mais próximas primeiro)
- Inclua o campo days_until calculado a partir de hoje
- Formato de data: DD/MM/YYYY`
          },
          {
            role: "user",
            content: `Data de hoje: ${today}
Empresa: ${profile?.company_name || "N/A"}
Categoria: ${profile?.category || "Geral"}  
Público-alvo: ${profile?.target_audience || "Geral"}
Palavras-chave: ${profile?.keywords?.join(", ") || "N/A"}

Gere as próximas 8-10 datas comemorativas relevantes para esta empresa.`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "seasonal_dates",
            description: "Retorna datas comemorativas com ideias de posts",
            parameters: {
              type: "object",
              properties: {
                dates: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      date: { type: "string", description: "Data no formato DD/MM/YYYY" },
                      name: { type: "string", description: "Nome da data comemorativa" },
                      description: { type: "string", description: "Breve descrição da relevância" },
                      category: { type: "string", description: "Categoria: Nacional, Comercial, Nicho" },
                      days_until: { type: "number", description: "Dias até a data" },
                      post_ideas: {
                        type: "array",
                        items: { type: "string" },
                        description: "2-3 ideias de posts"
                      }
                    },
                    required: ["date", "name", "description", "category", "days_until", "post_ideas"]
                  }
                }
              },
              required: ["dates"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "seasonal_dates" } }
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

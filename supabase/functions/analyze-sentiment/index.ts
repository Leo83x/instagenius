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

    // Get user's Instagram token
    const { data: profile } = await supabase
      .from("company_profiles")
      .select("instagram_access_token, instagram_user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile?.instagram_access_token || !profile?.instagram_user_id) {
      return new Response(JSON.stringify({ error: "Conecte sua conta do Instagram primeiro" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch recent media from Instagram
    const mediaResponse = await fetch(
      `https://graph.instagram.com/v20.0/${profile.instagram_user_id}/media?fields=id,caption,comments_count,timestamp&limit=10&access_token=${profile.instagram_access_token}`
    );

    if (!mediaResponse.ok) {
      const errData = await mediaResponse.json();
      console.error("Instagram API error:", errData);
      return new Response(JSON.stringify({ error: "Erro ao acessar dados do Instagram" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mediaData = await mediaResponse.json();
    const posts = mediaData.data || [];

    // Fetch comments for each post
    const postsWithComments = [];
    for (const post of posts.slice(0, 5)) {
      if (post.comments_count > 0) {
        try {
          const commentsResponse = await fetch(
            `https://graph.instagram.com/v20.0/${post.id}/comments?fields=text,timestamp,username&limit=50&access_token=${profile.instagram_access_token}`
          );
          if (commentsResponse.ok) {
            const commentsData = await commentsResponse.json();
            postsWithComments.push({
              id: post.id,
              caption: post.caption || "",
              comments: (commentsData.data || []).map((c: any) => c.text),
              total: post.comments_count
            });
          }
        } catch (e) {
          console.error(`Error fetching comments for ${post.id}:`, e);
        }
      }
    }

    if (postsWithComments.length === 0) {
      return new Response(JSON.stringify({ 
        error: "Nenhum post com comentários encontrado. Publique conteúdo e receba comentários para analisar." 
      }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

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
            content: `Você é um especialista em análise de sentimento de redes sociais. Analise os comentários dos posts do Instagram e classifique cada um como positivo, negativo ou neutro. Calcule percentuais e identifique tópicos comuns.`
          },
          {
            role: "user",
            content: `Analise os comentários destes posts:\n${JSON.stringify(postsWithComments, null, 2)}`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "sentiment_analysis",
            description: "Retorna análise de sentimento dos comentários",
            parameters: {
              type: "object",
              properties: {
                results: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      post_id: { type: "string" },
                      post_caption: { type: "string" },
                      total_comments: { type: "number" },
                      sentiment: {
                        type: "object",
                        properties: {
                          positive: { type: "number" },
                          negative: { type: "number" },
                          neutral: { type: "number" }
                        },
                        required: ["positive", "negative", "neutral"]
                      },
                      highlights: {
                        type: "object",
                        properties: {
                          best_comment: { type: "string" },
                          worst_comment: { type: "string" },
                          common_topics: { type: "array", items: { type: "string" } }
                        },
                        required: ["best_comment", "worst_comment", "common_topics"]
                      }
                    },
                    required: ["post_id", "post_caption", "total_comments", "sentiment", "highlights"]
                  }
                },
                summary: {
                  type: "object",
                  properties: {
                    overall_sentiment: { type: "string" },
                    total_analyzed: { type: "number" },
                    average_positive: { type: "number" },
                    average_negative: { type: "number" },
                    average_neutral: { type: "number" },
                    recommendations: { type: "array", items: { type: "string" } }
                  },
                  required: ["overall_sentiment", "total_analyzed", "average_positive", "average_negative", "average_neutral", "recommendations"]
                }
              },
              required: ["results", "summary"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "sentiment_analysis" } }
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

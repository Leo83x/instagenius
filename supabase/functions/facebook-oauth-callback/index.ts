import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OAuthCallbackRequest {
  code: string;
  redirectUri: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      throw new Error("Não autorizado");
    }

    const { code, redirectUri } = (await req.json()) as OAuthCallbackRequest;

    const appId = Deno.env.get("FACEBOOK_APP_ID");
    const appSecret = Deno.env.get("FACEBOOK_APP_SECRET");

    if (!appId || !appSecret) {
      throw new Error("Credenciais do Facebook não configuradas no servidor");
    }

    console.log("Exchanging code for access token...");

    // Step 1: Exchange code for access token
    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&client_secret=${appSecret}&code=${code}`;

    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("Token exchange error:", tokenData.error);
      throw new Error(
        tokenData.error.message || "Erro ao obter token de acesso"
      );
    }

    const accessToken = tokenData.access_token;

    console.log("Access token obtained, fetching pages...");

    // Step 2: Get user's Facebook Pages
    const pagesUrl = `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`;
    const pagesResponse = await fetch(pagesUrl);
    const pagesData = await pagesResponse.json();

    if (pagesData.error) {
      console.error("Pages fetch error:", pagesData.error);
      throw new Error(
        pagesData.error.message || "Erro ao buscar páginas do Facebook"
      );
    }

    if (!pagesData.data || pagesData.data.length === 0) {
      throw new Error(
        "Nenhuma página encontrada. Certifique-se de que você tem uma Página do Facebook."
      );
    }

    // Get the first page (user can have multiple pages)
    const firstPage = pagesData.data[0];
    const pageAccessToken = firstPage.access_token;
    const pageId = firstPage.id;

    console.log("Page found:", firstPage.name);

    // Step 3: Get Instagram Business Account connected to the page
    const igAccountUrl = `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`;
    const igAccountResponse = await fetch(igAccountUrl);
    const igAccountData = await igAccountResponse.json();

    if (igAccountData.error) {
      console.error("Instagram account fetch error:", igAccountData.error);
      throw new Error(
        "Erro ao buscar conta do Instagram. Certifique-se de que sua página está conectada a uma conta Instagram Business."
      );
    }

    if (!igAccountData.instagram_business_account) {
      throw new Error(
        "Esta página não está conectada a uma conta Instagram Business. Por favor, conecte uma conta Instagram Business à sua página do Facebook."
      );
    }

    const instagramUserId = igAccountData.instagram_business_account.id;

    console.log("Instagram Business Account ID:", instagramUserId);

    // Step 4: Get Instagram username for confirmation
    const igUsernameUrl = `https://graph.facebook.com/v18.0/${instagramUserId}?fields=username&access_token=${pageAccessToken}`;
    const igUsernameResponse = await fetch(igUsernameUrl);
    const igUsernameData = await igUsernameResponse.json();

    const instagramUsername = igUsernameData.username || "unknown";

    console.log("Instagram username:", instagramUsername);

    // Step 5: Request long-lived token (60 days)
    const longLivedTokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${pageAccessToken}`;
    const longLivedResponse = await fetch(longLivedTokenUrl);
    const longLivedData = await longLivedResponse.json();

    const finalAccessToken = longLivedData.access_token || pageAccessToken;
    const expiresIn = longLivedData.expires_in; // Usually 5184000 seconds (60 days)

    console.log("Long-lived token obtained, expires in:", expiresIn, "seconds");

    // Step 6: Save to database
    const { data: existingProfile } = await supabaseClient
      .from("company_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    const tokenExpiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : null;

    if (existingProfile) {
      const { error } = await supabaseClient
        .from("company_profiles")
        .update({
          instagram_access_token: finalAccessToken,
          instagram_user_id: instagramUserId,
          facebook_page_id: pageId,
          token_expires_at: tokenExpiresAt,
        })
        .eq("user_id", user.id);

      if (error) throw error;
    } else {
      const { error } = await supabaseClient.from("company_profiles").insert({
        user_id: user.id,
        company_name: "Minha Empresa",
        instagram_access_token: finalAccessToken,
        instagram_user_id: instagramUserId,
        facebook_page_id: pageId,
        token_expires_at: tokenExpiresAt,
      });

      if (error) throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        instagramUsername,
        instagramUserId,
        expiresAt: tokenExpiresAt,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in OAuth callback:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro ao conectar com Instagram",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OAuthCallbackRequest {
  code: string;
  redirectUri: string;
  userId: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, redirectUri, userId } =
      (await req.json()) as OAuthCallbackRequest;

    if (!userId) {
      throw new Error("ID do usuário não fornecido");
    }

    // Use service role to bypass RLS since we receive userId manually
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const appId = Deno.env.get("FACEBOOK_APP_ID");
    const appSecret = Deno.env.get("FACEBOOK_APP_SECRET");

    if (!appId || !appSecret) {
      throw new Error("Credenciais do Facebook não configuradas no servidor");
    }

    console.log("Exchanging code for access token...");

    // Step 1: Exchange code for access token
    const tokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(
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

    console.log("Access token obtained, fetching pages with dual strategy...");

    // Step 2: Get user's Facebook Pages - DUAL SEARCH STRATEGY
    const pagesUrls = [
      // Method 1: Standard accounts endpoint
      `https://graph.facebook.com/v20.0/me/accounts?fields=name,access_token,instagram_business_account{id,username}&access_token=${accessToken}`,
      // Method 2: Nested field on user object (failsafe)
      `https://graph.facebook.com/v20.0/me?fields=accounts{name,access_token,instagram_business_account{id,username}}&access_token=${accessToken}`,
    ];

    let pagesData: any[] | null = null;

    for (const url of pagesUrls) {
      try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Pages response from URL:", url.substring(0, 80), JSON.stringify(data).substring(0, 300));

        // Normalize response depending on which endpoint returned
        if (data.data && data.data.length > 0) {
          pagesData = data.data;
          console.log("Found pages via method 1 (direct):", pagesData.length);
          break;
        } else if (data.accounts?.data && data.accounts.data.length > 0) {
          pagesData = data.accounts.data;
          console.log("Found pages via method 2 (nested):", pagesData.length);
          break;
        }
      } catch (err) {
        console.error("Error fetching pages from:", url.substring(0, 80), err);
      }
    }

    if (!pagesData || pagesData.length === 0) {
      throw new Error(
        "Nenhuma página encontrada. Certifique-se de que você tem uma Página do Facebook e que autorizou todas as permissões."
      );
    }

    // Find the first page with an Instagram Business Account
    let selectedPage: any = null;
    let instagramUserId: string | null = null;
    let instagramUsername: string | null = null;

    for (const page of pagesData) {
      if (page.instagram_business_account?.id) {
        selectedPage = page;
        instagramUserId = page.instagram_business_account.id;
        instagramUsername = page.instagram_business_account.username || null;
        console.log(
          `Found IG Business on page "${page.name}": ID=${instagramUserId}, username=${instagramUsername}`
        );
        break;
      }
    }

    // If no page had IG embedded, try fetching IG for the first page separately
    if (!selectedPage) {
      const firstPage = pagesData[0];
      const pageAccessToken = firstPage.access_token;
      const pageId = firstPage.id;

      console.log(
        `No embedded IG found, checking page "${firstPage.name}" (${pageId}) separately...`
      );

      const igAccountUrl = `https://graph.facebook.com/v20.0/${pageId}?fields=instagram_business_account{id,username}&access_token=${pageAccessToken}`;
      const igAccountResponse = await fetch(igAccountUrl);
      const igAccountData = await igAccountResponse.json();

      if (igAccountData.instagram_business_account?.id) {
        selectedPage = firstPage;
        instagramUserId = igAccountData.instagram_business_account.id;
        instagramUsername =
          igAccountData.instagram_business_account.username || null;
        console.log(
          `Found IG via separate call: ID=${instagramUserId}, username=${instagramUsername}`
        );
      }
    }

    if (!selectedPage || !instagramUserId) {
      throw new Error(
        "Esta página não está conectada a uma conta Instagram Business. Por favor, conecte uma conta Instagram Business à sua página do Facebook."
      );
    }

    const pageAccessToken = selectedPage.access_token;
    const pageId = selectedPage.id;

    // If username wasn't fetched yet, get it
    if (!instagramUsername) {
      try {
        const igUsernameUrl = `https://graph.facebook.com/v20.0/${instagramUserId}?fields=username&access_token=${pageAccessToken}`;
        const igUsernameResponse = await fetch(igUsernameUrl);
        const igUsernameData = await igUsernameResponse.json();
        instagramUsername = igUsernameData.username || "unknown";
      } catch {
        instagramUsername = "unknown";
      }
    }

    console.log("Instagram username:", instagramUsername);

    // Step 3: Request long-lived token (60 days)
    const longLivedTokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${pageAccessToken}`;
    const longLivedResponse = await fetch(longLivedTokenUrl);
    const longLivedData = await longLivedResponse.json();

    const finalAccessToken = longLivedData.access_token || pageAccessToken;
    const expiresIn = longLivedData.expires_in;

    console.log(
      "Long-lived token obtained, expires in:",
      expiresIn,
      "seconds"
    );

    // Step 4: Save to database using service role
    const { data: existingProfile } = await supabaseAdmin
      .from("company_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    const tokenExpiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : null;

    if (existingProfile) {
      const { error } = await supabaseAdmin
        .from("company_profiles")
        .update({
          instagram_access_token: finalAccessToken,
          instagram_user_id: instagramUserId,
          facebook_page_id: pageId,
          token_expires_at: tokenExpiresAt,
        })
        .eq("user_id", userId);

      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from("company_profiles")
        .insert({
          user_id: userId,
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

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

// Helper to extract user ID from JWT without full verification (since verify_jwt is false)
function getUserIdFromAuthHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  try {
    const token = authHeader.split(" ")[1];
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;

    // Base64Url decode payload
    const payloadJson = atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson);
    return payload.sub || null;
  } catch (e) {
    console.error("Error decoding JWT manually:", e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
<<<<<<< HEAD
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
=======
    const body = await req.json();
    const { code, redirectUri: incomingRedirectUri, action } = body;
    let userId = body.userId || body.user_id;
    if (userId === "mock-user-id") userId = null;

    // Use Service Role to bypass RLS and avoid JWT "missing sub" errors
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // --- Action: check_status ---
    if (action === "check_status") {
      console.log("Action: check_status for user:", userId);
      let profile = null;

      // 1. Specific User
      if (userId) {
        const { data } = await supabaseAdmin
          .from("company_profiles")
          .select("user_id, company_name, instagram_user_id, instagram_access_token, token_expires_at")
          .eq("user_id", userId)
          .maybeSingle();
        if (data?.instagram_access_token) profile = data;
      }

      // 2. Any Connected (Fallback)
      if (!profile) {
        const { data: connectedProfiles } = await supabaseAdmin
          .from("company_profiles")
          .select("user_id, company_name, instagram_user_id, instagram_access_token, token_expires_at")
          .not("instagram_access_token", "is", null)
          .order('updated_at', { ascending: false })
          .limit(1);
        if (connectedProfiles && connectedProfiles.length > 0) profile = connectedProfiles[0];
      }

      if (profile) {
        let username = "";
        if (profile.instagram_access_token && profile.instagram_user_id) {
          try {
            const fbUrl = `https://graph.facebook.com/v20.0/${profile.instagram_user_id}?fields=username&access_token=${profile.instagram_access_token}`;
            const fbRes = await fetch(fbUrl);
            const fbData = await fbRes.json();
            if (fbData.username) username = fbData.username;
          } catch (e) {
            console.error("Error fetching username in status check:", e);
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            connected: !!profile.instagram_access_token,
            instagramUserId: profile.instagram_user_id,
            instagramUsername: username,
            expiresAt: profile.token_expires_at
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, connected: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Original OAuth Flow ---
    const redirectUri = "https://instagenius.convertamais.online/instagram";
    console.log("Receiving OAuth flow for code:", code?.substring(0, 10) + "...");
    console.log("Using Redirect URI for exchange:", redirectUri);
    console.log("Incoming Redirect URI from frontend (for debug):", incomingRedirectUri);

    const authHeader = req.headers.get("Authorization");

    // 1. Fallback: Try to get userId from Authorization header
    if (!userId && authHeader) {
      userId = getUserIdFromAuthHeader(authHeader);
    }


    // 2. Mandatory Fallback for No-Login/Demo Mode:
    // If still no userId, just use the primary profile in the database.
    if (!userId) {
      console.log("No userId identified. Searching for first available profile...");
      const { data: profiles } = await supabaseAdmin
        .from("company_profiles")
        .select("user_id, company_name")
        .limit(2); // Take a few to check

      if (profiles && profiles.length > 0) {
        // Preference for Marco Lopez, but otherwise just take the first one
        const marco = profiles.find(p => p.company_name?.toLowerCase().includes("marco"));
        userId = marco ? marco.user_id : profiles[0].user_id;
        console.log(`Fallback Success: Identified user as ${marco ? "Marco" : "Primary Account"} (${userId})`);
      }
    }

    if (!userId) {
      throw new Error("Não foi possível identificar sua conta. Certifique-se de que o Perfil da Empresa (Company Profile) está configurado no banco de dados.");
    }

    console.log("Processing Instagram OAuth for User:", userId);
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6

    const appId = Deno.env.get("FACEBOOK_APP_ID");
    const appSecret = Deno.env.get("FACEBOOK_APP_SECRET");

    if (!appId || !appSecret) {
      throw new Error("Configuração do Facebook incompleta no servidor.");
    }

    console.log("Exchanging code for access token...");

    // Step 1: Exchange code for access token
    const tokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&client_secret=${appSecret}&code=${code}`;

    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("Token exchange error:", JSON.stringify(tokenData.error));
      throw new Error(
        `Erro no Facebook: ${tokenData.error.message || "Erro ao obter token de acesso"}. URI enviada: ${redirectUri}`
      );
    }

    const accessToken = tokenData.access_token;

<<<<<<< HEAD
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
=======
    console.log("Access token obtained. Checking permissions...");

    // Step 2: Get user's Facebook Pages with Instagram info (Recursive Mode)...
    console.log("Fetching pages and linked Instagram accounts (Recursive Mode)...");

    // Try multiple ways to get accounts
    const pagesUrls = [
      `https://graph.facebook.com/v20.0/me/accounts?fields=name,access_token,instagram_business_account{id,username}&access_token=${accessToken}`,
      `https://graph.facebook.com/v20.0/me?fields=accounts{name,access_token,instagram_business_account{id,username}}&access_token=${accessToken}`
    ];

    let pagesData: any = null;
    for (const url of pagesUrls) {
      const response = await fetch(url);
      const data = await response.json();
      if (data.data || (data.accounts && data.accounts.data)) {
        pagesData = data.data || data.accounts.data;
        console.log(`Successfully fetched accounts from: ${url}`);
        break;
      }
    }

    if (!pagesData || pagesData.length === 0) {
      // If still no data, check for errors or empty list
      const rawResponse = await fetch(pagesUrls[0]);
      const rawData = await rawResponse.json();
      console.error("Discovery failed. Raw response:", JSON.stringify(rawData));

      const debugUrl = `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${appId}|${appSecret}`;
      const debugResponse = await fetch(debugUrl);
      const debugData = await debugResponse.json();
      const scopes = debugData.data?.scopes || [];
      const granularScopes = debugData.data?.granular_scopes || [];

      // Return the RAW info to the user so they can see exactly what Facebook said
      throw new Error(`DEBUG INFO:
        Status do Facebook: "Sucesso" (Token válido)
        Páginas encontradas: 0 (Zero)
        
        Resposta Bruta do Facebook (/me/accounts):
        ${JSON.stringify(rawData, null, 2)}
        
        Permissões do Token:
        ${JSON.stringify(scopes)}

        Escopos Granulares (Importante):
        ${JSON.stringify(granularScopes, null, 2)}
        
        Ajuda: Se o array "data" acima estiver vazio [], isso confirma que o Facebook não está enviando nenhuma página para este App/Usuário.
        
        Verifique "Escopos Granulares" acima: se "target_ids" estiver vazio para "pages_show_list", você não autorizou nenhuma página específica.
        
        ${!scopes.includes("business_management") ? '⚠️ ALERTA CRÍTICO: A permissão "business_management" NÃO foi concedida. Se sua página é gerenciada por um Gerenciador de Negócios (Business Manager), esta permissão é OBRIGATÓRIA para visualizar a página. Verifique se o App está em modo Live e sem análise, ou se você desmarcou essa permissão no login.' : ''}`);
    }

    // Step 3: Extract Instagram Info
    let instagramUserId = null;
    let instagramUsername = null;
    let pageId = null;
    let finalAccessToken = accessToken;

    console.log(`System detected ${pagesData.length || 0} pages.`);

    for (const page of pagesData) {
      console.log(`Checking page: ${page.name} (${page.id})`);

      if (page.instagram_business_account) {
        instagramUserId = page.instagram_business_account.id;
        instagramUsername = page.instagram_business_account.username;
        pageId = page.id;
        finalAccessToken = page.access_token;
        console.log(`Found IG Account: ${instagramUsername}`);
        break;
      }
    }

    if (!instagramUserId) {
      const detectedPages = pagesData.map((p: any) => p.name).join(", ") || "Nenhuma";
      throw new Error(`Páginas encontradas: [${detectedPages}]. No entanto, nenhuma delas tem um Instagram Business vinculado nas configurações do Facebook. Verifique o vínculo no Gerenciador de Negócios.`);
    }

    // Exchange for long-lived if we have a page token
    if (pageId && finalAccessToken !== accessToken) {
      const longLivedUrl = `https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${finalAccessToken}`;
      const longLivedResponse = await fetch(longLivedUrl);
      const longLivedData = await longLivedResponse.json();
      finalAccessToken = longLivedData.access_token || finalAccessToken;
    }

    // Step 5: Save to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);
    const tokenExpiresAt = expiresAt.toISOString();

>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
    const { data: existingProfile } = await supabaseAdmin
      .from("company_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

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
<<<<<<< HEAD
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
=======
      const { error } = await supabaseAdmin.from("company_profiles").insert({
        user_id: userId,
        company_name: "Minha Empresa",
        instagram_access_token: finalAccessToken,
        instagram_user_id: instagramUserId,
        facebook_page_id: pageId,
        token_expires_at: tokenExpiresAt,
      });
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6

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
    console.error("Critical error in OAuth callback:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro desconhecido ao conectar com Instagram",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

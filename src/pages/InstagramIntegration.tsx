import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Instagram, CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/Header";

export default function InstagramIntegration() {
  const navigate = useNavigate();
  const location = useLocation();
  const [accessToken, setAccessToken] = useState("");
  const [instagramUserId, setInstagramUserId] = useState("");
  const [instagramUsername, setInstagramUsername] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [useOAuth, setUseOAuth] = useState(true); // Default to OAuth flow

  useEffect(() => {
    checkConnection();
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    // Check if we're returning from OAuth
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    const error = params.get("error");
    const errorDescription = params.get("error_description");

    if (error) {
      console.error("OAuth error:", error, errorDescription);
<<<<<<< HEAD
      toast.error(errorDescription || "Authentication error with Facebook");
=======
      // Show full details if available
      toast.error(errorDescription || "Facebook authentication error", {
        duration: 10000, // Show for longer
        style: {
          whiteSpace: 'pre-wrap', // Preserve line breaks
          textAlign: 'left'
        }
      });
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
      navigate("/instagram", { replace: true });
      return;
    }

    if (code) {
      setLoading(true);

      try {
<<<<<<< HEAD
        const redirectUri = `${window.location.origin}${window.location.pathname}`;

        // Get user ID to pass manually (avoids JWT conflicts)
        const { data: { user } } = await supabase.auth.getUser();
=======
        // Log user status for debugging "Não autorizado"
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        console.log("Current user before invoke:", user?.id);

        const redirectUri = `${window.location.origin}/instagram`;
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6

        const { data, error } = await supabase.functions.invoke(
          "facebook-oauth-callback",
          {
<<<<<<< HEAD
            body: { code, redirectUri, userId: user?.id || null },
            // CORREÇÃO CRÍTICA: headers vazios para evitar conflito de JWT
            headers: {},
=======
            body: {
              code,
              redirectUri,
              userId: user?.id || null
            },
            headers: {}, // This prevents the client from automatically adding the Auth header which causes the "missing sub claim" error
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
          }
        );

        if (error) throw error;

        if (data.success) {
          toast.success(`Instagram connected! Account: @${data.instagramUsername}`);
          setIsConnected(true);
          setInstagramUsername(data.instagramUsername);
          setInstagramUserId(data.instagramUserId);
          setTokenExpiresAt(data.expiresAt);
          navigate("/instagram", { replace: true });
        } else {
          throw new Error(data.error || "Connection error");
        }
      } catch (error: any) {
        console.error("OAuth callback error:", error);
<<<<<<< HEAD
        toast.error(error.message || "Error completing authentication");
=======
        toast.error(error.message || "Error completing authentication", {
          duration: 15000,
          style: {
            whiteSpace: 'pre-wrap',
            textAlign: 'left',
            maxWidth: '500px'
          }
        });
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
        navigate("/instagram", { replace: true });
      } finally {
        setLoading(false);
      }
    }
  };

  const checkConnection = async () => {
    try {
      console.log("Checking connection status via direct DB query (RLS enabled)...");
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user) {
        console.log("No authenticated user found. Waiting for session...");
        return;
      }

      const { data, error } = await supabase
        .from("company_profiles")
        .select("instagram_access_token, instagram_user_id, token_expires_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      console.log("Connection data from DB:", data);

      if (data?.instagram_access_token && data?.instagram_user_id) {
        setIsConnected(true);
        setInstagramUserId(data.instagram_user_id);
        setTokenExpiresAt(data.token_expires_at);

<<<<<<< HEAD
        // Fetch username from Instagram API
=======
        // Fetch username from Instagram API to show on UI
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
        try {
          const response = await fetch(
            `https://graph.facebook.com/v20.0/${data.instagram_user_id}?fields=username&access_token=${data.instagram_access_token}`
          );
          const userData = await response.json();
          if (userData.username) {
            setInstagramUsername(userData.username);
          }
        } catch (err) {
          console.error("Error fetching username from Instagram:", err);
        }
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error("Error checking connection:", error);
      // Fallback: If function fails, try client-side check (though less reliable due to RLS)
      // verifyClientSideConnection();
    }
  };

  const startOAuthFlow = () => {
<<<<<<< HEAD
    const appId = "1590532242091370";

    const redirectUri = `${window.location.origin}/instagram`;
    const scope = "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,business_management";

    const oauthUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scope}&response_type=code&auth_type=rerequest`;

    window.location.href = oauthUrl;
=======
    // REAL FLOW with App ID
    const appId = "1590532242091370"; // New Business App (Dev Mode)

    if (appId) {
      const redirectUri = "https://instagenius.convertamais.online/instagram";
      const scope = "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,business_management";

      // Fixed: Added auth_type=rerequest to force Facebook to ask for permissions again
      const oauthUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&scope=${scope}&response_type=code&auth_type=rerequest`;

      window.location.href = oauthUrl;
      return;
    }
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
  };

  const refreshToken = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "refresh-instagram-token"
      );

      if (error) throw error;

      if (data.success) {
        setTokenExpiresAt(data.expiresAt);
        toast.success(data.message);
        await checkConnection();
      } else {
<<<<<<< HEAD
        throw new Error(data.error || "Error renewing token");
      }
    } catch (error: any) {
      console.error("Token refresh error:", error);
      toast.error(error.message || "Error renewing token");
=======
        throw new Error(data.error || "Error refreshing token");
      }
    } catch (error: any) {
      console.error("Token refresh error:", error);
      toast.error((error as any).message || "Error refreshing token");
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
    } finally {
      setRefreshing(false);
    }
  };

  const testConnection = async () => {
    if (!accessToken || !instagramUserId) {
      toast.error("Please fill in all fields");
<<<<<<< HEAD
      return;
=======
      return false; // Return false if fields are empty
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
    }

    setTesting(true);
    try {
      // Validação rápida de formato/tipo de token
      if (accessToken.startsWith("IG") || accessToken.startsWith("IGQV")) {
        throw new Error(
          "This token seems to be from Instagram Basic Display (starts with IG/IGQV). To publish, generate a User Access Token from Facebook Graph (usually starts with EAA) with permissions instagram_basic, pages_show_list, and instagram_content_publish."
        );
      }

      // Testar o token fazendo uma requisição simples à API do Instagram
      const testUrl = `https://graph.facebook.com/v20.0/${instagramUserId}?fields=id,username&access_token=${accessToken}`;
      const response = await fetch(testUrl);
      const data = await response.json();

      if (data.error) {
        if (
          typeof data.error.message === "string" &&
          data.error.message.toLowerCase().includes("cannot parse access token")
        ) {
          throw new Error(
<<<<<<< HEAD
            "Access Token rejected. Generate a valid User Access Token (EAA...) from Facebook Graph for the user who manages the Page linked to Instagram Business."
=======
            "Access Token rejected. Generate a valid User Access Token (EAA...) from Facebook Graph for the user who administers the Page linked to Instagram Business."
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
          );
        }
        if (data.error.code === 100 && data.error.error_subcode === 33) {
          throw new Error(
<<<<<<< HEAD
            "Invalid Instagram User ID or missing permissions. Ensure that:\n1. The ID provided is the Instagram Business Account ID (not the numeric username)\n2. The token has permission to access this account\n3. The Instagram account is connected to a Facebook page\n\nSee the instructions above on how to get the correct ID."
          );
        }
        throw new Error(data.error.message || "Invalid token");
=======
            "Invalid Instagram User ID or permissions. Make sure:\n1. The ID provided is the Instagram Business Account ID (not the numeric username)\n2. The token has permission to access this account\n3. The Instagram account is connected to a Facebook Page\n\nSee instructions above on how to get the correct ID."
          );
        }
        throw new Error(data.error.message || "Invalid Token");
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
      }

      toast.success(`Connection validated! Account: @${data.username}`);
      return true;
    } catch (error: any) {
      console.error("Test connection error:", error);
<<<<<<< HEAD
      toast.error(error.message || "Error validating credentials. Check if Access Token and User ID are correct.");
=======
      toast.error((error as any).message || "Error validating credentials. Check if Access Token and User ID are correct.");
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
      return false;
    } finally {
      setTesting(false);
    }
  };

  const handleConnect = async () => {
    if (!accessToken || !instagramUserId) {
      toast.error("Please fill in all fields");
      return;
    }

    // Validar credenciais antes de salvar
    const isValid = await testConnection();
    if (!isValid) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Verificar se já existe um perfil
      const { data: existingProfile } = await supabase
        .from("company_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingProfile) {
        // Atualizar perfil existente
        const { error } = await supabase
          .from("company_profiles")
          .update({
            instagram_access_token: accessToken,
            instagram_user_id: instagramUserId,
          })
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Criar novo perfil
        const { error } = await supabase
          .from("company_profiles")
          .insert({
            user_id: user.id,
            company_name: "My Company",
            instagram_access_token: accessToken,
            instagram_user_id: instagramUserId,
          });

        if (error) throw error;
      }

      toast.success("Instagram connected successfully!");
      setIsConnected(true);
    } catch (error: any) {
      console.error("Error connecting Instagram:", error);
<<<<<<< HEAD
      toast.error(error.message || "Error connecting Instagram");
=======
      toast.error((error as any).message || "Error connecting Instagram");
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      let query = supabase.from("company_profiles").update({
        instagram_access_token: null,
        instagram_user_id: null,
        facebook_page_id: null,
        token_expires_at: null,
      });

      if (user) {
        query = query.eq("user_id", user.id);
      } else {
        // Try mock-user-id first, then fallback to first profile found
        const { data: profiles } = await supabase.from("company_profiles").select("user_id").limit(5);
        const mockProfile = profiles?.find(p => p.user_id === "mock-user-id");
        const targetUserId = mockProfile?.user_id || profiles?.[0]?.user_id;

        if (targetUserId) {
          query = query.eq("user_id", targetUserId);
          console.log(`Disconnecting user: ${targetUserId}`);
        } else {
          throw new Error("Não foi possível encontrar uma conta para desconectar.");
        }
      }

      const { error } = await query;

      if (error) throw error;

      setAccessToken("");
      setInstagramUserId("");
      setInstagramUsername("");
      setTokenExpiresAt(null);
      setIsConnected(false);
<<<<<<< HEAD
=======

>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
      toast.success("Instagram disconnected");
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast.error("Error disconnecting Instagram");
    }
  };

  const isTokenExpiringSoon = () => {
    if (!tokenExpiresAt) return false;
    const expiryDate = new Date(tokenExpiresAt);
    const daysUntilExpiry = (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry < 7; // Less than 7 days
  };

  const isTokenExpired = () => {
    if (!tokenExpiresAt) return false;
    return new Date(tokenExpiresAt) < new Date();
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <div className="container py-8 max-w-2xl">
=======
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
              <Instagram className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Instagram Integration</h1>
              <p className="text-sm text-muted-foreground">
                Connect your account to publish automatically
              </p>
            </div>
          </div>

          {isConnected ? (
            <div className="space-y-6">
              <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-500">
                    Instagram connected successfully
                  </p>
                  {instagramUsername && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Account: @{instagramUsername}
                    </p>
                  )}
                </div>
              </div>

              {isTokenExpired() && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
<<<<<<< HEAD
                    Your token has expired! Click "Renew Token" or reconnect your account.
=======
                    Your token has expired! Click "Refresh Token" or reconnect your account.
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                  </AlertDescription>
                </Alert>
              )}

              {!isTokenExpired() && isTokenExpiringSoon() && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
<<<<<<< HEAD
                    Your token expires soon. We recommend renewing now to avoid interruptions.
=======
                    Your token expires soon. We recommend refreshing now to avoid interruptions.
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label>Instagram User ID</Label>
                  <Input value={instagramUserId || "••••••••"} disabled />
                </div>
                {tokenExpiresAt && (
                  <div>
                    <Label>Token expires on</Label>
                    <Input
                      value={new Date(tokenExpiresAt).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                      disabled
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={refreshToken}
                  disabled={refreshing}
                  className="flex-1"
                >
                  {refreshing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
<<<<<<< HEAD
                      Renewing...
=======
                      Refreshing...
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
<<<<<<< HEAD
                      Renew Token
=======
                      Refresh Token
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDisconnect}
                  className="flex-1"
                >
                  Disconnect
                </Button>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
<<<<<<< HEAD
                  💡 <strong>Tip:</strong> Renew your token every 60 days to keep the connection active.
                  The system will alert you when it's close to expiration.
=======
                  💡 <strong>Tip:</strong> Refresh your token every 60 days to keep the connection active.
                  The system will alert you when it is close to expiring.
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* OAuth Flow */}
              {useOAuth ? (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-purple-500/20 rounded-lg space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">Simplified Instagram Connection</h3>
                        <p className="text-sm text-muted-foreground">
                          Connect your Instagram Business account in just 3 clicks, hassle-free!
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 ml-9">
                      <div className="flex items-start gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                          1
                        </div>
                        <p className="text-sm">Click "Connect with Facebook"</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                          2
                        </div>
<<<<<<< HEAD
                        <p className="text-sm">Log in with your Facebook account</p>
=======
                        <p className="text-sm">Login with your Facebook account</p>
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                          3
                        </div>
                        <p className="text-sm">Authorize access to your Page/Instagram Business</p>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
<<<<<<< HEAD
                      <strong>Important:</strong> Your Instagram account must be set as Instagram Business
=======
                      <strong>Important:</strong> Your Instagram account must be configured as Instagram Business
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                      and connected to a Facebook Page. If you haven't done this yet, configure it in:
                      Instagram → Settings → Account → Switch to professional account.
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={startOAuthFlow}
                    disabled={loading}
                    className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Instagram className="h-5 w-5 mr-2" />
                        Connect with Facebook
                      </>
                    )}
                  </Button>

                  <div className="text-center space-y-4">
                    <button
                      onClick={() => setUseOAuth(false)}
                      className="text-xs text-muted-foreground hover:text-foreground underline block w-full"
                    >
                      I prefer to connect manually with tokens
                    </button>

                    <div className="pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">
                        Está com problemas na conexão?
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDisconnect}
                        className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 w-full"
                      >
                        <XCircle className="h-3 w-3 mr-2" />
                        Limpar Dados e Tentar do Zero (Reset)
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Manual Token Flow */
                <div className="space-y-6">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
<<<<<<< HEAD
                      <strong>Warning:</strong> The manual method is more complex and not recommended.
=======
                      <strong>Attention:</strong> The manual method is more complex and not recommended.
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                      Use only if you have technical experience with Facebook APIs.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg space-y-3">
                      <p className="text-sm font-medium">How to get your Instagram Graph API credentials:</p>

                      <div className="space-y-4">
                        <div>
                          <p className="font-semibold text-sm mb-2">📱 Step 1: Prepare your Instagram account</p>
                          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
                            <li>Convert your account to Instagram Business or Creator</li>
                            <li>Connect it to a Facebook Page in Instagram → Settings → Account → Switch to professional account</li>
                          </ul>
                        </div>

                        <div>
                          <p className="font-semibold text-sm mb-2">🔑 Step 2: Create App on Meta for Developers</p>
                          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside ml-2">
                            <li>Access <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">developers.facebook.com/apps</a></li>
<<<<<<< HEAD
                            <li>Click "Create App" → choose type "Business"</li>
=======
                            <li>Click "Create App" → choose "Business" type</li>
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                            <li>In "Add products", add "Instagram Graph API"</li>
                            <li>Go to "Tools" → "Access Token Tool"</li>
                            <li>Select your Page connected to Instagram</li>
                            <li>Check permissions: <code className="text-xs bg-muted px-1 rounded">instagram_basic</code>, <code className="text-xs bg-muted px-1 rounded">instagram_content_publish</code>, <code className="text-xs bg-muted px-1 rounded">pages_show_list</code></li>
                            <li>Click "Generate Token" - copy the generated token (starts with EAA)</li>
                          </ol>
                        </div>

                        <div>
                          <p className="font-semibold text-sm mb-2">🆔 Step 3: Get Instagram Business Account ID</p>
                          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside ml-2">
                            <li>Access <a href="https://business.facebook.com/settings" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">business.facebook.com/settings</a></li>
                            <li>In the left sidebar, click "Accounts" → "Instagram Accounts"</li>
<<<<<<< HEAD
                            <li>Click on your desired Instagram account (e.g. @yourcompanyProfile)</li>
                            <li>Check the <strong>browser URL</strong>. It will be something like:<br /><code className="text-xs bg-muted px-1 py-0.5 rounded block mt-1">business.facebook.com/latest/settings/instagram_account?business_id=...&selected_asset_id=<strong>17841477061462489</strong></code></li>
=======
                            <li>Click on your desired Instagram account (ex: @convertamaisoficial)</li>
                            <li>See the <strong>browser URL</strong>. It will be something like:<br /><code className="text-xs bg-muted px-1 py-0.5 rounded block mt-1">business.facebook.com/latest/settings/instagram_account?business_id=...&selected_asset_id=<strong>17841477061462489</strong></code></li>
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                            <li>Copy only the <strong>long numbers</strong> after <code className="text-xs">selected_asset_id=</code> (usually 17 digits)</li>
                            <li>In the example above, the correct ID would be: <code className="text-xs bg-primary/20 px-1 py-0.5 rounded font-bold">17841477061462489</code></li>
                          </ol>
                        </div>
                      </div>

                      <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
<<<<<<< HEAD
                          <strong>⚠️ Important:</strong> The Instagram Business Account ID is different from your @username. It is a long number you find in Facebook Business Manager. Ensure your Instagram account is connected to a Facebook Page before starting.
=======
                          <strong>⚠️ Important:</strong> The Instagram Business Account ID is different from your @username. It is a long number found in Facebook Business Manager. Make sure your Instagram account is connected to a Facebook Page before starting.
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="accessToken">Access Token *</Label>
                      <Input
                        id="accessToken"
                        type="password"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        placeholder="Paste your access token here"
                      />
                    </div>

                    <div>
                      <Label htmlFor="userId">Instagram User ID *</Label>
                      <Input
                        id="userId"
                        value={instagramUserId}
                        onChange={(e) => setInstagramUserId(e.target.value)}
                        placeholder="Paste your user ID here"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={testConnection}
                      disabled={testing}
                      variant="outline"
                      className="flex-1"
                    >
<<<<<<< HEAD
                      {testing ? "Testing..." : "Test Connection"}
=======
                      {testing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Test Connection
                        </>
                      )}
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                    </Button>
                    <Button
                      onClick={handleConnect}
                      disabled={loading}
                      className="flex-1"
                    >
<<<<<<< HEAD
                      {loading ? "Connecting..." : "Connect Instagram"}
=======
                      Save Connection
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                    </Button>
                  </div>

                  <div className="text-center pt-4 border-t border-border">
                    <button
                      onClick={() => setUseOAuth(true)}
                      className="text-xs text-muted-foreground hover:text-foreground underline"
                    >
<<<<<<< HEAD
                      Back to simplified connection (recommended)
=======
                      Return to simplified connection
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div >
  );
}

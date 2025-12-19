import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, ImagePlus, Upload, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PreviewAlert } from "./PreviewAlert";
import { LivePreview } from "./LivePreview";

interface PostCreatorProps {
  onPostGenerated?: (variations: any) => void;
}

export function PostCreator({ onPostGenerated }: PostCreatorProps) {
  const [postType, setPostType] = useState<"feed" | "story" | "reel">("feed");
  const [objective, setObjective] = useState("");
  const [theme, setTheme] = useState("");
  const [tone, setTone] = useState("professional");
  const [style, setStyle] = useState("photography");
  const [cta, setCta] = useState("");
  const [brandColors, setBrandColors] = useState<string[]>(["#8b5cf6", "#ec4899", "#f59e0b"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [includeLogo, setIncludeLogo] = useState(true);
  const [includeTextOverlay, setIncludeTextOverlay] = useState(false);
  const [suggestedText, setSuggestedText] = useState("");
  const [textPosition, setTextPosition] = useState<"top" | "center" | "bottom">("center");

  // Check for prefilled theme from calendar
  useEffect(() => {
    const prefillData = sessionStorage.getItem('prefillTheme');
    if (prefillData) {
      try {
        const data = JSON.parse(prefillData);
        if (data.theme) setTheme(data.theme + (data.description ? ` - ${data.description}` : ''));
        sessionStorage.removeItem('prefillTheme');
      } catch (e) {
        console.error('Error parsing prefill data:', e);
      }
    }
  }, []);

  useEffect(() => {
    loadCompanyProfile();
  }, []);

  const loadCompanyProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("company_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading profile:", error);
        return;
      }

      if (data) {
        setCompanyProfile(data);
        setTone(data.default_tone || "professional");
        setBrandColors(data.brand_colors || ["#8b5cf6", "#ec4899", "#f59e0b"]);
      }
    } catch (error) {
      console.error("Error loading company profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!theme || !objective) {
      toast.error("Preencha o tema e objetivo do post");
      return;
    }

    setIsGenerating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado");
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-post', {
        body: {
          objective,
          theme,
          tone,
          style,
          cta,
          postType,
          brandColors: companyProfile?.brand_colors || brandColors,
          companyName: companyProfile?.company_name || "Sua Empresa",
          targetAudience: companyProfile?.target_audience || "Público geral",
          keywords: companyProfile?.keywords || ["inovação", "qualidade", "profissionalismo"],
          maxHashtags: companyProfile?.max_hashtags || 10,
          userId: user.id,
          includeLogo,
          logoUrl: companyProfile?.logo_url,
          includeTextOverlay,
          suggestedText: suggestedText.trim() || undefined,
          textPosition
        }
      });

      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success("Posts gerados com sucesso!");

      if (onPostGenerated && data.variations) {
        onPostGenerated(data.variations);
      }

    } catch (error: any) {
      console.error('Error generating post:', error);
      toast.error(error.message || "Erro ao gerar post. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 shadow-smooth">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-6 shadow-smooth">
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold">Criar Publicação</h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              Descreva sua ideia e deixe a IA criar o conteúdo perfeito
            </p>
          </div>
          <Tabs value={postType} onValueChange={(v) => setPostType(v as "feed" | "story" | "reel")}>
            <TabsList className="grid grid-cols-3 w-full md:w-auto">
              <TabsTrigger value="feed" className="text-xs md:text-sm">Feed</TabsTrigger>
              <TabsTrigger value="story" className="text-xs md:text-sm">Story</TabsTrigger>
              <TabsTrigger value="reel" className="text-xs md:text-sm">Reel</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <PreviewAlert show={!!theme} />

        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <Label htmlFor="objective">Objetivo da Campanha *</Label>
              <Select value={objective} onValueChange={setObjective}>
                <SelectTrigger id="objective">
                  <SelectValue placeholder="Selecione o objetivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conversion">Conversão / Vendas</SelectItem>
                  <SelectItem value="traffic">Tráfego para Site</SelectItem>
                  <SelectItem value="awareness">Reconhecimento de Marca</SelectItem>
                  <SelectItem value="engagement">Engajamento</SelectItem>
                  <SelectItem value="leads">Captação de Leads</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="theme">Tema / Descrição da Publicação *</Label>
              <Textarea
                id="theme"
                placeholder="Ex: Lançamento de novo produto, promoção de verão, dicas de uso..."
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <div>
              <Label htmlFor="tone">Tom de Voz</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Profissional</SelectItem>
                  <SelectItem value="casual">Casual / Amigável</SelectItem>
                  <SelectItem value="emotional">Emocional</SelectItem>
                  <SelectItem value="humorous">Bem-humorado</SelectItem>
                  <SelectItem value="educational">Educativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Identidade Visual</Label>
              <Card className="p-4 space-y-3 bg-muted/30">
                <div>
                  <Label htmlFor="colors" className="text-xs">Cores da Marca</Label>
                  <div className="flex gap-2 mt-2">
                    {brandColors.map((color, index) => (
                      <Input
                        key={index}
                        type="color"
                        className="h-10 w-14 md:w-20 cursor-pointer p-1"
                        value={color}
                        onChange={(e) => {
                          const newColors = [...brandColors];
                          newColors[index] = e.target.value;
                          setBrandColors(newColors);
                        }}
                      />
                    ))}
                  </div>
                </div>

                {companyProfile?.logo_url && (
                  <div className="flex items-center gap-3 pt-2 border-t">
                    <Checkbox
                      id="includeLogo"
                      checked={includeLogo}
                      onCheckedChange={(checked) => setIncludeLogo(checked as boolean)}
                    />
                    <Label htmlFor="includeLogo" className="text-sm cursor-pointer">
                      Incluir logo na arte
                    </Label>
                    {companyProfile.logo_url && (
                      <img
                        src={companyProfile.logo_url}
                        alt="Logo"
                        className="h-8 w-8 object-contain rounded ml-auto"
                      />
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2 border-t">
                  <Checkbox
                    id="includeTextOverlay"
                    checked={includeTextOverlay}
                    onCheckedChange={(checked) => setIncludeTextOverlay(checked as boolean)}
                  />
                  <Label htmlFor="includeTextOverlay" className="text-sm cursor-pointer">
                    Incluir texto na imagem
                  </Label>
                </div>

                {includeTextOverlay && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <Label htmlFor="suggestedText" className="text-xs">
                        Texto sugerido (opcional)
                      </Label>
                      <Input
                        id="suggestedText"
                        placeholder="Ex: Transforme Seu Negócio Hoje"
                        value={suggestedText}
                        onChange={(e) => setSuggestedText(e.target.value)}
                        maxLength={50}
                        className="mt-1 text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Deixe vazio para a IA gerar automaticamente
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="textPosition" className="text-xs">
                        Posição do texto
                      </Label>
                      <Select value={textPosition} onValueChange={(v) => setTextPosition(v as "top" | "center" | "bottom")}>
                        <SelectTrigger id="textPosition" className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top">Topo</SelectItem>
                          <SelectItem value="center">Centro</SelectItem>
                          <SelectItem value="bottom">Rodapé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            <div>
              <Label htmlFor="style">Estilo de Imagem</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger id="style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photography">Fotografia</SelectItem>
                  <SelectItem value="illustration">Ilustração</SelectItem>
                  <SelectItem value="3d">3D / Renderizado</SelectItem>
                  <SelectItem value="flat">Flat Design</SelectItem>
                  <SelectItem value="abstract">Abstrato</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cta">Call-to-Action (Opcional)</Label>
              <Input
                id="cta"
                placeholder="Ex: Acesse o link na bio, Saiba mais, Compre agora"
                value={cta}
                onChange={(e) => setCta(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              setObjective("");
              setTheme("");
              setCta("");
            }}
          >
            Limpar
          </Button>
          <Button
            variant="gradient"
            size="lg"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Gerar Variações A/B
              </>
            )}
          </Button>
        </div>

        {/* Preview em Tempo Real */}
        {theme && (
          <div className="mt-6">
            <LivePreview
              caption={theme}
              hashtags={cta ? [cta] : []}
              companyName={companyProfile?.company_name || "Sua Empresa"}
              companyLogo={companyProfile?.logo_url}
              postType={postType}
            />
          </div>
        )}
      </div>
    </Card>
  );
}

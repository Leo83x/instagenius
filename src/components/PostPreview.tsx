import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ImagePlus,
  Edit2,
  Save,
  X
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { composeLogoOnImage, composeTextOnImage, uploadComposedImage } from "@/utils/imageComposition";
import { TextOverlayEditor, type TextStyleConfig } from "./TextOverlayEditor";

import { PostVariation, GeneratedPost } from "@/types";

interface PostPreviewProps {
  variations?: PostVariation[];
}

export function PostPreview({ variations = [] }: PostPreviewProps) {
  const [currentVariation, setCurrentVariation] = useState(0);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [isApplyingText, setIsApplyingText] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [companyName, setCompanyName] = useState("sua_empresa");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Estados para edição
  const [editedCaption, setEditedCaption] = useState("");
  const [editedHashtags, setEditedHashtags] = useState("");
  const [editedImageUrl, setEditedImageUrl] = useState("");
  const [editedHeadlineText, setEditedHeadlineText] = useState("");

  useEffect(() => {
    const loadCompanyProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("company_profiles")
        .select("company_name, logo_url, instagram_handle")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setCompanyName(data.instagram_handle || data.company_name || "sua_empresa");
        setLogoUrl(data.logo_url);
      }
    };
    loadCompanyProfile();
  }, []);

  if (!variations || variations.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No posts generated yet. Fill out the form and generate your variations!
          </p>
        </div>
      </Card>
    );
  }

  const currentPost = variations[currentVariation];

  // Sincronizar estados de edição quando mudar de variação
  const handleVariationChange = (newIndex: number) => {
    setCurrentVariation(newIndex);
    setIsEditing(false);
  };

  const startEditing = () => {
    setEditedCaption(currentPost.caption);
    setEditedHashtags(currentPost.hashtags.join(" "));
    setEditedImageUrl(currentPost.imageUrl || "");
    setEditedHeadlineText(currentPost.headlineText || "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveEdits = () => {
    // Atualizar a variação atual com os valores editados
    variations[currentVariation] = {
      ...currentPost,
      caption: editedCaption,
      hashtags: editedHashtags.split(" ").filter(tag => tag.startsWith("#")),
      imageUrl: editedImageUrl || currentPost.imageUrl,
      headlineText: editedHeadlineText || currentPost.headlineText
    };
    setIsEditing(false);
    toast.success("Changes saved in preview!");
  };

  const displayPost = isEditing ? {
    ...currentPost,
    caption: editedCaption,
    hashtags: editedHashtags.split(" ").filter(tag => tag.startsWith("#")),
    imageUrl: editedImageUrl || currentPost.imageUrl,
    headlineText: editedHeadlineText || currentPost.headlineText
  } : {
    ...currentPost,
    // Ensure we have a local version that we can mutate if fallback is needed
  };

  const [activeImageUrl, setActiveImageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    setActiveImageUrl(displayPost.imageUrl);
  }, [displayPost.imageUrl, currentVariation]);

  const handleImageError = () => {
    if (activeImageUrl === displayPost.imageUrl && currentPost.supabaseUrl && currentPost.supabaseUrl !== displayPost.imageUrl) {
      console.warn("PostPreview: Falling back to Supabase...");
      setActiveImageUrl(currentPost.supabaseUrl);
    } else if (activeImageUrl && !activeImageUrl.includes('images.unsplash.com')) {
      console.warn("PostPreview: Falling back to Emergency Unsplash...");
      // Using a high-quality, stable Unsplash image based on the post context
      const query = encodeURIComponent(currentPost.altText || "marketing,business");
      setActiveImageUrl(`https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1080&q=80&q=fallback&term=${query}`);
    } else {
      console.error("PostPreview: All image fallbacks failed for variation", displayPost.variant);
    }
  };

  const handleExport = async () => {
    if (!displayPost) return;

    setExporting(true);
    try {
      const content = `
VARIAÇÃO: ${displayPost.variant}

LEGENDA:
${displayPost.caption}

HASHTAGS:
${displayPost.hashtags.join(" ")}

DESCRIÇÃO DA IMAGEM:
${displayPost.imagePrompt.description}

TEXTO ALTERNATIVO:
${displayPost.altText}

ESTRATÉGIA:
${displayPost.rationale}
      `.trim();

      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `post-variacao-${displayPost.variant}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (displayPost.imageUrl) {
        const response = await fetch(displayPost.imageUrl);
        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
        const imgLink = document.createElement("a");
        imgLink.href = imageUrl;
        imgLink.download = `imagem-variacao-${displayPost.variant}.jpg`;
        document.body.appendChild(imgLink);
        imgLink.click();
        document.body.removeChild(imgLink);
        URL.revokeObjectURL(imageUrl);
      }

      toast.success("Post and image exported successfully!");
    } catch (error) {
      console.error("Error exporting:", error);
      toast.error("Error exporting files");
    } finally {
      setExporting(false);
    }
  };

  const handleApplyLogo = async () => {
    if (!currentPost.imageUrl || !logoUrl) return;

    setIsComposing(true);
    toast.info("Applying logo to image...");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // 1. Compose logo
      const composedDataUrl = await composeLogoOnImage(
        currentPost.imageUrl,
        logoUrl,
        'bottom-right',
        0.15 // 15% size
      );

      // 2. Upload new image
      const newImageUrl = await uploadComposedImage(
        composedDataUrl,
        user.id,
        supabase
      );

      // 3. Update current variation state locally
      // Note: In a real app we might want to update the parent state or refetch
      // For now we mutate the object in memory to reflect change immediately
      currentPost.imageUrl = newImageUrl;

      // Force re-render
      setCurrentVariation(prev => prev); // This might not be enough if object ref is same

      toast.success("Logo applied successfully!");
    } catch (error) {
      console.error("Error applying logo:", error);
      toast.error("Error applying logo to image");
    } finally {
      setIsComposing(false);
    }
  };

  const handleApplyTextWithConfig = async (config: TextStyleConfig) => {
    if (!currentPost.imageUrl) return;

    setShowTextEditor(false);
    setIsApplyingText(true);
    toast.info("Aplicando texto na imagem...");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // 1. Compose text on image with custom config (including edited text)
      const composedDataUrl = await composeTextOnImage(
        currentPost.imageUrl,
        config.text, // Use edited text from config
        config.position,
        {
          color: config.color,
          strokeColor: config.strokeColor,
          fontFamily: config.fontFamily,
          fontSize: config.fontSize
        }
      );

      // 2. Upload new image
      const newImageUrl = await uploadComposedImage(
        composedDataUrl,
        user.id,
        supabase
      );

      // 3. Update current variation state locally
      currentPost.imageUrl = newImageUrl;
      // Mark that text has been applied
      currentPost.textOverlay = undefined;

      // Force re-render
      setCurrentVariation(prev => prev);

      toast.success("Texto aplicado com sucesso!");
    } catch (error) {
      console.error("Erro ao aplicar texto:", error);
      toast.error("Erro ao aplicar texto na imagem");
    } finally {
      setIsApplyingText(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!displayPost) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado");
        return;
      }

      const { error } = await supabase.from("generated_posts").insert({
        user_id: user.id,
        variant: displayPost.variant,
        objective: "engagement", // Original intent
        theme: displayPost.caption.substring(0, 100),
        post_type: "feed",
        caption: displayPost.caption,
        hashtags: displayPost.hashtags,
        image_prompt: displayPost.imagePrompt.description,
        image_url: activeImageUrl || displayPost.imageUrl || null,
        alt_text: displayPost.altText,
        rationale: displayPost.rationale,
        status: "draft"
      });

      if (error) throw error;

      toast.success("Post salvo com sucesso!");
    } catch (error: any) {
      console.error("Error saving post:", error);
      toast.error("Erro ao salvar post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-smooth">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-display font-bold">Variation {displayPost.variant}</h3>
            <p className="text-sm text-muted-foreground">
              {variations.length} variations generated for A/B testing
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleVariationChange(Math.max(0, currentVariation - 1))}
              disabled={currentVariation === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleVariationChange(Math.min(variations.length - 1, currentVariation + 1))}
              disabled={currentVariation === variations.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-card border rounded-lg overflow-hidden">
              <div className="flex items-center gap-3 p-3 border-b">
                {logoUrl ? (
                  <img src={logoUrl} alt={companyName} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary" />
                )}
                <span className="font-semibold text-sm">{companyName}</span>
              </div>

              <div className="bg-muted aspect-square flex items-center justify-center relative">
                {activeImageUrl ? (
                  <img
                    src={activeImageUrl}
                    alt={displayPost.altText}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                ) : displayPost.imageError ? (
                  <div className="text-center p-4">
                    <ImagePlus className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Error generating image</p>
                  </div>
                ) : (
                  <>
                    <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                    <p className="absolute bottom-4 text-sm text-muted-foreground">Generating image...</p>
                  </>
                )}
              </div>

              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <Heart className="h-6 w-6 hover:text-red-500 cursor-pointer" />
                    <MessageCircle className="h-6 w-6 hover:text-primary cursor-pointer" />
                    <Send className="h-6 w-6 hover:text-primary cursor-pointer" />
                  </div>
                  <Bookmark className="h-6 w-6 hover:text-primary cursor-pointer" />
                </div>

                <div className="text-sm">
                  <span className="font-semibold">{companyName}</span>{" "}
                  <span className="whitespace-pre-wrap">{displayPost.caption}</span>
                </div>
              </div>

              {/* Logo Overlay - Visual Fallback */}
              {logoUrl && companyName && (
                <div className="absolute bottom-4 right-4 w-[15%] max-w-[80px] z-10 pointer-events-none drop-shadow-md">
                  {/* Overlay omitted as per new logic, button is preferred */}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Real-time Editing</h4>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={startEditing}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={cancelEditing}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button variant="default" size="sm" onClick={saveEdits}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div>
                  <Label htmlFor="caption">Caption</Label>
                  <Textarea
                    id="caption"
                    value={editedCaption}
                    onChange={(e) => setEditedCaption(e.target.value)}
                    rows={6}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="hashtags">Hashtags (separated by space)</Label>
                  <Input
                    id="hashtags"
                    value={editedHashtags}
                    onChange={(e) => setEditedHashtags(e.target.value)}
                    placeholder="#exemplo #hashtag"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="imageUrl">URL da Imagem</Label>
                  <Input
                    id="imageUrl"
                    value={editedImageUrl}
                    onChange={(e) => setEditedImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
                {displayPost.headlineText && (
                  <div>
                    <Label htmlFor="headlineText">Text on Image</Label>
                    <Input
                      id="headlineText"
                      value={editedHeadlineText}
                      onChange={(e) => setEditedHeadlineText(e.target.value)}
                      placeholder="Max 6 words"
                      maxLength={50}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            ) : (
              <>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Badge variant="outline">Strategic Analysis</Badge>
                  </h4>
                  <p className="text-sm text-muted-foreground">{displayPost.rationale}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Image Prompt</h4>
                  <div className="space-y-2">
                    <p className="text-sm">{displayPost.imagePrompt.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">Style: {displayPost.imagePrompt.style}</Badge>
                      <Badge variant="secondary">Mood: {displayPost.imagePrompt.mood}</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Alt Text</h4>
                  <p className="text-sm text-muted-foreground">{displayPost.altText}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Hashtags ({displayPost.hashtags.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {displayPost.hashtags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {displayPost.headlineText && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Text on Image</h4>
                      <Badge variant="secondary" className="text-sm">
                        {displayPost.headlineText}
                      </Badge>
                      {displayPost.textOverlay && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Position: {displayPost.textOverlay.position === 'top' ? 'Top' : displayPost.textOverlay.position === 'center' ? 'Center' : 'Bottom'}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            <Separator />

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {/* Botão de Editar Texto */}
              {displayPost.headlineText && displayPost.textOverlay && displayPost.imageUrl && (
                <Button
                  variant="secondary"
                  onClick={() => setShowTextEditor(true)}
                  disabled={isApplyingText}
                  className="flex-1 md:flex-none"
                >
                  {isApplyingText ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit Text
                    </>
                  )}
                </Button>
              )}

              {/* Botão de Aplicar Logo (Manual) */}
              {logoUrl && !displayPost.imageUrl?.includes('composed') && (
                <Button
                  variant="secondary"
                  onClick={handleApplyLogo}
                  disabled={isComposing}
                  className="flex-1 md:flex-none"
                >
                  {isComposing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <ImagePlus className="mr-2 h-4 w-4" />
                      Apply Logo
                    </>
                  )}
                </Button>
              )}

              <Button
                variant="outline"
                onClick={handleExport}
                disabled={exporting}
                className="flex-1 md:flex-none"
              >
                {exporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </>
                )}
              </Button>

              <Button
                variant="default"
                onClick={handleSaveToDatabase}
                disabled={saving}
                className="flex-1 md:flex-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save to Database
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Text Overlay Editor Modal */}
      {showTextEditor && displayPost.headlineText && displayPost.imageUrl && (
        <TextOverlayEditor
          imageUrl={displayPost.imageUrl}
          text={displayPost.headlineText}
          initialPosition={displayPost.textOverlay?.position || 'center'}
          onApply={handleApplyTextWithConfig}
          onCancel={() => setShowTextEditor(false)}
        />
      )}
    </div>
  );
}
import { useState } from "react";
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

interface PostVariation {
  variant: string;
  caption: string;
  hashtags: string[];
  imagePrompt: {
    description: string;
    colors: string[];
    style: string;
    aspectRatio: string;
    elements: string[];
    mood: string;
  };
  altText: string;
  rationale: string;
  imageUrl?: string;
  imageError?: string;
}

interface PostPreviewProps {
  variations?: PostVariation[];
}

export function PostPreview({ variations = [] }: PostPreviewProps) {
  const [currentVariation, setCurrentVariation] = useState(0);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Estados para edição
  const [editedCaption, setEditedCaption] = useState("");
  const [editedHashtags, setEditedHashtags] = useState("");
  const [editedImageUrl, setEditedImageUrl] = useState("");

  if (!variations || variations.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhuma publicação gerada ainda. Preencha o formulário e gere suas variações!
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
      imageUrl: editedImageUrl || currentPost.imageUrl
    };
    setIsEditing(false);
    toast.success("Alterações salvas no preview!");
  };

  const displayPost = isEditing ? {
    ...currentPost,
    caption: editedCaption,
    hashtags: editedHashtags.split(" ").filter(tag => tag.startsWith("#")),
    imageUrl: editedImageUrl || currentPost.imageUrl
  } : currentPost;

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

      toast.success("Post e imagem exportados com sucesso!");
    } catch (error) {
      console.error("Error exporting:", error);
      toast.error("Erro ao exportar arquivos");
    } finally {
      setExporting(false);
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
        objective: "engagement",
        theme: displayPost.caption.substring(0, 100),
        post_type: "feed",
        caption: displayPost.caption,
        hashtags: displayPost.hashtags,
        image_prompt: displayPost.imagePrompt.description,
        image_url: displayPost.imageUrl || null,
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
            <h3 className="text-xl font-display font-bold">Variação {displayPost.variant}</h3>
            <p className="text-sm text-muted-foreground">
              {variations.length} variações geradas para teste A/B
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
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary" />
                <span className="font-semibold text-sm">sua_empresa</span>
              </div>
              
              <div className="bg-muted aspect-square flex items-center justify-center relative">
                {displayPost.imageUrl ? (
                  <img 
                    src={displayPost.imageUrl} 
                    alt={displayPost.altText}
                    className="w-full h-full object-cover"
                  />
                ) : displayPost.imageError ? (
                  <div className="text-center p-4">
                    <ImagePlus className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Erro ao gerar imagem</p>
                  </div>
                ) : (
                  <>
                    <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                    <p className="absolute bottom-4 text-sm text-muted-foreground">Gerando imagem...</p>
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
                  <span className="font-semibold">sua_empresa</span>{" "}
                  <span className="whitespace-pre-wrap">{displayPost.caption}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Edição em Tempo Real</h4>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={startEditing}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={cancelEditing}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button variant="default" size="sm" onClick={saveEdits}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div>
                  <Label htmlFor="caption">Legenda</Label>
                  <Textarea
                    id="caption"
                    value={editedCaption}
                    onChange={(e) => setEditedCaption(e.target.value)}
                    rows={6}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="hashtags">Hashtags (separadas por espaço)</Label>
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
              </div>
            ) : (
              <>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Badge variant="outline">Análise Estratégica</Badge>
                  </h4>
                  <p className="text-sm text-muted-foreground">{displayPost.rationale}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Prompt da Imagem</h4>
                  <div className="space-y-2">
                    <p className="text-sm">{displayPost.imagePrompt.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">Estilo: {displayPost.imagePrompt.style}</Badge>
                      <Badge variant="secondary">Mood: {displayPost.imagePrompt.mood}</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Texto Alternativo</h4>
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
              </>
            )}

            <Separator />

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Exportar
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={handleSaveToDatabase}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Calendar className="h-4 w-4 mr-2" />
                )}
                Salvar Post
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
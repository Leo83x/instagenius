import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Search, Image as ImageIcon, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";

interface ImageItem {
  id: string;
  url: string;
  storage_path: string;
  tags: string[];
  description: string | null;
  created_at: string;
}

export default function ImageLibrary() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("image_library")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error("Error loading images:", error);
      toast.error("Erro ao carregar imagens");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    setUploadingFile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("image-library")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("image-library")
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from("image_library")
        .insert({
          user_id: user.id,
          storage_path: fileName,
          url: publicUrl,
          tags: [],
          description: file.name
        });

      if (insertError) throw insertError;

      toast.success("Imagem enviada com sucesso!");
      loadImages();
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteImage = async (imageId: string, storagePath: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from("image-library")
        .remove([storagePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("image_library")
        .delete()
        .eq("id", imageId);

      if (dbError) throw dbError;

      toast.success("Imagem excluída");
      loadImages();
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Erro ao excluir imagem");
    }
  };

  const handleAddTag = async (imageId: string, currentTags: string[]) => {
    const tag = prompt("Digite a tag:");
    if (!tag) return;

    try {
      const newTags = [...currentTags, tag.toLowerCase()];
      const { error } = await supabase
        .from("image_library")
        .update({ tags: newTags })
        .eq("id", imageId);

      if (error) throw error;

      toast.success("Tag adicionada");
      loadImages();
    } catch (error) {
      console.error("Error adding tag:", error);
      toast.error("Erro ao adicionar tag");
    }
  };

  const filteredImages = images.filter((image) => {
    const matchesSearch = 
      searchTerm === "" ||
      image.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTags = 
      selectedTags.length === 0 ||
      selectedTags.some((tag) => image.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  const allTags = Array.from(new Set(images.flatMap((img) => img.tags)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Biblioteca de Imagens</h1>
            <p className="text-muted-foreground">
              Gerencie e reutilize seus assets visuais
            </p>
          </div>
          
          <div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploadingFile}
              id="file-upload"
              className="hidden"
            />
            <Label htmlFor="file-upload">
              <Button asChild disabled={uploadingFile}>
                <span className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingFile ? "Enviando..." : "Upload de Imagem"}
                </span>
              </Button>
            </Label>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por descrição ou tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedTags((prev) =>
                        prev.includes(tag)
                          ? prev.filter((t) => t !== tag)
                          : [...prev, tag]
                      );
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Images Grid */}
        {filteredImages.length === 0 ? (
          <Card className="p-12 text-center">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">
              {images.length === 0 ? "Nenhuma imagem ainda" : "Nenhuma imagem encontrada"}
            </h3>
            <p className="text-muted-foreground">
              {images.length === 0
                ? "Faça upload da primeira imagem para sua biblioteca"
                : "Tente ajustar os filtros de busca"}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredImages.map((image) => (
              <Card key={image.id} className="overflow-hidden group">
                <div className="aspect-square relative bg-muted">
                  <img
                    src={image.url}
                    alt={image.description || ""}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        navigator.clipboard.writeText(image.url);
                        toast.success("URL copiada!");
                      }}
                    >
                      Copiar URL
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteImage(image.id, image.storage_path)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-sm font-medium line-clamp-1">
                    {image.description || "Sem descrição"}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {image.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2"
                      onClick={() => handleAddTag(image.id, image.tags)}
                    >
                      <Tag className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

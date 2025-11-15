import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Lightbulb, Plus, Calendar, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

export default function ThemeSuggestions() {
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    theme_name: "",
    description: "",
    category: "Conteúdo Educativo",
    frequency: "weekly",
    suggested_hashtags: "",
  });

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("theme_suggestions")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setThemes(data || []);
    } catch (error) {
      console.error("Error loading themes:", error);
      toast.error("Erro ao carregar temas");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const themeData = {
        ...formData,
        suggested_hashtags: formData.suggested_hashtags.split(",").map(h => h.trim()),
        user_id: user.id,
      };

      if (editingTheme) {
        const { error } = await supabase
          .from("theme_suggestions")
          .update(themeData)
          .eq("id", editingTheme.id);

        if (error) throw error;
        toast.success("Tema atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("theme_suggestions")
          .insert([themeData]);

        if (error) throw error;
        toast.success("Tema criado com sucesso!");
      }

      setIsDialogOpen(false);
      setEditingTheme(null);
      setFormData({
        theme_name: "",
        description: "",
        category: "Conteúdo Educativo",
        frequency: "weekly",
        suggested_hashtags: "",
      });
      loadThemes();
    } catch (error) {
      console.error("Error saving theme:", error);
      toast.error("Erro ao salvar tema");
    }
  };

  const handleEdit = (theme: any) => {
    setEditingTheme(theme);
    setFormData({
      theme_name: theme.theme_name,
      description: theme.description || "",
      category: theme.category || "Conteúdo Educativo",
      frequency: theme.frequency || "weekly",
      suggested_hashtags: theme.suggested_hashtags?.join(", ") || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("theme_suggestions")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
      toast.success("Tema removido com sucesso!");
      loadThemes();
    } catch (error) {
      console.error("Error deleting theme:", error);
      toast.error("Erro ao remover tema");
    }
  };

  const categoryColors: Record<string, string> = {
    "Conteúdo Educativo": "bg-blue-500/10 text-blue-600",
    "Promoções": "bg-green-500/10 text-green-600",
    "Engajamento": "bg-purple-500/10 text-purple-600",
    "Bastidores": "bg-orange-500/10 text-orange-600",
    "Dicas": "bg-pink-500/10 text-pink-600",
  };

  const frequencyLabels: Record<string, string> = {
    daily: "Diário",
    weekly: "Semanal",
    biweekly: "Quinzenal",
    monthly: "Mensal",
  };

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
      
      <main className="container py-4 md:py-8 space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-display font-bold">Sugestões de Temas</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Planeje e organize seus temas de conteúdo
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Novo Tema
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingTheme ? "Editar" : "Novo"} Tema</DialogTitle>
                <DialogDescription>
                  {editingTheme ? "Atualize" : "Crie"} um tema de conteúdo para seu planejamento
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme_name">Nome do Tema</Label>
                  <Input
                    id="theme_name"
                    value={formData.theme_name}
                    onChange={(e) => setFormData({ ...formData, theme_name: e.target.value })}
                    placeholder="Ex: Dicas de Marketing"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva o tema..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Conteúdo Educativo">Conteúdo Educativo</SelectItem>
                      <SelectItem value="Promoções">Promoções</SelectItem>
                      <SelectItem value="Engajamento">Engajamento</SelectItem>
                      <SelectItem value="Bastidores">Bastidores</SelectItem>
                      <SelectItem value="Dicas">Dicas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequência</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="biweekly">Quinzenal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="suggested_hashtags">Hashtags Sugeridas (separadas por vírgula)</Label>
                  <Input
                    id="suggested_hashtags"
                    value={formData.suggested_hashtags}
                    onChange={(e) => setFormData({ ...formData, suggested_hashtags: e.target.value })}
                    placeholder="#marketing, #dicas, #conteudo"
                  />
                </div>

                <Button type="submit" className="w-full">
                  {editingTheme ? "Atualizar" : "Criar"} Tema
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {themes.length === 0 ? (
          <Card className="p-8 md:p-12 text-center">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">Nenhum tema criado</h3>
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              Crie temas para organizar seu calendário de conteúdo
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Tema
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:gap-6 md:grid-cols-2">
            {themes.map((theme) => (
              <Card key={theme.id} className="p-4 md:p-6 shadow-smooth hover:shadow-glow transition-smooth">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{theme.theme_name}</h3>
                      {theme.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {theme.description}
                        </p>
                      )}
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className={categoryColors[theme.category] || ""}>
                      {theme.category}
                    </Badge>
                    <Badge variant="outline">
                      <Calendar className="h-3 w-3 mr-1" />
                      {frequencyLabels[theme.frequency]}
                    </Badge>
                  </div>

                  {theme.suggested_hashtags && theme.suggested_hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {theme.suggested_hashtags.slice(0, 5).map((tag: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {theme.suggested_hashtags.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{theme.suggested_hashtags.length - 5}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(theme)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(theme.id)}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remover
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

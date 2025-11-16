import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Lightbulb, Plus, Calendar, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ThemeSuggestion {
  theme_name: string;
  description: string;
  category: string;
  frequency: string;
  suggested_hashtags: string[];
}

export default function ThemeSuggestions() {
  const [suggestions, setSuggestions] = useState<ThemeSuggestion[]>([]);
  const [savedThemes, setSavedThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [profileExists, setProfileExists] = useState(true);

  useEffect(() => {
    loadSavedThemes();
    checkProfile();
  }, []);

  const checkProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("company_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setProfileExists(!!data);
    } catch (error) {
      console.error("Error checking profile:", error);
    }
  };

  const loadSavedThemes = async () => {
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
      setSavedThemes(data || []);
    } catch (error) {
      console.error("Error loading themes:", error);
    }
  };

  const generateSuggestions = async () => {
    if (!profileExists) {
      toast.error("Complete seu perfil em Configurações primeiro");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-themes');

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setSuggestions(data.suggestions || []);
      toast.success("Sugestões geradas com sucesso!");
    } catch (error: any) {
      console.error("Error generating suggestions:", error);
      toast.error("Erro ao gerar sugestões");
    } finally {
      setLoading(false);
    }
  };

  const saveTheme = async (theme: ThemeSuggestion) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("theme_suggestions")
        .insert([{ ...theme, user_id: user.id }]);

      if (error) throw error;
      
      toast.success("Tema salvo com sucesso!");
      loadSavedThemes();
      setSuggestions(suggestions.filter(s => s.theme_name !== theme.theme_name));
    } catch (error) {
      console.error("Error saving theme:", error);
      toast.error("Erro ao salvar tema");
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

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container py-4 md:py-8 space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-display font-bold">Sugestões de Temas</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Receba sugestões personalizadas de temas baseadas no seu perfil
            </p>
          </div>

          <Button 
            onClick={generateSuggestions} 
            disabled={loading || !profileExists}
            className="w-full md:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Sugestões com IA
              </>
            )}
          </Button>
        </div>

        {!profileExists && (
          <Card className="p-6 border-yellow-200 bg-yellow-50">
            <p className="text-sm text-yellow-800">
              Complete seu perfil em <strong>Configurações</strong> para receber sugestões personalizadas.
            </p>
          </Card>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Novas Sugestões</h2>
            <div className="grid gap-4 md:gap-6 md:grid-cols-2">
              {suggestions.map((theme, index) => (
                <Card key={index} className="p-4 md:p-6 shadow-smooth hover:shadow-glow transition-smooth">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{theme.theme_name}</h3>
                        <p className="text-sm text-muted-foreground">{theme.description}</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge className={categoryColors[theme.category] || ""}>{theme.category}</Badge>
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        {frequencyLabels[theme.frequency]}
                      </Badge>
                    </div>

                    {theme.suggested_hashtags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {theme.suggested_hashtags.slice(0, 5).map((tag: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    )}

                    <Button onClick={() => saveTheme(theme)} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Salvar Tema
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {savedThemes.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Temas Salvos</h2>
            <div className="grid gap-4 md:gap-6 md:grid-cols-2">
              {savedThemes.map((theme) => (
                <Card key={theme.id} className="p-4 md:p-6 shadow-smooth">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{theme.theme_name}</h3>
                        {theme.description && <p className="text-sm text-muted-foreground line-clamp-2">{theme.description}</p>}
                      </div>
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={categoryColors[theme.category] || ""}>{theme.category}</Badge>
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        {frequencyLabels[theme.frequency]}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {suggestions.length === 0 && savedThemes.length === 0 && !loading && (
          <Card className="p-8 md:p-12 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">Gere suas primeiras sugestões</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Clique no botão acima para receber sugestões de temas com IA
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarHeart, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SeasonalDate {
  date: string;
  name: string;
  description: string;
  post_ideas: string[];
  days_until: number;
  category: string;
}

export function SeasonalCalendar() {
  const [seasonalDates, setSeasonalDates] = useState<SeasonalDate[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadSeasonalDates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("seasonal-calendar");
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setSeasonalDates(data.dates || []);
      toast.success("Calendário sazonal atualizado!");
    } catch (error: any) {
      console.error("Error loading seasonal:", error);
      toast.error(error.message || "Erro ao carregar calendário sazonal");
    } finally {
      setLoading(false);
    }
  };

  const createPostFromIdea = (idea: string, dateName: string) => {
    sessionStorage.setItem("prefillTheme", JSON.stringify({
      theme: `${dateName} - ${idea}`,
      description: idea,
    }));
    navigate("/");
  };

  const urgencyColor = (daysUntil: number) => {
    if (daysUntil <= 3) return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200";
    if (daysUntil <= 7) return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200";
    if (daysUntil <= 14) return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200";
    return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-200";
  };

  return (
    <Card className="p-6 shadow-smooth">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarHeart className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-display font-bold">Calendário Sazonal Inteligente</h2>
        </div>
        <Button onClick={loadSeasonalDates} disabled={loading} size="sm" variant="outline">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Carregando...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Gerar Sugestões Sazonais
            </>
          )}
        </Button>
      </div>

      {seasonalDates.length > 0 ? (
        <div className="space-y-4">
          {seasonalDates.map((item, index) => (
            <div key={index} className={`p-4 rounded-lg border ${urgencyColor(item.days_until)}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-bold text-sm">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <Badge variant="outline" className="text-xs">
                    {item.days_until === 0 ? "Hoje!" : `${item.days_until} dias`}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.date}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium">Ideias de Post:</p>
                <div className="flex flex-wrap gap-2">
                  {item.post_ideas.map((idea, i) => (
                    <Button
                      key={i}
                      variant="secondary"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => createPostFromIdea(idea, item.name)}
                    >
                      {idea}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Clique em "Gerar Sugestões Sazonais" para ver as próximas datas comemorativas com ideias de posts prontas
        </p>
      ) : null}
    </Card>
  );
}

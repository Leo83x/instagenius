import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarIcon, Plus, X, Check, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ThemeEvent {
  id: string;
  date: Date;
  theme: any;
  completed?: boolean;
}

interface ThemeCalendarProps {
  savedThemes: any[];
}

export function ThemeCalendar({ savedThemes }: ThemeCalendarProps) {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<ThemeEvent[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<any>(null);

  const handleAddTheme = () => {
    if (!date || !selectedTheme) return;
    
    const newEvent: ThemeEvent = {
      id: crypto.randomUUID(),
      date: date,
      theme: selectedTheme
    };
    
    setEvents([...events, newEvent]);
    toast.success(`Tema "${selectedTheme.theme_name}" agendado para ${format(date, "dd/MM/yyyy", { locale: ptBR })}`);
    setDialogOpen(false);
    setSelectedTheme(null);
  };

  const removeEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
    toast.success("Tema removido do calendário");
  };

  const toggleCompleted = (id: string) => {
    setEvents(events.map(e => 
      e.id === id ? { ...e, completed: !e.completed } : e
    ));
    const event = events.find(e => e.id === id);
    if (event && !event.completed) {
      toast.success("Tema marcado como concluído!");
    }
  };

  const createPostFromTheme = (theme: any) => {
    // Navigate to home and store theme in sessionStorage for pre-filling
    sessionStorage.setItem('prefillTheme', JSON.stringify({
      theme: theme.theme_name,
      description: theme.description,
      hashtags: theme.suggested_hashtags
    }));
    navigate('/');
    toast.info("Tema carregado no criador de posts!");
  };

  const getEventsForDate = (checkDate: Date) => {
    return events.filter(event => 
      format(event.date, "yyyy-MM-dd") === format(checkDate, "yyyy-MM-dd")
    );
  };

  const categoryColors: Record<string, string> = {
    "Educacional": "bg-blue-500/10 text-blue-600 border-blue-200",
    "Promocional": "bg-green-500/10 text-green-600 border-green-200",
    "Inspiracional": "bg-purple-500/10 text-purple-600 border-purple-200",
    "Entretenimento": "bg-pink-500/10 text-pink-600 border-pink-200",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Calendário de Temas</h2>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Agendar Tema
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={ptBR}
            className="rounded-md"
            modifiers={{
              hasEvent: events.map(e => e.date)
            }}
            modifiersClassNames={{
              hasEvent: "bg-primary/20 font-bold"
            }}
          />
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">
            Temas Agendados {date && `- ${format(date, "dd/MM/yyyy", { locale: ptBR })}`}
          </h3>
          <div className="space-y-2">
            {date && getEventsForDate(date).length > 0 ? (
              getEventsForDate(date).map((event) => (
                <div 
                  key={event.id} 
                  className={`p-3 rounded-lg flex items-start gap-3 ${
                    event.completed ? 'bg-green-500/10 border border-green-500/30' : 'bg-muted/50'
                  }`}
                >
                  <div className="pt-1">
                    <Checkbox
                      checked={event.completed}
                      onCheckedChange={() => toggleCompleted(event.id)}
                      className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium truncate ${event.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {event.theme.theme_name}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.theme.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className={categoryColors[event.theme.category] || ""}>
                        {event.theme.category}
                      </Badge>
                      {event.completed && (
                        <Badge className="bg-green-500/20 text-green-600 border-green-300">
                          <Check className="h-3 w-3 mr-1" />
                          Concluído
                        </Badge>
                      )}
                    </div>
                    {!event.completed && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => createPostFromTheme(event.theme)}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Criar Publicação
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEvent(event.id)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum tema agendado para esta data
              </p>
            )}
          </div>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Tema</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Data Selecionada</label>
              <p className="text-muted-foreground">
                {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Selecione um Tema</label>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {savedThemes.map((theme) => (
                  <div
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTheme?.id === theme.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      <h4 className="font-medium text-sm leading-tight">{theme.theme_name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{theme.description}</p>
                      <Badge variant="outline" className={`self-start text-xs ${categoryColors[theme.category] || ""}`}>
                        {theme.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddTheme} disabled={!selectedTheme}>
                Agendar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { Header } from "@/components/Header";
import { StatsOverview } from "@/components/StatsOverview";
import { PostCreator } from "@/components/PostCreator";
import { PostPreview } from "@/components/PostPreview";
import { ScheduleCalendar } from "@/components/ScheduleCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [generatedVariations, setGeneratedVariations] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("create");
  const navigate = useNavigate();

  const handlePostGenerated = (variations: any) => {
    setGeneratedVariations(variations);
    setActiveTab("preview");
  };

  useEffect(() => {
    if (activeTab === "saved") {
      navigate('/posts');
    }
  }, [activeTab, navigate]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container py-4 md:py-8 space-y-4 md:space-y-8">
        <div className="space-y-1 md:space-y-2">
          <h1 className="text-2xl md:text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Transforme suas ideias em posts profissionais para Instagram
          </p>
        </div>

        <StatsOverview />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="create" className="text-xs md:text-sm py-2">Criar Post</TabsTrigger>
            <TabsTrigger value="preview" className="text-xs md:text-sm py-2">Visualizar</TabsTrigger>
            <TabsTrigger value="schedule" className="text-xs md:text-sm py-2">Agenda</TabsTrigger>
            <TabsTrigger value="saved" className="text-xs md:text-sm py-2">Salvos</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <PostCreator onPostGenerated={handlePostGenerated} />
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            {generatedVariations ? (
              <PostPreview variations={generatedVariations} />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Gere um post primeiro para visualizar
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <ScheduleCalendar />
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            {/* Redirects to /posts via useEffect */}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;

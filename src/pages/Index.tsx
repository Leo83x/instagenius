import { Header } from "@/components/Header";
import { StatsOverview } from "@/components/StatsOverview";
import { PostCreator } from "@/components/PostCreator";
import { PostPreview } from "@/components/PostPreview";
import { ScheduleCalendar } from "@/components/ScheduleCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { GeneratedPost } from "@/types";
import { composeLogoOnImage, uploadComposedImage } from "@/utils/imageComposition";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
  const [activeTab, setActiveTab] = useState("create");
  const [composingLogos, setComposingLogos] = useState(false);
  const navigate = useNavigate();

  const handlePostGenerated = async (variations: any[]) => {
    // Check if any variation needs logo composition
    const needsComposition = variations.some((v: any) => v.needsLogoComposition && v.logoUrl && v.imageUrl);

    if (needsComposition) {
      setComposingLogos(true);
      toast.info("Adding logo to images...");

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        // Process each variation
        const processedVariations = await Promise.all(
          variations.map(async (variation: any) => {
            if (variation.needsLogoComposition && variation.logoUrl && variation.imageUrl) {
              try {
                console.log(`Composing logo for variant ${variation.variant}`);

                // Compose logo on image
                const composedDataUrl = await composeLogoOnImage(
                  variation.imageUrl,
                  variation.logoUrl,
                  'bottom-right',
                  0.15
                );

                // Upload composed image
                const newImageUrl = await uploadComposedImage(
                  composedDataUrl,
                  user.id,
                  supabase
                );

                console.log(`Logo composed successfully for variant ${variation.variant}`);

                return {
                  ...variation,
                  imageUrl: newImageUrl,
                  needsLogoComposition: false
                };
              } catch (error) {
                console.error(`Failed to compose logo for variant ${variation.variant}:`, error);
                toast.error(`Error adding logo to variation ${variation.variant}`);
                return variation;
              }
            }
            return variation;
          })
        );

        setGeneratedPost({ variations: processedVariations, metadata: ({} as any) });
        toast.success("Logo added successfully!");
      } catch (error) {
        console.error("Error composing logos:", error);
        toast.error("Error adding logos");
        setGeneratedPost({ variations: variations, metadata: ({} as any) });
      } finally {
        setComposingLogos(false);
      }
    } else {
      setGeneratedPost({ variations: variations, metadata: ({} as any) });
    }

    setActiveTab("preview");
  };

  useEffect(() => {
    if (activeTab === "saved") {
      navigate('/posts');
    }
  }, [activeTab, navigate]);

  return (
    <div className="min-h-screen bg-gradient-subtle page-transition">
      <Header />

      <main className="container py-4 md:py-8 space-y-4 md:space-y-8">
        <div className="space-y-1 md:space-y-2 animate-in fade-in slide-in-from-bottom-4">
          <h1 className="text-2xl md:text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Transform your ideas into professional Instagram posts
          </p>
        </div>

        <StatsOverview />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="create" className="text-xs md:text-sm py-2">Create Post</TabsTrigger>
            <TabsTrigger value="preview" className="text-xs md:text-sm py-2">Preview</TabsTrigger>
            <TabsTrigger value="schedule" className="text-xs md:text-sm py-2">Schedule</TabsTrigger>
            <TabsTrigger value="saved" className="text-xs md:text-sm py-2">Saved</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6 animate-in fade-in">
            <PostCreator onPostGenerated={handlePostGenerated} />
          </TabsContent>

          <TabsContent value="preview" className="space-y-6 animate-in fade-in">
            {generatedPost ? (
              <PostPreview variations={generatedPost.variations} />
            ) : (
<<<<<<< HEAD
              <div className="text-center py-12 text-muted-foreground">
=======
              <div className="text-center py-12 text-muted-foreground animate-in fade-in">
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                Generate a post first to preview
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6 animate-in fade-in">
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

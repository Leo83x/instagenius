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
      // Demo Mode: Skip real profile load
      setCompanyProfile({
        company_name: "Demo Studio",
        default_tone: "professional",
        brand_colors: ["#8b5cf6", "#ec4899", "#f59e0b"]
      });
      setTone("professional");
      setBrandColors(["#8b5cf6", "#ec4899", "#f59e0b"]);
    } catch (error) {
      console.error("Error loading company profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!theme || !objective) {
      toast.error("Please fill in the theme and campaign objective");
      return;
    }

    setIsGenerating(true);

    try {
      // Demo Mode: Mock generation
      setTimeout(() => {
        const mockVariations = [
          {
            variant: "A",
            caption: `🚀 ${theme} \n\nLooking for the best solution? We're here to help! \n\n#innovation #quality #business`,
            hashtags: ["#innovation", "#quality", "#business"],
            headlineText: "Transform Your Business",
            imagePrompt: {
              description: "Professional business environment",
              colors: brandColors,
              style: style,
              aspectRatio: "1:1",
              elements: [],
              mood: tone
            },
            altText: "Business office scene",
            rationale: "Focuses on professional appeal",
            imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
            textOverlay: {
              text: "Transform Your Business",
              position: textPosition
            }
          },
          {
            variant: "B",
            caption: `✨ ${theme} \n\nUnlock your potential with our premium services. \n\n#growth #success #premium`,
            hashtags: ["#growth", "#success", "#premium"],
            headlineText: "Achieve More",
            imagePrompt: {
              description: "Abstract representation of growth",
              colors: brandColors,
              style: style,
              aspectRatio: "1:1",
              elements: [],
              mood: tone
            },
            altText: "Abstract growth visualization",
            rationale: "Focuses on aspirational growth",
            imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80",
            textOverlay: {
              text: "Achieve More",
              position: textPosition
            }
          }
        ];

        toast.success("Posts generated successfully!");
        if (onPostGenerated) {
          onPostGenerated(mockVariations);
        }
        setIsGenerating(false);
      }, 2000);

      /*
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You need to be logged in");
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
          companyName: companyProfile?.company_name || "Your Company",
          targetAudience: companyProfile?.target_audience || "General Audience",
          keywords: companyProfile?.keywords || ["innovation", "quality", "professionalism"],
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

      toast.success("Posts generated successfully!");

      if (onPostGenerated && data.variations) {
        onPostGenerated(data.variations);
      }
      */

    } catch (error: any) {
      console.error('Error generating post:', error);
      toast.error(error.message || "Error generating post. Please try again.");
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
            <h2 className="text-xl md:text-2xl font-display font-bold">Create Post</h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              Describe your idea and let AI create the perfect content
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
              <Label htmlFor="objective">Campaign Objective *</Label>
              <Select value={objective} onValueChange={setObjective}>
                <SelectTrigger id="objective">
                  <SelectValue placeholder="Select objective" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conversion">Conversion / Sales</SelectItem>
                  <SelectItem value="traffic">Website Traffic</SelectItem>
                  <SelectItem value="awareness">Brand Awareness</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="leads">Lead Generation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="theme">Post Theme / Description *</Label>
              <Textarea
                id="theme"
                placeholder="Ex: New product launch, summer sale, usage tips..."
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <div>
              <Label htmlFor="tone">Tone of Voice</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual / Friendly</SelectItem>
                  <SelectItem value="emotional">Emotional</SelectItem>
                  <SelectItem value="humorous">Humorous</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Visual Identity</Label>
              <Card className="p-4 space-y-3 bg-muted/30">
                <div>
                  <Label htmlFor="colors" className="text-xs">Brand Colors</Label>
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
                      Include logo in artwork
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
                    Include text overlay
                  </Label>
                </div>

                {includeTextOverlay && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <Label htmlFor="suggestedText" className="text-xs">
                        Suggested text (optional)
                      </Label>
                      <Input
                        id="suggestedText"
                        placeholder="Ex: Transform Your Business Today"
                        value={suggestedText}
                        onChange={(e) => setSuggestedText(e.target.value)}
                        maxLength={50}
                        className="mt-1 text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Leave empty for AI to generate automatically
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="textPosition" className="text-xs">
                        Text position
                      </Label>
                      <Select value={textPosition} onValueChange={(v) => setTextPosition(v as "top" | "center" | "bottom")}>
                        <SelectTrigger id="textPosition" className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top">Top</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="bottom">Bottom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            <div>
              <Label htmlFor="style">Image Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger id="style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photography">Photography</SelectItem>
                  <SelectItem value="illustration">Illustration</SelectItem>
                  <SelectItem value="3d">3D / Rendered</SelectItem>
                  <SelectItem value="flat">Flat Design</SelectItem>
                  <SelectItem value="abstract">Abstract</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cta">Call-to-Action (Optional)</Label>
              <Input
                id="cta"
                placeholder="Ex: Check link in bio, Learn more, Shop now"
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
            Clear
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
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate A/B Variations
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

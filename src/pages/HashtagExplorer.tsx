import { useState } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Hash, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function HashtagExplorer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedHashtag, setCopiedHashtag] = useState<string | null>(null);

  // Mock trending hashtags - in production, fetch from API/database
  const trendingHashtags = [
    { tag: "#marketing", category: "Business", score: 95, count: 1200000 },
    { tag: "#digitalmarketing", category: "Business", score: 92, count: 950000 },
    { tag: "#socialmedia", category: "Business", score: 88, count: 850000 },
    { tag: "#branding", category: "Business", score: 85, count: 720000 },
    { tag: "#contentcreator", category: "Creator", score: 83, count: 680000 },
    { tag: "#instagramtips", category: "Social", score: 80, count: 620000 },
    { tag: "#smallbusiness", category: "Business", score: 78, count: 580000 },
    { tag: "#entrepreneur", category: "Business", score: 75, count: 550000 },
  ];

  const categoryColors: Record<string, string> = {
    "Business": "bg-blue-500/10 text-blue-600 border-blue-200",
    "Creator": "bg-purple-500/10 text-purple-600 border-purple-200",
    "Social": "bg-pink-500/10 text-pink-600 border-pink-200",
  };

  const filteredHashtags = searchTerm
    ? trendingHashtags.filter(h => 
        h.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : trendingHashtags;

  const copyHashtag = (hashtag: string) => {
    navigator.clipboard.writeText(hashtag);
    setCopiedHashtag(hashtag);
    toast.success(`${hashtag} copiada para área de transferência`);
    setTimeout(() => setCopiedHashtag(null), 2000);
  };

  const copyAllHashtags = () => {
    const allTags = filteredHashtags.map(h => h.tag).join(" ");
    navigator.clipboard.writeText(allTags);
    toast.success(`${filteredHashtags.length} hashtags copiadas para área de transferência`);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container py-4 md:py-8 space-y-6 md:space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-display font-bold">Explorador de Hashtags</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Descubra hashtags em alta e tendências para seus posts
          </p>
        </div>

        <Card className="p-4 md:p-6 shadow-smooth">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar hashtags por palavra-chave ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={copyAllHashtags} variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Copiar Todas
            </Button>
          </div>
        </Card>

        <div className="grid gap-3 md:gap-4">
          {filteredHashtags.map((hashtag, index) => (
            <Card 
              key={hashtag.tag} 
              className="p-4 md:p-6 shadow-smooth hover:shadow-glow transition-smooth"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start md:items-center gap-3 md:gap-4 flex-1">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Hash className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-base md:text-lg font-semibold truncate">{hashtag.tag}</h3>
                      <Badge 
                        variant="outline" 
                        className={categoryColors[hashtag.category] || ""}
                      >
                        {hashtag.category}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                        <span>Score: {hashtag.score}</span>
                      </div>
                      <div>
                        {(hashtag.count / 1000).toFixed(0)}k posts
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyHashtag(hashtag.tag)}
                  className="w-full md:w-auto"
                >
                  {copiedHashtag === hashtag.tag ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredHashtags.length === 0 && (
          <Card className="p-8 md:p-12 text-center">
            <Hash className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">Nenhuma hashtag encontrada</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Tente buscar por outras palavras-chave
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}

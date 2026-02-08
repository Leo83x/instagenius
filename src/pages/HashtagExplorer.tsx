import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Search, TrendingUp, Hash, Copy, Check, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Hashtag {
  tag: string;
  category: string;
  score: number;
  estimatedReach?: number;
  description?: string;
}

export default function HashtagExplorer() {
  const [keywords, setKeywords] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedHashtag, setCopiedHashtag] = useState<string | null>(null);
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Load saved hashtags on mount
  useEffect(() => {
    loadSavedHashtags();
  }, []);

  const loadSavedHashtags = async () => {
    const { data, error } = await supabase
      .from('hashtag_trends')
      .select('*')
      .order('trending_score', { ascending: false })
      .limit(20);

    if (!error && data) {
      setHashtags(data.map(h => ({
        tag: h.hashtag,
        category: h.category || 'General',
        score: h.trending_score || 0,
        estimatedReach: 0,
      })));
    }
  };

  const filteredHashtags = searchTerm
    ? hashtags.filter(h =>
      h.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : hashtags;

  const searchHashtags = async () => {
    if (!keywords.trim()) {
      toast.error('Enter keywords to search');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const { data, error } = await supabase.functions.invoke('search-hashtags', {
        body: {
          keywords: keywords.trim(),
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.hashtags) {
        setHashtags(data.hashtags);
        toast.success(`${data.hashtags.length} hashtags found!`);
      } else {
        toast.error('No hashtags found');
      }
    } catch (error: any) {
      console.error('Error searching hashtags:', error);
      toast.error('Error searching hashtags: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSearching(false);
    }
  };

  const categoryColors: Record<string, string> = {
    "Brand": "bg-gradient-to-br from-purple-500/10 to-pink-500/10 text-purple-700 border-purple-200",
    "Niche": "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 text-blue-700 border-blue-200",
    "Long Tail": "bg-gradient-to-br from-green-500/10 to-emerald-500/10 text-green-700 border-green-200",
    "General": "bg-gradient-to-br from-gray-500/10 to-slate-500/10 text-gray-700 border-gray-200",
  };

  const copyHashtag = (hashtag: string) => {
    navigator.clipboard.writeText(hashtag);
    setCopiedHashtag(hashtag);
    toast.success(`${hashtag} copied!`);
    setTimeout(() => setCopiedHashtag(null), 2000);
  };

  const copyAllHashtags = () => {
    const allTags = filteredHashtags.map(h => h.tag).join(" ");
    navigator.clipboard.writeText(allTags);
    toast.success(`${filteredHashtags.length} hashtags copied!`);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />

      <main className="container py-4 md:py-8 space-y-6 md:space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-display font-bold">Hashtag Explorer</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Search for strategic hashtags based on your business
          </p>
        </div>

        {/* Search Section */}
        <Card className="p-4 md:p-6 shadow-smooth">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Keywords about your business
              </label>
              <Textarea
                placeholder="Ex: photography, weddings, corporate events, professional portraits..."
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Enter keywords related to your business, products or services
              </p>
            </div>

            <Button
              onClick={searchHashtags}
              disabled={isSearching}
              className="w-full"
              size="lg"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching for smart hashtags...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Search Hashtags with AI
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Filter Section - only show if we have hashtags */}
        {hashtags.length > 0 && (
          <Card className="p-4 md:p-6 shadow-smooth">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter hashtags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={copyAllHashtags} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copy All
              </Button>
            </div>
          </Card>
        )}

        {/* Results Section */}
        {hashtags.length > 0 ? (
          <div className="grid gap-3 md:gap-4">
            {filteredHashtags.map((hashtag) => (
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
                          className={categoryColors[hashtag.category] || categoryColors.General}
                        >
                          {hashtag.category}
                        </Badge>
                      </div>

                      {hashtag.description && (
                        <p className="text-xs md:text-sm text-muted-foreground mb-2">
                          {hashtag.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                          <span>Relevance: {hashtag.score}/100</span>
                        </div>
                        {hashtag.estimatedReach && hashtag.estimatedReach > 0 && (
                          <div>
                            ~{(hashtag.estimatedReach / 1000).toFixed(0)}k posts
                          </div>
                        )}
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
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : hasSearched ? (
          <Card className="p-8 md:p-12 text-center">
            <Hash className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">No hashtags found</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Try searching with other keywords
            </p>
          </Card>
        ) : (
          <Card className="p-8 md:p-12 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">Search for smart hashtags</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Enter keywords about your business and let AI find the best hashtags for you
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}

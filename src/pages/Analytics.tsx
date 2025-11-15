import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MessageCircle, Share2, Eye, TrendingUp, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function Analytics() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPostsWithAnalytics();
  }, []);

  const loadPostsWithAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load posts with their analytics
      const { data: postsData } = await supabase
        .from("generated_posts")
        .select(`
          *,
          post_analytics (*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setPosts(postsData || []);
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast.error("Erro ao carregar analytics");
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = async (postId: string) => {
    toast.info("Funcionalidade em desenvolvimento - conecte sua conta Instagram em Configurações");
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
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-display font-bold">Analytics</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Análise de performance dos seus posts publicados
          </p>
        </div>

        {posts.length === 0 ? (
          <Card className="p-8 md:p-12 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">Nenhum post ainda</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Publique seus primeiros posts para ver as análises aqui
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:gap-6">
            {posts.map((post) => {
              const analytics = post.post_analytics?.[0];
              
              return (
                <Card key={post.id} className="p-4 md:p-6 shadow-smooth hover:shadow-glow transition-smooth">
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                    {/* Post Image */}
                    {post.image_url && (
                      <div className="w-full md:w-40 h-40 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                        <img 
                          src={post.image_url} 
                          alt={post.alt_text || "Post"} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Post Info */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant="secondary">{post.post_type}</Badge>
                          <Badge variant="outline">{post.variant}</Badge>
                        </div>
                        <p className="text-sm line-clamp-2 text-muted-foreground">
                          {post.caption}
                        </p>
                      </div>

                      {/* Analytics Stats */}
                      {analytics ? (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Heart className="h-4 w-4 text-pink-500" />
                            <span className="font-medium">{analytics.likes_count}</span>
                            <span className="text-muted-foreground hidden md:inline">Curtidas</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MessageCircle className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{analytics.comments_count}</span>
                            <span className="text-muted-foreground hidden md:inline">Comentários</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Share2 className="h-4 w-4 text-green-500" />
                            <span className="font-medium">{analytics.shares_count}</span>
                            <span className="text-muted-foreground hidden md:inline">Compartilh.</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Eye className="h-4 w-4 text-purple-500" />
                            <span className="font-medium">{analytics.reach}</span>
                            <span className="text-muted-foreground hidden md:inline">Alcance</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="h-4 w-4 text-orange-500" />
                            <span className="font-medium">{analytics.engagement_rate}%</span>
                            <span className="text-muted-foreground hidden md:inline">Engaj.</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Conecte sua conta Instagram para ver métricas
                        </div>
                      )}

                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => refreshAnalytics(post.id)}
                        className="w-full md:w-auto"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Atualizar Métricas
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

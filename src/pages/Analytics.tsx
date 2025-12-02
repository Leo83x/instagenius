import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MessageCircle, Share2, Eye, TrendingUp, RefreshCw, Hash, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Analytics() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hashtagData, setHashtagData] = useState<any[]>([]);
  const [timeData, setTimeData] = useState<any[]>([]);
  const [growthData, setGrowthData] = useState<any[]>([]);

  useEffect(() => {
    loadPostsWithAnalytics();
    loadHashtagPerformance();
    loadTimeAnalysis();
    loadGrowthData();
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

  const loadHashtagPerformance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("generated_posts")
        .select("hashtags, post_analytics(*)")
        .eq("user_id", user.id)
        .not("post_analytics", "is", null);

      const hashtagMap = new Map();
      data?.forEach((post) => {
        const analytics = post.post_analytics?.[0];
        if (analytics) {
          post.hashtags.forEach((tag: string) => {
            const current = hashtagMap.get(tag) || { hashtag: tag, engagement: 0, reach: 0, count: 0 };
            current.engagement += analytics.likes_count + analytics.comments_count;
            current.reach += analytics.reach || 0;
            current.count += 1;
            hashtagMap.set(tag, current);
          });
        }
      });

      const topHashtags = Array.from(hashtagMap.values())
        .map((h) => ({ ...h, avgEngagement: Math.round(h.engagement / h.count) }))
        .sort((a, b) => b.avgEngagement - a.avgEngagement)
        .slice(0, 10);

      setHashtagData(topHashtags);
    } catch (error) {
      console.error("Error loading hashtag performance:", error);
    }
  };

  const loadTimeAnalysis = async () => {
    const mockTimeData = [
      { hour: "6h", engagement: 45 },
      { hour: "9h", engagement: 120 },
      { hour: "12h", engagement: 200 },
      { hour: "15h", engagement: 180 },
      { hour: "18h", engagement: 320 },
      { hour: "21h", engagement: 280 },
      { hour: "0h", engagement: 80 }
    ];
    setTimeData(mockTimeData);
  };

  const loadGrowthData = async () => {
    const mockGrowthData = [
      { date: "Sem 1", followers: 1200, posts: 3 },
      { date: "Sem 2", followers: 1350, posts: 5 },
      { date: "Sem 3", followers: 1480, posts: 4 },
      { date: "Sem 4", followers: 1720, posts: 6 }
    ];
    setGrowthData(mockGrowthData);
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
      
      <main className="container py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Análise detalhada de performance e insights
          </p>
        </div>

        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
            <TabsTrigger value="timing">Horários</TabsTrigger>
            <TabsTrigger value="growth">Crescimento</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">

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
          </TabsContent>

          <TabsContent value="hashtags" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Hash className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Performance de Hashtags</h2>
              </div>
              {hashtagData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={hashtagData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hashtag" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgEngagement" fill="hsl(var(--primary))" name="Engajamento Médio" />
                    <Bar dataKey="count" fill="hsl(var(--accent))" name="Uso" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Publique posts com hashtags para ver a análise
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="timing" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Melhores Horários de Engajamento</h2>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="engagement" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    name="Engajamento"
                  />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Horários com maior engajamento: <strong>18h - 21h</strong>
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="growth" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Crescimento de Seguidores</h2>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="followers" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    name="Seguidores"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="posts" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    name="Posts Publicados"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

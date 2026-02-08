import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, FileText, Clock, TrendingUp, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function StatsOverview() {
  const [stats, setStats] = useState({
    postsGerados: 0,
    postsAgendados: 0,
    aiCredits: 0,
    aiCreditsTotal: 100,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Demo Mode: Mock stats
      setStats({
        postsGerados: 12,
        postsAgendados: 5,
        aiCredits: 85,
        aiCreditsTotal: 100,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    {
      label: "Generated Posts",
      value: stats.postsGerados.toString(),
      change: "Total",
      icon: FileText,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      label: "Scheduled Posts",
      value: stats.postsAgendados.toString(),
      change: "Pending",
      icon: Calendar,
      gradient: "from-pink-500 to-orange-500"
    },
    {
      label: "Time Saved",
      value: `${Math.floor(stats.postsGerados * 0.5)}h`,
      change: "Estimated",
      icon: Clock,
      gradient: "from-orange-500 to-yellow-500"
    },
    {
      label: "AI Credits",
      value: stats.aiCredits.toString(),
      change: `of ${stats.aiCreditsTotal}`,
      icon: CreditCard,
      gradient: "from-yellow-500 to-pink-500"
    }
  ];

  if (loading) {
    return (
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="p-4 md:p-6 animate-pulse">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-lg" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => (
        <Card
          key={index}
          className="p-4 md:p-6 shadow-smooth transition-all duration-300 hover:shadow-glow hover:scale-105 animate-in fade-in slide-in-from-bottom-4"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0 flex-1">
              <p className="text-xs md:text-sm text-muted-foreground truncate">{stat.label}</p>
              <p className="text-xl md:text-2xl font-display font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </div>
            <div className={`h-10 w-10 md:h-12 md:w-12 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:rotate-12`}>
              <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

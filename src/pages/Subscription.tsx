import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Check, Crown, Zap, Sparkles, CreditCard, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Subscription() {
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load company profile for AI credits
      const { data: profileData } = await supabase
        .from("company_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setProfile(profileData);

      // Load subscription info
      let { data: subData } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // Se não existir subscription, criar uma com plano gratuito
      if (!subData) {
        const { data: newSub, error } = await supabase
          .from("subscriptions")
          .insert([{
            user_id: user.id,
            plan_type: 'free',
            status: 'active'
          }])
          .select()
          .single();

        if (!error) {
          subData = newSub;
        }
      }

      setSubscription(subData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async (planName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Definir créditos por plano
      const creditsByPlan: Record<string, { total: number; remaining: number }> = {
        'Gratuito': { total: 100, remaining: 100 },
        'Pro': { total: 500, remaining: 500 },
        'Business': { total: 2000, remaining: 2000 }
      };

      const planConfig = creditsByPlan[planName] || creditsByPlan['Gratuito'];
      const planType = planName.toLowerCase().replace('gratuito', 'free');

      // Atualizar subscription
      await supabase
        .from("subscriptions")
        .update({
          plan_type: planType,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq("user_id", user.id);

      // Atualizar créditos no perfil
      if (profile) {
        await supabase
          .from("company_profiles")
          .update({
            ai_credits_total: planConfig.total,
            ai_credits_remaining: planConfig.remaining,
            ai_credits_last_reset: new Date().toISOString()
          })
          .eq("user_id", user.id);
      }

      toast.success(`Plan changed to ${planName}!`);
      loadData();
    } catch (error) {
      console.error("Error changing plan:", error);
      toast.error("Error changing plan");
    }
  };

  const plans = [
    {
      name: "Free",
      price: "R$ 0",
      period: "/month",
      icon: Sparkles,
      gradient: "from-gray-500 to-gray-600",
      planType: "free",
      features: [
        "100 AI credits per month",
        "5 posts per day",
        "Basic analytics",
        "Theme suggestions",
      ],
      current: subscription?.plan_type === "free" || !subscription,
    },
    {
      name: "Pro",
      price: "R$ 49",
      period: "/month",
      icon: Zap,
      gradient: "from-purple-500 to-pink-500",
      planType: "pro",
      features: [
        "500 AI credits per month",
        "Unlimited posts",
        "Advanced analytics",
        "AI Theme suggestions",
        "Priority support",
      ],
      popular: true,
      current: subscription?.plan_type === "pro",
    },
    {
      name: "Business",
      price: "R$ 99",
      period: "/month",
      icon: Crown,
      gradient: "from-orange-500 to-yellow-500",
      planType: "business",
      features: [
        "2000 AI credits per month",
        "Unlimited posts",
        "Full analytics",
        "Multiple accounts",
        "API access",
        "Dedicated support",
      ],
      current: subscription?.plan_type === "business",
    },
  ];

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
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold">
            Choose Your Plan
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Unlock full potential of Studio Genius with our flexible plans
          </p>
        </div>

        {/* Current AI Credits */}
        {profile && (
          <Card className="p-4 md:p-6 max-w-2xl mx-auto shadow-smooth">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Available AI Credits</h3>
                  <p className="text-sm text-muted-foreground">
                    {profile.ai_credits_remaining} of {profile.ai_credits_total} credits
                  </p>
                </div>
              </div>
              <div className="w-full md:w-auto">
                <div className="w-full md:w-48 bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${(profile.ai_credits_remaining / profile.ai_credits_total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Plans */}
        <div className="grid gap-4 md:gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={`p-6 shadow-smooth hover:shadow-glow transition-smooth relative ${plan.popular ? "border-2 border-primary" : ""
                  }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                      {plan.current && (
                        <Badge variant="secondary" className="mt-1">
                          Current Plan
                        </Badge>
                      )}
                    </div>
                    <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.current ? "outline" : "default"}
                    onClick={() => handleChangePlan(plan.name)}
                    disabled={plan.current}
                  >
                    {plan.current ? "Current Plan" : "Select Plan"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="p-6 md:p-8 max-w-4xl mx-auto shadow-smooth bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <div className="text-center space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">Need more?</h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Contact us for customized business plans
            </p>
            <Button variant="outline">
              Contact Sales
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Instagram, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async (isSignUp: boolean) => {
    setLoading(true);
    try {
<<<<<<< HEAD
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) throw error;

      toast.success("Account created successfully! You are now connected.");
    } catch (error: any) {
      toast.error(error.message || "Error creating account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Login successful!");
    } catch (error: any) {
      toast.error(error.message || "Error logging in");
    } finally {
      setIsLoading(false);
=======
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Account created! You can now log in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Login successful!");
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md p-8 shadow-smooth bg-white/80 backdrop-blur">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center mb-4 shadow-lg">
            <Instagram className="h-8 w-8 text-white" />
          </div>
<<<<<<< HEAD
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">InstaGenius</h1>
          <p className="text-muted-foreground">
            Transform ideas into professional posts with AI
          </p>
        </div>

        <Tabs defaultValue="signin" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
=======
          <h1 className="text-3xl font-display font-bold text-gray-900">InstaGenius</h1>
          <p className="text-muted-foreground mt-2 text-center">
            Transform ideas into professional AI posts
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login">Login</TabsTrigger>
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
<<<<<<< HEAD
              <div>
                <Label htmlFor="signin-password">Password</Label>
=======
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button
<<<<<<< HEAD
                type="submit"
                variant="gradient"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Sign In
                  </>
=======
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all"
                onClick={() => handleAuth(false)}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                )}
                Login
              </Button>
            </div>
          </TabsContent>

<<<<<<< HEAD
          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="signup-name">Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
=======
          <TabsContent value="signup">
            <div className="space-y-4">
              <div className="space-y-2">
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
<<<<<<< HEAD
              <div>
=======
              <div className="space-y-2">
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
<<<<<<< HEAD
                <p className="text-xs text-muted-foreground mt-1">
                  At least 6 characters
                </p>
              </div>
              <Button
                type="submit"
                variant="gradient"
=======
              </div>
              <Button
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
                className="w-full"
                variant="outline"
                onClick={() => handleAuth(true)}
                disabled={loading}
              >
<<<<<<< HEAD
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Sign Up
                  </>
                )}
=======
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Create Account
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
              </Button>
            </div>
          </TabsContent>
        </Tabs>

<<<<<<< HEAD
        <p className="text-center text-xs text-muted-foreground mt-6">
=======
        <p className="text-xs text-center text-muted-foreground mt-8">
>>>>>>> 264721b682500ae016420bfadac81a761fa2d3d6
          By creating an account, you agree to our terms and policies
        </p>
      </Card>
    </div>
  );
}

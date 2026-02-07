import { Instagram, Settings as SettingsIcon, LogOut, BookmarkCheck, Link2, BarChart3, Lightbulb, CreditCard, Menu, User, Image, CalendarDays, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NavLink } from "./NavLink";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";


export function Header() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logout realizado com sucesso");
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Erro ao fazer logout");
    }
  };

  const mainNavItems = [
    { to: "/", label: "Início", icon: Instagram },
    { to: "/posts", label: "Posts", icon: BookmarkCheck },
    { to: "/schedule", label: "Agenda", icon: CalendarDays },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/themes", label: "Temas", icon: Lightbulb },
    { to: "/images", label: "Imagens", icon: Image },
  ];

  const accountMenuItems = [
    { to: "/instagram", label: "Instagram", icon: Link2 },
    { to: "/subscription", label: "Planos", icon: CreditCard },
    { to: "/settings", label: "Configurações", icon: SettingsIcon },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-instagram">
              <Instagram className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-display font-bold">Studio Genius</h1>
              <p className="text-xs text-muted-foreground">Gerador de Conteúdo IA</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 flex-1">
            {mainNavItems.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          {mounted && (
            <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}

          {/* Account Menu Dropdown - Desktop */}
          <div className="hidden lg:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {accountMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.to} onClick={() => navigate(item.to)}>
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <div className="flex flex-col gap-4 mt-8">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-instagram">
                    <Instagram className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold">Studio Genius</h2>
                    <p className="text-xs text-muted-foreground">Menu</p>
                  </div>
                </div>
                
                <nav className="flex flex-col gap-2">
                  {[...mainNavItems, ...accountMenuItems].map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.to}
                        variant="ghost"
                        className="justify-start"
                        onClick={() => {
                          navigate(item.to);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </Button>
                    );
                  })}
                </nav>

                <div className="pt-4 border-t mt-auto">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

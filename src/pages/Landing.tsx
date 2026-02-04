
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Wand2, BarChart3, Calendar, ShieldCheck, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Navbar */}
            <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        <Zap className="h-6 w-6 text-purple-600" />
                        InstaGenius
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login">
                            <Button variant="ghost">Entrar</Button>
                        </Link>
                        <Link to="/login">
                            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-opacity">
                                Começar Grátis
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-orange-500/5 -z-10" />
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center space-y-8 text-center">
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                            ✨ Nova Era do Marketing
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight lg:text-7xl max-w-4xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            Transforme seu Instagram em uma Máquina de Vendas com IA
                        </h1>
                        <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
                            Crie posts virais, agende conteúdo e analise métricas em segundos.
                            Aumente seu engajamento em até 300% sem gastar horas no Canva.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                            <Link to="/login">
                                <Button size="lg" className="h-12 px-8 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 w-full sm:w-auto">
                                    Testar Gratuitamente <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button size="lg" variant="outline" className="h-12 px-8 text-lg w-full sm:w-auto">
                                    Ver Demonstração
                                </Button>
                            </Link>
                        </div>

                        {/* Social Proof / Trust */}
                        <div className="pt-8 flex flex-col items-center gap-4 text-sm text-muted-foreground">
                            <p>Confiado por +1000 criadores e empresas</p>
                            <div className="flex items-center gap-8 opacity-50 grayscale">
                                {/* Placeholders for logos, using text for now */}
                                <span className="font-bold text-xl">ACME Corp</span>
                                <span className="font-bold text-xl">StartUp One</span>
                                <span className="font-bold text-xl">Global Tech</span>
                                <span className="font-bold text-xl">Indie Makers</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-muted/50">
                <div className="container px-4 md:px-6">
                    <div className="grid gap-12 lg:grid-cols-3">
                        <div className="flex flex-col items-start space-y-4 rounded-lg border p-6 bg-background shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
                                <Wand2 className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold">Criação com IA</h3>
                            <p className="text-muted-foreground">
                                Gere legendas, hashtags e imagens completas com um clique. Nossa IA entende o seu nicho.
                            </p>
                        </div>
                        <div className="flex flex-col items-start space-y-4 rounded-lg border p-6 bg-background shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-3 rounded-full bg-pink-100 dark:bg-pink-900/20">
                                <Calendar className="h-6 w-6 text-pink-600" />
                            </div>
                            <h3 className="text-xl font-bold">Agendamento Inteligente</h3>
                            <p className="text-muted-foreground">
                                Planeje seu calendário editorial visualmente. Publique automaticamente nos melhores horários.
                            </p>
                        </div>
                        <div className="flex flex-col items-start space-y-4 rounded-lg border p-6 bg-background shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/20">
                                <BarChart3 className="h-6 w-6 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold">Analytics Avançado</h3>
                            <p className="text-muted-foreground">
                                Descubra o que funciona. Métricas detalhadas de crescimento, alcance e engajamento.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-24">
                <div className="container px-4 md:px-6">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 text-center">
                        <div className="space-y-2">
                            <h3 className="text-4xl font-bold text-purple-600">300%</h3>
                            <p className="text-muted-foreground">Mais Engajamento</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-4xl font-bold text-pink-600">10h</h3>
                            <p className="text-muted-foreground">Economizadas/Semana</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-4xl font-bold text-orange-600">50k+</h3>
                            <p className="text-muted-foreground">Posts Gerados</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-4xl font-bold text-blue-600">24/7</h3>
                            <p className="text-muted-foreground">Suporte Especializado</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white">
                <div className="container px-4 md:px-6 text-center">
                    <div className="flex flex-col items-center space-y-6 max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                            Pronto para escalar seu negócio?
                        </h2>
                        <p className="text-gray-300 md:text-xl/relaxed">
                            Junte-se a milhares de empreendedores que já estão usando IA para dominar o Instagram.
                        </p>
                        <Link to="/login">
                            <Button size="lg" variant="secondary" className="h-12 px-8 text-lg w-full sm:w-auto">
                                Começar Agora - É Grátis
                            </Button>
                        </Link>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            Sem cartão de crédito necessário para testar
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t py-12 bg-muted/20">
                <div className="container px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 font-bold text-lg">
                        <Zap className="h-5 w-5 text-purple-600" />
                        InstaGenius
                    </div>
                    <p className="text-sm text-muted-foreground text-center md:text-left">
                        © 2024 InstaGenius. Todos os direitos reservados.
                    </p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                        <Link to="/terms" className="hover:text-foreground">Termos</Link>
                        <Link to="/privacy" className="hover:text-foreground">Privacidade</Link>
                        <Link to="/contact" className="hover:text-foreground">Contato</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

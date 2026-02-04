
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

export default function Contact() {
    const navigate = useNavigate();
    return (
        <div className="container py-8 max-w-2xl">
            <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
            <h1 className="text-3xl font-bold mb-6">Fale Conosco</h1>
            <Card className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Email de Suporte</h3>
                        <p className="text-muted-foreground">suporte@instagenius.com</p>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground">
                    Nosso time geralmente responde em até 24 horas úteis.
                </p>
            </Card>
        </div>
    );
}

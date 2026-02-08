
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Terms() {
    const navigate = useNavigate();
    return (
        <div className="container py-8 max-w-4xl">
            <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
            <h1 className="text-3xl font-bold mb-6">Termos de Serviço</h1>
            <div className="prose dark:prose-invert">
                <p>Última atualização: 19 de Dezembro de 2025</p>
                <h3>1. Aceitação</h3>
                <p>Ao usar o InstaGenius, você concorda com estes termos.</p>
                <h3>2. Uso do Serviço</h3>
                <p>Você é responsável por todo o conteúdo que publica através de nossa plataforma.</p>
                <h3>3. Cancelamento</h3>
                <p>Você pode cancelar sua assinatura a qualquer momento.</p>
            </div>
        </div>
    );
}

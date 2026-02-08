
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Privacy() {
    const navigate = useNavigate();
    return (
        <div className="container py-8 max-w-4xl">
            <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
            <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>
            <div className="prose dark:prose-invert">
                <p>Sua privacidade é importante para nós.</p>
                <h3>1. Coleta de Dados</h3>
                <p>Coletamos apenas os dados necessários para o funcionamento do serviço (email, nome, conexões sociais).</p>
                <h3>2. Dados do Facebook/Instagram</h3>
                <p>Não armazenamos senhas. Usamos tokens de acesso seguros fornecidos pela Meta.</p>
                <h3>3. Contato</h3>
                <p>Para questões de privacidade, entre em contato com nosso suporte.</p>
            </div>
        </div>
    );
}

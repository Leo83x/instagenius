# Guia de Integração Instagram - Fluxo OAuth Simplificado

## 📋 Visão Geral

Este sistema permite que **usuários comuns** conectem suas contas Instagram Business sem precisar criar aplicativos no Facebook Developers ou gerenciar tokens manualmente.

## 🎯 Como Funciona

### Para Usuários Finais (Seus Clientes)
1. Clicam em "Conectar com Facebook" no painel
2. Fazem login com a conta do Facebook que gerencia a página
3. Autorizam as permissões solicitadas
4. **Pronto!** O sistema gerencia tudo automaticamente

### Para Você (Desenvolvedor do Sistema)
Você precisa configurar **uma única vez** um aplicativo Facebook que todos os seus usuários utilizarão.

## 🛠️ Configuração Inicial (Uma Vez)

### Passo 1: Criar App no Facebook Developers

1. Acesse [Facebook Developers](https://developers.facebook.com/apps)
2. Clique em **"Criar App"**
3. Escolha tipo: **"Business"** ou **"Consumer"**
4. Preencha:
   - Nome do App: "Sistema de Posts Instagram" (ou nome da sua escolha)
   - Email de contato
   
### Passo 2: Adicionar Produtos

1. No painel do app, clique em **"Adicionar Produto"**
2. Adicione: **"Facebook Login"**
3. Adicione: **"Instagram Graph API"**

### Passo 3: Configurar Facebook Login

1. Vá em **"Facebook Login" → "Configurações"**
2. Em **"URIs de redirecionamento OAuth válidos"**, adicione:
   ```
   https://seu-dominio.com/instagram
   http://localhost:5173/instagram (para desenvolvimento)
   ```
   
### Passo 4: Obter Credenciais

1. Vá em **"Configurações" → "Básico"**
2. Copie o **"ID do Aplicativo"** (App ID)
3. Copie o **"Chave Secreta do Aplicativo"** (App Secret) - clique em "Mostrar"

### Passo 5: Configurar no Sistema

1. No arquivo `.env` (local) ou nas variáveis de ambiente (produção):
   ```env
   VITE_FACEBOOK_APP_ID=seu_app_id_aqui
   ```

2. As secrets já foram configuradas via Lovable:
   - `FACEBOOK_APP_ID` - Já adicionado
   - `FACEBOOK_APP_SECRET` - Já adicionado

### Passo 6: Permissões Necessárias

As permissões solicitadas automaticamente pelo sistema:
- `instagram_basic` - Informações básicas da conta
- `instagram_content_publish` - Publicar conteúdo
- `pages_show_list` - Listar páginas do usuário
- `pages_read_engagement` - Ler métricas de engajamento

### Passo 7: App Review (Para Produção)

**Desenvolvimento:**
- Funciona apenas com contas que tenham papéis no app (Admin, Developer, Tester)
- Adicione contas de teste em: App → Papéis → Testadores

**Produção:**
- Solicite App Review da Meta para as permissões acima
- Forneça:
  - Vídeo demonstrando como o app usa as permissões
  - URL de privacidade
  - URL de termos de serviço
  - Casos de uso detalhados

## 🔄 Fluxo Técnico

### 1. Usuário Inicia Conexão
```
Usuário clica → Sistema redireciona para Facebook OAuth
```

### 2. Facebook Autentica
```
Usuário faz login → Autoriza permissões → Facebook retorna código
```

### 3. Sistema Processa
```
Edge Function recebe código → 
Troca por access token →
Obtém páginas do Facebook →
Identifica Instagram Business →
Solicita long-lived token (60 dias) →
Salva no banco de dados
```

### 4. Gerenciamento Automático
```
Sistema monitora expiração →
Alerta usuário 7 dias antes →
Permite renovação com 1 clique →
Tokens válidos por 60 dias
```

## 📊 Estados de Erro Comuns

### 1. "Nenhuma página encontrada"
**Causa:** Usuário não tem uma Página do Facebook  
**Solução:** Instruir a criar uma página em facebook.com/pages/create

### 2. "Página não está conectada a uma conta Instagram Business"
**Causa:** Página existe mas não tem Instagram vinculado  
**Solução:** Conectar Instagram Business nas configurações da página

### 3. "Token expirado"
**Causa:** Token passou de 60 dias sem renovação  
**Solução:** Sistema mostra botão "Renovar Token" ou reconectar

### 4. "Permissões insuficientes"
**Causa:** Usuário não autorizou todas as permissões  
**Solução:** Desconectar e reconectar, autorizando todas as permissões

### 5. "Invalid OAuth redirect URI"
**Causa:** URL de redirecionamento não está configurada no app  
**Solução:** Adicionar a URL nas configurações do Facebook Login

## 🔒 Segurança

### Dados Armazenados
- ✅ Access Token (criptografado no banco)
- ✅ Instagram User ID
- ✅ Facebook Page ID
- ✅ Data de expiração do token
- ❌ **Nunca** armazenamos senha do usuário

### Best Practices Implementadas
- Tokens long-lived (60 dias)
- Renovação automática disponível
- CORS headers configurados
- Validação de usuário autenticado
- RLS policies no Supabase

## 🎨 Componentes da Interface

### Tela de Conexão (Não Conectado)
- Card explicativo com passo a passo visual
- Botão destacado "Conectar com Facebook"
- Alert informativo sobre requisitos (Instagram Business)
- Opção alternativa para conexão manual (para usuários técnicos)

### Tela de Conexão (Conectado)
- Badge verde de sucesso com @username
- Informação de data de expiração do token
- Alert se token próximo de expirar (< 7 dias)
- Alert vermelho se token expirado
- Botão "Renovar Token"
- Botão "Desconectar"
- Dica sobre renovação periódica

## 🚀 Testando Localmente

1. Configure o `.env`:
   ```env
   VITE_FACEBOOK_APP_ID=your_test_app_id
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Acesse: `http://localhost:5173/instagram`

4. Use uma conta de teste do Facebook (configurada nos papéis do app)

## 📱 Fluxo do Usuário Final

```
1. Dashboard → Configurações → Instagram
2. Vê tela explicativa com 3 passos
3. Clica "Conectar com Facebook"
4. [Redireciona para Facebook]
5. Faz login (se necessário)
6. Vê permissões solicitadas
7. Clica "Continuar"
8. [Retorna para o sistema]
9. Vê mensagem: "Instagram conectado! Conta: @username"
10. Token válido por 60 dias
```

## 🔧 Manutenção

### Renovação de Tokens
- Usuários são alertados 7 dias antes da expiração
- Podem renovar com 1 clique (não precisa fazer login novamente)
- Renovação estende por mais 60 dias

### Reconexão
- Se token expirar completamente, usuário precisa reconectar
- Processo idêntico à conexão inicial
- Dados antigos são sobrescritos

## 📞 Suporte

### Para Usuários que Reportam Erros

1. **"Não consigo conectar"**
   - Verificar se tem Instagram Business (não Creator ou Personal)
   - Verificar se Instagram está conectado a uma página
   - Tentar em outro navegador

2. **"Deu erro na autorização"**
   - Limpar cache do navegador
   - Tentar em janela anônima
   - Verificar se não bloqueou pop-ups

3. **"Token expira rápido demais"**
   - Explicar que 60 dias é o padrão da Meta
   - Instruir a clicar em "Renovar Token" mensalmente

## 🎯 Próximos Passos

### Para Deploy em Produção
1. ✅ Configure as variáveis de ambiente no ambiente de produção
2. ✅ Adicione a URL de produção nos URIs de redirecionamento OAuth
3. ⚠️ Solicite App Review da Meta
4. ⚠️ Configure Política de Privacidade e Termos de Uso
5. ⚠️ Aguarde aprovação (pode levar 1-3 semanas)

### Melhorias Futuras Possíveis
- [ ] Suporte para múltiplas contas Instagram
- [ ] Agendamento automático de renovação de tokens
- [ ] Notificações por email sobre expiração
- [ ] Dashboard de métricas do Instagram
- [ ] Suporte para Instagram Stories

## ⚠️ Limitações Conhecidas

1. **Requer Instagram Business:** Não funciona com contas pessoais
2. **Requer Página Facebook:** Instagram deve estar vinculado a uma página
3. **App Review:** Necessário para uso em produção com contas públicas
4. **60 dias:** Tokens precisam ser renovados periodicamente
5. **Rate Limits:** API do Instagram tem limites de requisições

## 📚 Documentação Oficial

- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [Facebook Login](https://developers.facebook.com/docs/facebook-login)
- [App Review Process](https://developers.facebook.com/docs/app-review)

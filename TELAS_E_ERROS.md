# Roteiro de Telas - Integração Instagram OAuth

## 🎬 Fluxo Completo de Telas

### Tela 1: Início - Usuário Não Conectado

**Componentes Visuais:**
```
┌─────────────────────────────────────────┐
│  [← Voltar]                             │
│                                         │
│  [🎨] Integração Instagram              │
│  Conecte sua conta para publicar        │
│  automaticamente                        │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ ✓ Conexão Simplificada com        │  │
│  │   Instagram                        │  │
│  │                                    │  │
│  │   Conecte sua conta Instagram     │  │
│  │   Business em apenas 3 cliques!   │  │
│  │                                    │  │
│  │   ① Clique em "Conectar com       │  │
│  │      Facebook"                    │  │
│  │   ② Faça login com sua conta      │  │
│  │      do Facebook                  │  │
│  │   ③ Autorize o acesso à sua       │  │
│  │      página/Instagram Business    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ ℹ️ Importante:                     │  │
│  │ Sua conta do Instagram deve estar │  │
│  │ configurada como Instagram        │  │
│  │ Business e conectada a uma Página │  │
│  │ do Facebook.                      │  │
│  └───────────────────────────────────┘  │
│                                         │
│  [Conectar com Facebook] (botão grande,│
│                          colorido)     │
│                                         │
│  Prefiro conectar manualmente com      │
│  tokens (link pequeno)                 │
└─────────────────────────────────────────┘
```

**Textos da Tela:**
- **Título:** "Integração Instagram"
- **Subtítulo:** "Conecte sua conta para publicar automaticamente"
- **Card Principal:** "Conexão Simplificada com Instagram"
- **Descrição:** "Conecte sua conta Instagram Business em apenas 3 cliques, sem complicações!"
- **Passo 1:** "Clique em 'Conectar com Facebook'"
- **Passo 2:** "Faça login com sua conta do Facebook"
- **Passo 3:** "Autorize o acesso à sua página/Instagram Business"
- **Alert:** "**Importante:** Sua conta do Instagram deve estar configurada como Instagram Business e conectada a uma Página do Facebook."
- **Botão Principal:** "Conectar com Facebook"
- **Link Alternativo:** "Prefiro conectar manualmente com tokens"

---

### Tela 2: Durante OAuth - Loading

**Componentes Visuais:**
```
┌─────────────────────────────────────────┐
│  [← Voltar]                             │
│                                         │
│  [🎨] Integração Instagram              │
│  Conecte sua conta para publicar        │
│  automaticamente                        │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │                                    │  │
│  │        [🔄 Spinner]                │  │
│  │                                    │  │
│  │      Conectando...                 │  │
│  │                                    │  │
│  │  Aguarde enquanto processamos      │  │
│  │  sua autenticação com Facebook     │  │
│  │                                    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  [Conectar com Facebook] (desabilitado)│
└─────────────────────────────────────────┘
```

**Textos da Tela:**
- **Status:** "Conectando..."
- **Descrição:** "Aguarde enquanto processamos sua autenticação com Facebook"
- **Botão:** "Conectando..." (desabilitado, com spinner)

---

### Tela 3: Conectado com Sucesso

**Componentes Visuais:**
```
┌─────────────────────────────────────────┐
│  [← Voltar]                             │
│                                         │
│  [🎨] Integração Instagram              │
│  Conecte sua conta para publicar        │
│  automaticamente                        │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ ✓ Instagram conectado com sucesso │  │
│  │   Conta: @convertamaisoficial     │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Instagram User ID                     │
│  [17841477061462489] (desabilitado)    │
│                                         │
│  Token expira em                       │
│  [12 de março de 2025] (desabilitado)  │
│                                         │
│  [🔄 Renovar Token] [🗑️ Desconectar]   │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 💡 Dica: Renove seu token a cada  │  │
│  │ 60 dias para manter a conexão     │  │
│  │ ativa. O sistema irá alertá-lo    │  │
│  │ quando estiver próximo do         │  │
│  │ vencimento.                       │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Textos da Tela:**
- **Badge de Sucesso:** "Instagram conectado com sucesso"
- **Username:** "Conta: @[username]"
- **Campo 1:** "Instagram User ID"
- **Campo 2:** "Token expira em"
- **Botão 1:** "Renovar Token"
- **Botão 2:** "Desconectar"
- **Dica:** "💡 **Dica:** Renove seu token a cada 60 dias para manter a conexão ativa. O sistema irá alertá-lo quando estiver próximo do vencimento."

---

### Tela 4: Token Próximo de Expirar (< 7 dias)

**Componentes Visuais:**
```
┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐  │
│  │ ✓ Instagram conectado com sucesso │  │
│  │   Conta: @convertamaisoficial     │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ ⚠️ Seu token expira em breve.     │  │
│  │ Recomendamos renovar agora para   │  │
│  │ evitar interrupções.              │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Instagram User ID                     │
│  [17841477061462489]                   │
│                                         │
│  Token expira em                       │
│  [15 de janeiro de 2025] (amarelo)     │
│                                         │
│  [🔄 Renovar Token] [🗑️ Desconectar]   │
└─────────────────────────────────────────┘
```

**Textos da Tela:**
- **Alert Amarelo:** "⚠️ Seu token expira em breve. Recomendamos renovar agora para evitar interrupções."
- **Data:** Exibida em amarelo indicando urgência

---

### Tela 5: Token Expirado

**Componentes Visuais:**
```
┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐  │
│  │ ✓ Instagram conectado com sucesso │  │
│  │   Conta: @convertamaisoficial     │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ ❌ Seu token expirou!             │  │
│  │ Clique em "Renovar Token" ou      │  │
│  │ reconecte sua conta.              │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Instagram User ID                     │
│  [17841477061462489]                   │
│                                         │
│  Token expira em                       │
│  [01 de janeiro de 2025] (vermelho)    │
│                                         │
│  [🔄 Renovar Token] [🗑️ Desconectar]   │
└─────────────────────────────────────────┘
```

**Textos da Tela:**
- **Alert Vermelho:** "❌ Seu token expirou! Clique em 'Renovar Token' ou reconecte sua conta."
- **Data:** Exibida em vermelho indicando expiração

---

### Tela 6: Renovando Token

**Componentes Visuais:**
```
┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐  │
│  │ ✓ Instagram conectado com sucesso │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Instagram User ID                     │
│  [17841477061462489]                   │
│                                         │
│  Token expira em                       │
│  [12 de março de 2025]                 │
│                                         │
│  [🔄 Renovando...] [Desconectar]       │
│  (spinner, desabilitado)               │
└─────────────────────────────────────────┘
```

**Textos da Tela:**
- **Botão de Renovação:** "Renovando..." (com spinner animado)
- **Toast de Sucesso:** "Token renovado com sucesso!"

---

### Tela 7: Modo Manual (Alternativo)

**Componentes Visuais:**
```
┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐  │
│  │ ⚠️ Atenção: O método manual é     │  │
│  │ mais complexo e não recomendado.  │  │
│  │ Use apenas se tiver experiência   │  │
│  │ técnica com APIs do Facebook.     │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 📱 Passo 1: Preparar sua conta    │  │
│  │ • Converta para Instagram Business│  │
│  │ • Conecte a uma Página Facebook   │  │
│  │                                    │  │
│  │ 🔑 Passo 2: Criar App no Meta     │  │
│  │ • Acesse developers.facebook.com  │  │
│  │ • Adicione Instagram Graph API    │  │
│  │ • Gere token com permissões       │  │
│  │                                    │  │
│  │ 🆔 Passo 3: Obter Instagram ID    │  │
│  │ • Acesse business.facebook.com    │  │
│  │ • Copie ID da URL                 │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Access Token *                        │
│  [Cole seu access token aqui]          │
│                                         │
│  Instagram User ID *                   │
│  [Cole seu user ID aqui]               │
│                                         │
│  [Testar Conexão] [Conectar Instagram] │
│                                         │
│  Voltar para conexão simplificada     │
│  (recomendado)                         │
└─────────────────────────────────────────┘
```

---

## 🚨 Estados de Erro - Mensagens e Ações

### Erro 1: Usuário Cancelou OAuth
**Quando acontece:** Usuário clica em "Cancelar" na tela do Facebook  
**Mensagem:** "Autenticação cancelada pelo usuário."  
**Ação:** Retorna para tela inicial de conexão  
**Código de Erro:** `error=access_denied`

### Erro 2: Nenhuma Página Encontrada
**Quando acontece:** Usuário não tem Página do Facebook  
**Mensagem:** "Nenhuma página encontrada. Certifique-se de que você tem uma Página do Facebook."  
**Ação do Usuário:**
1. Acesse facebook.com/pages/create
2. Crie uma Página
3. Tente conectar novamente  
**Código de Erro:** `pages.length === 0`

### Erro 3: Instagram Não Conectado à Página
**Quando acontece:** Página existe mas não tem Instagram vinculado  
**Mensagem:** "Esta página não está conectada a uma conta Instagram Business. Por favor, conecte uma conta Instagram Business à sua página do Facebook."  
**Ação do Usuário:**
1. Acesse Instagram → Configurações
2. Vá em "Conta" → "Mudar para conta profissional"
3. Conecte à Página do Facebook
4. Tente conectar novamente  
**Código de Erro:** `!instagram_business_account`

### Erro 4: Token Expirado
**Quando acontece:** Passou 60 dias sem renovar o token  
**Mensagem:** "Seu token expirou! Clique em 'Renovar Token' ou reconecte sua conta."  
**Ação do Usuário:**
1. Clicar em "Renovar Token" (se ainda possível)
2. OU desconectar e reconectar completamente  
**Visual:** Alert vermelho na tela

### Erro 5: Permissões Insuficientes
**Quando acontece:** Usuário não autorizou todas as permissões necessárias  
**Mensagem:** "Erro ao obter token de acesso. Permissões insuficientes."  
**Ação do Usuário:**
1. Desconectar a conta
2. Conectar novamente
3. Autorizar TODAS as permissões solicitadas  
**Código de Erro:** `error.message.includes("permissions")`

### Erro 6: Invalid OAuth Redirect URI
**Quando acontece:** URL de retorno não está configurada no App do Facebook  
**Mensagem:** "Erro de configuração. Entre em contato com o suporte."  
**Ação do Desenvolvedor:**
1. Acesse Facebook App → Facebook Login → Configurações
2. Adicione a URL em "URIs de redirecionamento OAuth válidos"  
**Código de Erro:** `redirect_uri_mismatch`

### Erro 7: App ID Não Configurado
**Quando acontece:** Variável VITE_FACEBOOK_APP_ID não está no .env  
**Mensagem:** "Configuração OAuth não encontrada. Entre em contato com o suporte."  
**Ação do Desenvolvedor:**
1. Adicionar VITE_FACEBOOK_APP_ID no .env
2. Reiniciar servidor de desenvolvimento  
**Código de Erro:** `!appId`

### Erro 8: Token Inválido (Manual)
**Quando acontece:** Usuário colou token incorreto no modo manual  
**Mensagem:** "Access Token inválido ou expirado. Por favor, gere um novo token no Meta for Developers e atualize em Configurações → Instagram."  
**Ação do Usuário:**
1. Verificar se copiou o token completo
2. Gerar novo token no Facebook Developers
3. Tentar novamente  
**Visual:** Toast de erro vermelho

### Erro 9: Instagram ID Inválido (Manual)
**Quando acontece:** Usuário colou ID errado no modo manual  
**Mensagem:** "Instagram User ID inválido ou sem permissões. Certifique-se de que: 1. O ID informado é o Instagram Business Account ID 2. O token tem permissão para acessar esta conta 3. A conta Instagram está conectada a uma página do Facebook"  
**Ação do Usuário:**
1. Verificar se é o ID correto (17 dígitos da URL do Business Manager)
2. Não confundir com @username
3. Tentar novamente  
**Visual:** Toast de erro vermelho

### Erro 10: Falha na Renovação
**Quando acontece:** Erro ao tentar renovar token  
**Mensagem:** "Erro ao renovar token. Por favor, reconecte sua conta."  
**Ação do Usuário:**
1. Desconectar
2. Conectar novamente via OAuth
**Visual:** Toast de erro + redireciona para tela de conexão

---

## 🎨 Paleta de Cores dos Estados

- **Sucesso:** Verde (`bg-green-500/10`, `border-green-500/20`, `text-green-500`)
- **Aviso:** Amarelo (`bg-yellow-500/10`, `border-yellow-500/20`, `text-yellow-600`)
- **Erro:** Vermelho (`bg-red-500/10`, `border-red-500/20`, `text-red-500`)
- **Informação:** Azul (`bg-blue-500/10`, `border-blue-500/20`)
- **Gradiente Instagram:** Roxo → Rosa → Laranja (`from-purple-500 via-pink-500 to-orange-500`)

---

## 📱 Responsividade

Todas as telas são responsivas e funcionam em:
- Desktop (1920px+)
- Tablet (768px - 1919px)
- Mobile (320px - 767px)

Cards e botões se ajustam automaticamente ao tamanho da tela.

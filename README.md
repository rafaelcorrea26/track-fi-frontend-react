# TrackFi Frontend

> Interface da aplicação TrackFi — controle financeiro pessoal.

SPA construída em React + Vite + TypeScript com Tailwind CSS v4 e tema dark.

## Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| React | 19 | UI |
| Vite | 8 | Build tool |
| TypeScript | 5 (strict) | Tipagem |
| Tailwind CSS | v4 | Estilização (via plugin Vite) |
| Lucide React | — | Ícones |

## Páginas

| Página | Rota (interna) | Descrição |
|---|---|---|
| Login | — | Autenticação com e-mail e senha |
| Cadastro | — | Criação de conta |
| Dashboard | dashboard | Resumo do mês, alertas, histórico |
| Transações | transactions | Lista mensal com filtros e parcelamento |
| Contas | accounts | Saldo por conta bancária |
| Categorias | categories | Categorias de receita e despesa |
| Sonhos | dreams | Metas financeiras com aportes |
| Cartões | credit-cards | Faturas e lançamentos parcelados |
| Orçamentos | budget | Limite por categoria com alertas |
| Relatórios | reports | Por categoria, histórico, top gastos |
| Sugestões | suggestions | Análise automática das finanças |

## Estrutura do projeto

```
src/
├── App.tsx                     # Guarda de rota (token → AppShell ou Login)
├── main.tsx                    # Entrada da aplicação
├── index.css                   # Tailwind + @theme {} dark mode
├── lib/
│   └── utils.ts                # cn(), formatCurrency(), formatDate()
├── services/
│   └── api.ts                  # fetch genérico com Bearer automático
├── types/
│   └── index.ts                # Todos os tipos TypeScript
├── components/
│   └── layout/
│       └── AppShell.tsx        # Sidebar desktop + bottom nav mobile
└── pages/
    ├── auth/                   # Login, Register
    ├── accounts/               # Accounts, AccountCard, AccountForm
    ├── categories/             # Categories, CategoryForm
    ├── transactions/           # Transactions, TransactionCard, TransactionForm, Filters
    ├── dreams/                 # Dreams, DreamCard, DreamForm, ContributionModal
    ├── credit-cards/           # CreditCards, CardForm, CardTransactionForm
    ├── budget/                 # Budget, BudgetCategoryRow, BudgetForm
    ├── dashboard/              # Dashboard
    ├── reports/                # Reports (3 tabs)
    └── suggestions/            # Suggestions
```

## Rodando localmente

### Pré-requisitos

- Node 20+
- Backend TrackFi rodando (ver [track-fi-api-go](https://github.com/rafaelcorrea26/track-fi-api-go))

### Setup

```bash
# Clone o repositório
git clone https://github.com/rafaelcorrea26/track-fi-frontend-react.git
cd track-fi-frontend-react

# Instale as dependências
npm install

# Configure a URL da API
echo "VITE_API_URL=http://localhost:8080" > .env

# Rode
npm run dev
```

Acesse `http://localhost:5173`.

## Variáveis de ambiente

```env
VITE_API_URL=http://localhost:8080        # local
# VITE_API_URL=https://sua-api.railway.app  # produção
```

> Todas as variáveis usadas no frontend **devem** ter o prefixo `VITE_`.

## Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) → **New Project**
2. Importe o repositório `track-fi-frontend-react`
3. Framework: **Vite** (detectado automaticamente)
4. Em **Environment Variables**, adicione:
   ```
   VITE_API_URL = https://sua-api.railway.app
   ```
5. Clique **Deploy**

O arquivo `vercel.json` já está configurado para SPA:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

## Detalhes técnicos

**Autenticação**: JWT armazenado no `localStorage`, enviado automaticamente em todas as requisições via `Authorization: Bearer <token>`.

**API client** (`src/services/api.ts`): função genérica `api<T>(path, { method, body })` que lê `VITE_API_URL` e injeta o token automaticamente. Lança `ApiError` com `status` e `message` em caso de erro HTTP.

**Tailwind v4**: configurado via `@tailwindcss/vite` plugin (sem `tailwind.config.js`). Tema dark definido em `@theme {}` no `index.css`.

**Feature folders**: cada módulo tem seu próprio diretório em `pages/` com orquestrador + subcomponentes + `types.ts` local quando necessário.

**Navegação mobile**: bottom nav com 5 posições fixas. Páginas extras (Categorias, Cartões, Orçamentos, Relatórios, Sugestões) acessíveis via botão **Mais** com grid expansível.

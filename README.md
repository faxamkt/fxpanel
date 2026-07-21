# PainelFx — Grade de Postagens · faxa

Sistema web para a agência faxa gerenciar e compartilhar grades de postagens (calendário editorial) com clientes. A equipe cria e edita as demandas no modo Admin; cada cliente recebe um link único e permanente (`/cliente/[token]`) com visualização somente leitura + aprovação.

## Stack

- Next.js 16 (App Router) + Tailwind CSS v4
- Supabase (Postgres + Auth + Realtime)
- Deploy: Vercel

## Configurar o Supabase

1. Crie um **projeto novo e isolado** no Supabase (não reaproveite o projeto de outro produto da agência).
2. No SQL Editor do projeto, rode o conteúdo de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) e depois de [`supabase/migrations/0002_storage.sql`](supabase/migrations/0002_storage.sql), nessa ordem. Isso cria as tabelas, os triggers, as policies de RLS, as funções RPC do portal do cliente e o bucket de storage dos assets de post. Os clientes de verdade são cadastrados depois, direto pela tela `/admin` (botão "+ Novo cliente").
3. Em **Authentication → Users**, crie manualmente os usuários da equipe faxa (e-mail/senha) que poderão acessar `/admin`. Não existe tela de cadastro público — o acesso é restrito a quem for criado ali.
4. Em **Project Settings → API**, copie a `Project URL` e a `anon public key`.

## Configurar o projeto Next.js

```bash
cp .env.local.example .env.local
```

Preencha `.env.local` com os valores copiados do Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Instale as dependências e rode o servidor de desenvolvimento:

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) — a rota `/` redireciona para `/admin` (pede login) ou você pode testar o portal do cliente em `/cliente/[token]`, pegando o token na tabela `clients` do Supabase.

## Como funciona o acesso do cliente (sem login)

As tabelas `posts`, `approval_steps` e `comments` **não têm nenhuma policy de RLS para o papel `anon`** — só a equipe autenticada (`authenticated`) tem acesso direto às tabelas. O link público do cliente nunca lê essas tabelas diretamente: ele passa pelas funções `rpc_client_*` (SQL, `SECURITY DEFINER`), que exigem o `token_acesso` correto do cliente antes de devolver qualquer linha. Isso garante isolamento entre clientes no nível do banco, não só por filtro no frontend — mesmo com a `anon key` em mãos, não dá pra ler a grade de outro cliente sem o token dele.

## Atualização em tempo real

- **Admin**: usa Supabase Realtime (o usuário autenticado tem `SELECT` liberado pelas policies), então mudanças feitas por outro admin ou pelo próprio cliente aparecem na hora.
- **Cliente**: como o acesso é anônimo via RPC (sem sessão, sem RLS de `SELECT` direta), a grade do cliente é atualizada por polling curto (a cada 15s, e também ao voltar o foco pra aba) — abordagem explicitamente prevista no escopo do produto como alternativa ao Realtime.

## Deploy

Crie um **projeto novo e separado** na Vercel (domínio próprio, ex. `grade.faxa.com.br`), aponte para este repositório e configure as duas variáveis de ambiente acima em Production/Preview. Faça o primeiro deploy em Preview antes de promover para produção.

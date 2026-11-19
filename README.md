# Retni

Aplicação web de gestão financeira pessoal desenvolvida para a Fase 04 do Tech Challenge. O foco é organizar entradas, despesas, orçamentos e metas com autenticação, dados privados por usuário e uma interface responsiva.

## Video 
https://www.youtube.com/watch?v=QJNjdR1LIoA

## Link site web 
https://retni-financeiro.vercel.app/sign-in

## Tecnologias

- Next.js 16 com App Router e React
- TypeScript
- Better Auth para autenticação por e-mail e senha
- Neon Postgres e Drizzle ORM
- SWR para cache, revalidação e atualização reativa dos dados
- Zod para validação das entradas no servidor
- Tailwind CSS 4 e Lucide

## Requisitos

- Node.js 20 ou superior
- pnpm 12
- Projeto Neon configurado e acessível

## Executar localmente

1. Instale as dependências:

   ```bash
   pnpm install
   ```

2. Crie `.env.local` na raiz com as credenciais do projeto:

   ```env
   DATABASE_URL="postgresql://..."
   BETTER_AUTH_SECRET=""
   ```

   Use a connection string do Neon para `DATABASE_URL`. Gere um segredo aleatório para Better Auth com `openssl rand -base64 32` e guarde-o somente no arquivo de ambiente ou no gerenciador de segredos da implantação. Não o versione.

3. Inicie o servidor de desenvolvimento:

   ```bash
   pnpm dev
   ```

4. Abra `http://localhost:3000`, crie uma conta com e-mail e senha e comece a registrar movimentações.

## Arquitetura

O código separa responsabilidades em camadas:

- `components/`: apresentação, navegação e formulários da interface.
- `features/finance/domain/`: tipos do domínio e validação compartilhada.
- `features/finance/application/`: ações de aplicação executadas no servidor.
- `features/finance/infrastructure/`: consultas e gravações no Neon com Drizzle.
- `lib/auth/` e `lib/db/`: configuração de sessão, conexão e schema.

As consultas e mutações financeiras obtêm o usuário da sessão no servidor e aplicam escopo por `userId`. As senhas e sessões são gerenciadas pelo Better Auth. Não há persistência de dados financeiros no navegador.

## Recursos da Fase 04

- Visão geral com saldo, fluxo mensal, orçamento e lançamentos recentes.
- Criação e exclusão de entradas e despesas.
- Criação de orçamentos mensais e metas de economia com atualização de progresso.
- SWR com snapshot inicial do servidor, deduplicação de requisições e revalidação após mutações.
- Carregamento sob demanda das telas de transações, orçamentos e metas.
- Validação de entrada e isolamento das consultas por sessão.
- Cabeçalhos HTTP defensivos configurados no Next.js.



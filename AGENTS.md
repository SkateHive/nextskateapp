# Agent Guidelines

This repository contains the **Skatehive 3.0** web application. It is a Next.js based community site for the Skatehive (Hive blockchain) community.

## Technology overview
- **Node.js** 20.x
- **Package manager:** pnpm 9.x (lockfile version 9). Always use `pnpm` for installs and scripts.
- **Next.js** 15.3.2
- **Chakra UI** 2.10.9 (icons 2.2.4)
- **Tailwind CSS** 4
- **React Query** for data caching
- **Wagmi** and **Viem** for Ethereum connectivity
- **Whisk SDK** for identity resolution
- **Aioha** for Hive authentication and wallet support
- TypeScript is enabled via `tsconfig.json`.
- The project deploys on **Vercel** using the default Next.js build.

## Local setup
1. Copy `.env.local.example` to `.env.local` and update values.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the dev server:
   ```bash
   pnpm dev
   ```
4. Run lint checks with `pnpm lint`.



## Providers and dependencies
The main provider tree is defined in `app/providers.tsx`.
Key packages and their roles:

- **Aioha** – registers Hive auth options and manages wallets
- **Chakra UI** – theme and global styles through `ThemeProvider`
- **React Query** – data caching via `QueryClientProvider`
- **Wagmi** with **Viem** – Ethereum RPC connectivity
- **Whisk SDK** – social identity resolver
- **UserProvider** – stores Hive user information

Keep provider logic modular. New providers should live in their own modules under `app/` or `contexts/`.

When adding a dependency, verify the package and maintainer to avoid typosquatted packages. Check with `pnpm info <pkg>` and inspect its repository. Run `pnpm audit` after install and review subdependencies using `pnpm list <pkg>`.
  
For coding rules, file structure, and patterns, see `RULES.md`.

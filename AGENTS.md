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

## Conventions
- Use 2‑space indentation and keep TypeScript `strict` mode on.
- UI components use Chakra UI; prefer existing patterns from `components/`.
- When adding new packages, update `pnpm-lock.yaml` via pnpm.
- Commit clean code and ensure the project still builds with `pnpm build`.


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
## Best practices
- Keep files small and focused; prefer multiple short modules over a single large file.
- Limit line length to around 100 characters for readability.
- Write clear comments for complex logic and keep stateful code in hooks or contexts.

## Next.js patterns
- Default to server components. Add `"use client"` at the top of a file only when
  browser APIs or React state are required.
- Export `metadata` from each `page.tsx` to manage SEO tags and sharing cards.
- Keep route directories under `app/` with their own `page.tsx` and optional
  `layout.tsx` for nested layouts.
- Place API handlers in `app/api/<route>/route.ts`.
- Use `next/dynamic` to lazily load heavy client components.

## React patterns
- Use functional components with typed props.
- Extract reusable logic into hooks under `hooks/` and prefix them with `use`.
- Store cross-cutting state in context providers under `contexts/`.
- Name components with `PascalCase`; name hooks in `camelCase` with a `use`
  prefix.
- Clean up side effects in the return function of `useEffect`.

## File structure
- Organize route folders under `app/<segment>` with a `page.tsx` and optional
  `layout.tsx`.
- Keep shared building blocks in `components/shared`.
- Group feature components under `components/<feature>`. When a component grows
  beyond a single file, place it in its own directory:

  ```
  components/<feature>/<ComponentName>/
    index.tsx
    types.ts          # optional
    styles.ts         # or styles.module.css
  ```

- Re-export components from `components/<feature>/index.ts` so import paths stay
  short.
- Store helper functions in `utils/` and shared types in `types/`.
- `app/globals.css` should only import Tailwind layers and minimal overrides.
  Rely on Tailwind utility classes for most styling instead of large global CSS.

## Commit and testing
- Always run `pnpm lint` and `pnpm build` before committing changes.
- Use descriptive commit messages so history is easy to follow.

## AI tools
- **Cursor, Copilot, Claude** or other agents should follow these guidelines.
- Provide clear commit messages and keep related changes in a single commit.
- Run lint before committing.

For additional style rules see `RULES.md`.

# Coding Rules

These rules supplement the information in `AGENTS.md` and apply to all contributions.

1. Use **TypeScript** for all new code.
2. Indent with **2 spaces**; avoid tabs.
3. Keep imports ordered: external modules first, then internal paths.
4. Run `pnpm lint` before committing.
5. Group related changes in a single commit with a descriptive message.
6. Ensure the app builds with `pnpm build` before opening a PR.
7. Verify new dependencies with `pnpm info` and `pnpm audit` before adding them.

## File structure

- Organize route folders under `app/<segment>` with a `page.tsx` and optional `layout.tsx`.
- Keep shared building blocks in `components/shared`.
- Group feature components under `components/<feature>`. For multi-file features, create:
  ```
  components/<feature>/<ComponentName>/
    index.tsx
  ```
- Re-export components from `components/<feature>/index.ts` for concise import paths.
- Store helper functions in `utils/` and shared types in `types/`.
## Styling

- **Use Tailwind inline classes** for all styling. Apply utilities directly to JSX elements for consistency and maintainability.
- **Avoid custom CSS files** whenever possible. Tailwind's utility classes should cover the vast majority of styling needs.

## Global CSS usage

- `app/globals.css` should **only** import Tailwind layers (`@tailwind base; @tailwind components; @tailwind utilities;`) and contain minimal global overrides.
- Use `globals.css` only for extreme cases like:
  - Third-party component styling that cannot be controlled via props
  - Global resets that cannot be achieved with Tailwind utilities
  - CSS animations or keyframes that require global scope

## Conventions

- Use 2-space indentation and keep TypeScript `strict` mode on.
- UI components use Chakra UI; prefer existing patterns from `components/`.
- When adding new packages, update `pnpm-lock.yaml` via pnpm.
- Commit clean code and ensure the project still builds with `pnpm build`.

## Best practices

- Keep files small and focused; prefer multiple short modules over a single large file.
- Limit line length to around 100 characters for readability.
- Write clear comments for complex logic and keep stateful code in hooks or contexts.

## Next.js patterns

- Default to server components. Add `"use client"` at the top of a file only when browser APIs or React state are required.
- Export `metadata` from each `page.tsx` to manage SEO tags and sharing cards.
- Keep route directories under `app/` with their own `page.tsx` and optional `layout.tsx` for nested layouts.
- Place API handlers in `app/api/<route>/route.ts`.
- Use `next/dynamic` to lazily load heavy client components.

## React patterns

- Use functional components with typed props.
- Extract reusable logic into hooks under `hooks/` and prefix them with `use`.
- Store cross-cutting state in context providers under `contexts/`.
- Name components with `PascalCase`; name hooks in `camelCase` with a `use` prefix.
- Clean up side effects in the return function of `useEffect`.

## Commit and testing

- Always run `pnpm lint` and `pnpm build` before committing changes.
- Use descriptive commit messages so history is easy to follow.

## AI tools

- **Cursor, Copilot, Claude** or other agents should follow these guidelines.
- Provide clear commit messages and keep related changes in a single commit.
- Run lint before committing.

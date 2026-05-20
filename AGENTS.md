# AGENTS.md

## Build & Development

```bash
npm run dev       # Start dev server
npm run build     # Build for production (tsr generate + tsc + vite build)
npm run generate  # Regenerate TanStack Router route tree
npm run test      # Run unit tests (Vitest)
npm run typecheck # Type-check only (tsr generate + tsc -b, no build)
npm run lint      # Run ESLint
npm run format    # Format code with Prettier
npm run preview   # Preview production build
```

## Docker (development)

```bash
docker compose up -d --build   # Build and start (http://localhost:5173)
docker compose logs -f         # Follow logs
docker compose down            # Stop
```

## Lint, Format & Typecheck

- Run `npm run lint` for ESLint
- Run `npm run format` to format code with Prettier
- Run `npm run typecheck` for TypeScript type checking
- Run `npm run build` to typecheck + build

## Pre-commit Hooks (Husky)

Before each commit, in order:

1. `lint-staged` — ESLint fix + Prettier on staged files
2. `npm run test` — All unit tests must pass
3. `npm run typecheck` — TypeScript must compile

## Project Conventions

- **Framework**: Vite + React 19 + TypeScript
- **Routing**: TanStack Router (file-based, routes in `src/routes/`)
- **Styling**: Tailwind CSS v4 + tw-animate-css
- **UI Library**: shadcn/ui (components in `src/components/ui/`)
- **Icons**: lucide-react
- **Path alias**: `@/` maps to `src/`
- **State management**: React hooks (useState, useContext)
- **Testing**: Vitest (test files co-located next to source, `*.test.ts`)
- After adding a new route file, run `npm run generate` to update the route tree

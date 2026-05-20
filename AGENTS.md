# AGENTS.md

## Build & Development

```bash
npm run dev       # Start dev server
npm run build     # Build for production (tsr generate + tsc + vite build)
npm run generate  # Regenerate TanStack Router route tree
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

## Lint & Typecheck

- Run `npm run lint` for ESLint
- Run `npm run build` to typecheck with TypeScript

## Project Conventions

- **Framework**: Vite + React 19 + TypeScript
- **Routing**: TanStack Router (file-based, routes in `src/routes/`)
- **Styling**: Tailwind CSS v4 + tw-animate-css
- **UI Library**: shadcn/ui (components in `src/components/ui/`)
- **Icons**: lucide-react
- **Path alias**: `@/` maps to `src/`
- **State management**: React hooks (useState, useContext)
- After adding a new route file, run `npm run generate` to update the route tree

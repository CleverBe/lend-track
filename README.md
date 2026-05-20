# LendTrack

Admin dashboard for tracking personal loans, clients, and installment payments. Built with React + TypeScript + Vite.

## Tech Stack

- **Framework:** React 19 + TypeScript 6
- **Bundler:** Vite 8
- **Routing:** TanStack Router
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Icons:** Lucide React
- **Forms:** react-hook-form + Zod
- **Notifications:** sonner
- **Linting:** ESLint 10
- **Formatting:** Prettier

## Getting Started

### Local

```bash
npm install       # Install dependencies
npm run dev       # Start dev server
npm run build     # Build for production (tsr generate + tsc + vite build)
npm run test      # Run tests (Vitest)
npm run typecheck # Type-check without building
npm run lint      # Run ESLint
npm run format    # Format code with Prettier
npm run preview   # Preview production build
```

### Docker (development)

```bash
docker compose up -d --build   # Build and start dev server (http://localhost:5173)
docker compose logs -f         # Follow logs
docker compose down            # Stop
```

## Pre-commit Hooks

On every commit, Husky runs:

1. `lint-staged` — ESLint + Prettier on staged files
2. `npm run test` — Unit tests
3. `npm run typecheck` — TypeScript type checking

## Project Structure

```
src/
├── components/   # Shared UI and feature components
├── lib/          # Utilities, helpers, and configuration
├── routes/       # TanStack Router file-based routes
├── index.css     # Global styles and Tailwind imports
└── main.tsx      # App entry point
```

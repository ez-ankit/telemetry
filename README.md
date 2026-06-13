# Telemetry

Enterprise application monitoring and user activity analytics dashboard.

Built with [TanStack Start](https://tanstack.com/start) (React SSR), [Vite](https://vite.dev), [Tailwind CSS v4](https://tailwindcss.com), and [shadcn/ui](https://ui.shadcn.com/).

## Prerequisites

- Node.js >= 20
- npm

## Setup

```bash
npm install
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build with development mode |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

## Project structure

```
src/
├── components/   # Reusable UI and feature components
│   └── ui/       # shadcn/ui primitives
├── hooks/        # Custom React hooks
├── lib/          # Utilities and helpers
├── routes/       # File-based TanStack Start routes
│   └── __root.tsx  # App shell layout
├── server.ts     # SSR entry point with error handling
├── start.ts      # TanStack Start server entry
├── router.tsx    # Router configuration
└── styles.css    # Global styles
```

## Routes

TanStack Start uses **file-based routing**. See the [TanStack Start docs](https://tanstack.com/start/latest/docs/routing) for details.

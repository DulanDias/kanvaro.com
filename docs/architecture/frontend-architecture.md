# Frontend Architecture

Kanvaro web is built with Next.js (App Router) and React 18.

- Pages: app directory, server components by default, client components where needed
- State: React state + TanStack Query (planned) + Zustand (planned)
- Styling: Tailwind CSS + Radix UI primitives (planned)
- DnD: @dnd-kit for board drag & drop
- Realtime: socket.io-client

## Data fetching

- RSC fetch where possible, client components use fetch with credentials
- ENV: NEXT_PUBLIC_API_URL for API base

## Routing

- Major routes: `/board/[boardId]`, `/sprints`, `/time-tracking`, `/reports`

## Performance

- Image and font optimization via Next.js defaults
- Code-splitting by route

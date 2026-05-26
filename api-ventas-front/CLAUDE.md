# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

There is no test runner configured in this frontend project.

## Environment

Set `NEXT_PUBLIC_API_URL` to point at the backend. Defaults to `http://localhost:8000/api/v1`.

## Architecture

This is a **Restaurant POS (Point of Sale)** frontend for a multi-branch restaurant system. It uses **Next.js 16 App Router** with **React 19** and TypeScript.

### Key libraries

| Library | Role |
|---|---|
| `@refinedev/core` | Auth lifecycle, notifications, data provider wiring |
| `@refinedev/nextjs-router` | Refine router adapter for App Router |
| `@tanstack/react-query` v5 | All client-side data fetching and mutations |
| `zustand` | Client state (used selectively) |
| `axios` | HTTP client, wrapped in `src/lib/api-client.ts` |
| `sonner` | Toast notifications |
| `tailwindcss` v4 | Styling — CSS-first config via `@import "tailwindcss"` in globals.css |
| `framer-motion` | Animations |
| `lucide-react` | Icons |

### Auth flow

`src/lib/api-client.ts` — axios instance with two interceptors:
- **Request**: attaches `Authorization: Bearer <token>` from `localStorage.token`
- **Response**: on 401, silently refreshes via `/auth/refresh` and replays queued requests; clears storage on failure

`src/providers/authProvider.ts` — Refine `AuthProvider` implementation. Login handles two cases: direct access (single branch) and multi-membership (redirects to `/select-branch`). Auth state is stored in `localStorage` under keys: `token`, `refresh_token`, `user_role`, `branch_id`, `shift_id`.

### Role-based access

Roles: `admin`, `manager`, `cashier`, `waiter`, `kitchen` — defined in `src/lib/roles.ts`.

Route protection is two-layered:
1. `<Authenticated>` (Refine) — verifies token validity
2. `<RoleGuard allowedRoles={...}>` — checks `localStorage.user_role` and redirects unauthorized users to `/pos`

Access matrix is in `ROUTE_ROLES` in `src/lib/roles.ts`.

### Data fetching pattern

All API calls go through custom hooks in `src/hooks/`. Each hook file:
- Defines TypeScript interfaces for the resource
- Exports one `useX()` query hook and one or more `useCreateX()` / `useUpdateX()` mutation hooks
- Uses TanStack Query with `queryClient.invalidateQueries` on mutation success
- Shows toast notifications (via `sonner`) on error/success

Never call `apiClient` directly from page/component files — always go through a hook.

### Route structure

```
/login              Public — Refine auth login
/select-branch      Multi-branch membership selection
/pos                POS view (waiters, cashiers, all roles except kitchen-only)
/kitchen            Kitchen display (kitchen + admin/manager)
/cashier            Cashier checkout view
/admin/*            Admin panel — protected by RoleGuard (admin + manager only)
  categories | ingredients | products | orders | shifts | branches | tables | users | stock
```

The `/admin` segment has its own `layout.tsx` that wraps all children in `<Authenticated>` + `<RoleGuard allowedRoles={ROUTE_ROLES.admin}>`.

### Path aliases

`@/*` resolves to `src/*` (configured in `tsconfig.json`).

### Providers

`src/providers/RefineProvider.tsx` — wraps the entire app (in `layout.tsx`) with `<Refine>`, wiring together the data provider, auth provider, router, and notification provider.

`src/providers/notificationProvider.ts` — bridges Refine notifications to `sonner` toasts.

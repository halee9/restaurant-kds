# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

ziggl-pos is the POS/kitchen display web app for the Ziggl restaurant SaaS platform. It receives real-time orders via Socket.io from ziggl-server and provides kitchen order management, staff clock-in/out, cash management, order history, and analytics dashboards.

Deployed to Vercel at `pos.ziggl.app`. API calls go directly to `VITE_SERVER_URL` (defaults to `http://localhost:3001`).

## Commands

```bash
npm run dev        # Vite dev server with HMR
npm run build      # tsc -b && vite build
npm run lint       # eslint
npm run preview    # Preview production build
```

No test runner is configured. Run `npm run build` to type-check.

## Architecture

### Stack
Vite + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui + Zustand 5 + Socket.io client + react-router-dom v7.

### App Flow
1. `RestaurantLogin` — user enters restaurant code + PIN → sets session (code, name, role, staffName)
2. `AppShell` — connects Socket.io, fetches active orders, manages auto-start/auto-print/scheduled activation
3. Routes wrapped in `Layout` (Sidebar + Outlet), except `/display` (fullscreen) and `/admin` (self-authenticating)

### Role-Based Access (`utils/roles.ts`)
Three roles: `staff`, `manager`, `owner`.
- **staff**: Home `/`, Kitchen `/kds`, Clock `/clock`, Display `/display`
- **manager**: + Orders `/orders`, Cash `/cash`
- **owner**: + Dashboard `/dashboard`, Admin `/admin`

`RoleGuard` component redirects unauthorized routes to `DEFAULT_ROUTE[role]`.

### Real-Time (Socket.io)
`socket.ts` connects to server with auto-reconnect (Infinity attempts). `AppShell` joins a restaurant room and listens for `order:new`, `order:updated`, `order:cancelled`, `menu-display:updated`.

### State Management
- **`sessionStore`** (Zustand + persist): restaurantCode, role, staffName, theme, activeTab, viewMode. Persisted as `kds-session` in localStorage.
- **`kdsStore`** (Zustand, manual localStorage): orders array, connection status, KDS settings (urgency thresholds, auto-start, auto-print, sound). Settings use individual `localStorage` keys (not Zustand persist).

### Kitchen Screen (KDS)
Two view modes (`list` / `card`) with 3 tabs: Active, Scheduled, Ready·Done.
- **Active**: OPEN (non-scheduled) + IN_PROGRESS orders
- **Scheduled**: OPEN + isScheduled orders (sorted by pickupAt)
- **Ready·Done**: split view of READY and COMPLETED orders
- KDS page always forces dark theme regardless of user setting.

### Key Patterns
- **Path alias**: `@/` → `src/` (configured in vite.config.ts and tsconfig.json)
- **Money**: All amounts in cents (integers). Use `formatMoney()` from `utils.ts`.
- **Internal naming**: Code identifiers use `kds` prefix (e.g., `KDSOrder`, `useKDSStore`, `kds-session`) but UI strings say "POS" or "Kitchen".
- **Order status flow**: `PENDING_PAYMENT` → `OPEN` → `IN_PROGRESS` → `READY` → `COMPLETED`
- **API calls**: Direct `fetch()` to `SERVER_URL` in `App.tsx` and screen components. No centralized API service layer.
- **Printing**: `SilentPrintTicket` renders hidden order ticket HTML, triggered via print queue state in `AppShell`.
- **Sounds**: `utils/sounds.ts` uses Web Audio API (no external audio files).
- **UI components**: `src/components/ui/` contains shadcn/ui primitives (button, card, badge, dialog, sheet, select, etc.).

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_SERVER_URL` | ziggl-server API base URL | `http://localhost:3001` |

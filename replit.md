# QCh Presidential School Website

A full-featured multilingual presidential school website with a complete admin panel for managing all content via JSON files — no database required.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/presidential-school run dev` — run the frontend (Vite dev)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind + shadcn/ui + wouter routing
- API: Express 5 + express-session + bcryptjs + multer
- Data: JSON files (no database) — `artifacts/api-server/data/*.json`
- Uploads: `artifacts/api-server/public/uploads/` → served at `/api/uploads/`
- Backups: `artifacts/api-server/backups/` (auto-created on each write)

## Where things live

- `artifacts/presidential-school/src/pages/` — public pages (home, about, teachers, etc.)
- `artifacts/presidential-school/src/pages/admin/` — admin panel pages (11 modules)
- `artifacts/presidential-school/src/components/admin/` — shared admin components
- `artifacts/presidential-school/src/contexts/AdminContext.tsx` — auth state + API helper
- `artifacts/api-server/src/routes/admin/` — all admin REST endpoints
- `artifacts/api-server/src/lib/dataManager.ts` — file I/O + backup + init
- `artifacts/api-server/data/` — JSON data files (settings, news, teachers, etc.)

## Admin Panel

**URL:** `/admin`  
**Default credentials:** `admin` / `admin123`

Modules available:
1. Dashboard — stats overview + recent news
2. Rahbariyat (Administration) — staff CRUD with photo upload
3. O'qituvchilar (Teachers) — teacher CRUD with subject/grade filter
4. Sertifikatlar (Certificates) — certificate management with quantity controls
5. Yangiliklar (News) — rich news articles with cover images, categories, featured toggle
6. Galereya (Gallery) — album management with multi-image upload
7. Talabalar (Students) — champions/olympians CRUD with medal types
8. Qabul (Admissions) — admission stages with deadline and status tracking
9. Bog'lanish (Contact) — contact details (phone, email, address, social, map)
10. Sozlamalar (Settings) — global site settings, SEO, hero stats, social links + password change
11. Media — media library with upload, copy URL, delete

## Authentication

- Session-based via `express-session` (memory store, 24h cookie)
- Passwords hashed with `bcryptjs` (cost 10)
- Default credentials auto-generated on first startup to `data/admin.json`
- Session cookie: `httpOnly=true`, `sameSite=lax`, `secure=false`

## Multilingual Support (UZ / EN / RU)

- All content fields use `{ uz, en, ru }` objects
- `LangInput` component provides tabbed UZ/EN/RU text inputs
- Public site translations in `src/data/translations.ts`

## API Endpoints

All admin endpoints require session auth:
- `POST /api/admin/login` — authenticate
- `POST /api/admin/logout` — destroy session
- `GET /api/admin/session` — check auth status
- `GET|PUT /api/admin/settings` — global settings
- `GET|POST|PUT|DELETE /api/admin/[module]` — CRUD for each module
- `POST /api/admin/upload` — single image upload
- `POST /api/admin/upload/multiple` — bulk image upload
- `GET|DELETE /api/admin/media` — media library

## Architecture decisions

1. **No database** — all content stored in JSON files for simplicity and portability. Backups are auto-created on every write.
2. **File-based uploads** — images stored in `public/uploads/`, served at `/api/uploads/` via `express.static`.
3. **Session auth** — `express-session` memory store is sufficient for a single-admin school panel.
4. **bcryptjs** instead of native `bcrypt` — pure JS, no native compilation needed in the Replit environment.
5. **`process.cwd()`** for data paths — works because pnpm runs scripts from the package directory.

## Gotchas

- `process.cwd()` in the API server resolves to `artifacts/api-server/` because pnpm runs scripts from the package directory.
- First startup auto-generates the admin password hash and writes `data/admin.json`.
- The CORS config uses `origin: true` (reflect request origin) + `credentials: true` for session cookies to work through the Replit proxy.
- Admin routes in the frontend are separate from the public `<Layout>` — they use `AdminLayout` which has its own sidebar.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

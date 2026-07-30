---
name: Admin Panel Architecture
description: File-based JSON admin panel design decisions for the QCh School project
---

## Core decisions

**Auth:** `express-session` + `bcryptjs`. Memory store is fine for single-admin panels. Default `admin/admin123` hash generated on first startup and written to `data/admin.json`.

**Data storage:** JSON files in `artifacts/api-server/data/`. Auto-backup on every write to `artifacts/api-server/backups/`. `process.cwd()` resolves to `artifacts/api-server/` because pnpm runs scripts from the package directory.

**Uploads:** `multer` saves to `artifacts/api-server/public/uploads/`. Served at `/api/uploads/` via `express.static(UPLOADS_DIR)`. Frontend references images as `/api/uploads/filename.jpg`.

**CORS:** `origin: true, credentials: true` needed for session cookies to work through the Replit proxy (both frontend and API share same domain via proxy).

**Why bcryptjs not bcrypt:** Native `bcrypt` requires compilation; `bcryptjs` is pure JS and works in Replit without issues.

**Why process.cwd() not import.meta.url:** Cleaner and works because pnpm always changes to the package directory before running scripts.

## Frontend admin structure

- `AdminContext.tsx` — auth state + `api<T>(endpoint, options)` helper that handles 401s
- `AdminLayout.tsx` — dark navy sidebar (56px wide desktop, mobile drawer)  
- `LangInput.tsx` — UZ/EN/RU tabbed input (works for single-line and multiline)
- `ImageUpload.tsx` — drag-drop style upload to `/api/admin/upload`
- `AdminGuard` — renders `<AdminLogin />` when not authenticated (no redirect needed)
- All admin pages isolated from public `<Layout>` in the router Switch

# Industry Learning OS

## Scope
Responsive Chinese-first personal knowledge library, account-scoped cloud persistence, spaced review, exam and PWA. No paid APIs. No push without explicit user authorization.

## Structure
- `app/`: pages, API routes and global styles; `components/`: app UI and bundled primitives.
- `lib/`: knowledge content, scheduling, validation and database access.
- `db/schema.ts` and `drizzle/`: schema and generated immutable migrations.
- `public/`: PWA manifest, icons and offline fallback; no private knowledge caches.
- `tests/`: meaningful scheduling and API verification.
- `README.md`: running, deploying and known limits.
- `.sites-runtime/`, `.wrangler/`, `dist/`, `node_modules/`: generated, ignored; remove only when no longer in use.

Use English filenames and variables. Never store credentials in source. Every data query must enforce server-derived user ownership. Development account only under a development runtime guard. Validate changes before completion. Preserve parent `sources/` as read-only.

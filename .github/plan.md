# Plan: Sport Mentoring Application — Current Source of Truth

## Decisions
- Framework: Next.js 16 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS v4
- DB: PostgreSQL
- ORM: Prisma
- Auth: iron-session with database-backed administrator accounts
- Access model: multi-tenant, store-scoped data
- Roles:
	- `SUPER_ADMIN` manages administrators only
	- `MENTOR` manages players profiles: CRUD operations
    - `PLAYER` able to login, submit daily records, see graphs
- UI language: Romanian

---
aici
## Current Domain Model

### StoreAdministrator
- `storeId`: numeric primary key
- `storeName`: store display name
- `user`: unique login username
- `password`: stored as MD5 hash in current implementation
- `role`: `SUPER_ADMIN` or `STORE_ADMIN`

### Category
- `id`: string primary key
- `name`: category name
- `storeId`: owning store

### Product
- `id`: string primary key
- `code`: product code, unique per store
- `name`: product name
- `measureUnit`: unit of measure
- `stock`: current stock
- `storeId`: owning store
- `categoryId`: optional category reference

### Data Ownership Rules
- Categories and products are scoped by `storeId`.
- A store administrator can only access categories and products from their own store.
- Deleting a store administrator removes that store's products and categories as part of the deletion flow.

---

## Current Access Rules
- `/login` is public.
- `/admin/administrators*` is super-admin only.
- `/admin/products*`, `/admin/categories*`, and `/scan*` are store-admin only.
- The admin landing page redirects by role:
	- super admins -> `/admin/administrators`
	- store admins -> `/admin/products`
- Navigation is role-aware:
	- super admins see only administrator management
	- store admins see products, categories, and cumpărare

---

## Current Implementation Map

## Phase 1 — Foundation
1. Prisma schema defines `StoreAdministrator`, `Category`, `Product`, and `AdminRole`.
2. Products and categories are linked to stores through `storeId`.
3. Product codes are unique per store via `@@unique([storeId, code])`.
4. The multi-tenant migration backfills a default store for old records and adds store foreign keys.
5. Prisma client is exposed through `lib/db.ts`.

## Phase 2 — Authentication and Session Flow
6. `lib/auth.ts` defines session helpers, `requireAdminSession()`, `requireSuperAdmin()`, and `requireStoreAdmin()`.
7. `app/(auth)/login/actions.ts` validates credentials against `StoreAdministrator` records in the database.
8. Successful login stores `username`, `role`, and `storeId` in the session.
9. `proxy.ts` protects `/admin/*` and `/scan`, redirecting unauthenticated users to `/login` and enforcing role restrictions.
10. `app/page.tsx` and `app/admin/page.tsx` redirect users to the correct area based on role.

## Phase 3 — Super Admin Area
11. `app/admin/administrators/page.tsx` lists all administrators.
12. `app/admin/administrators/new/page.tsx` creates new administrators with store name, username, password, and role.
13. `app/admin/administrators/[storeId]/page.tsx` edits existing administrators.
14. `app/admin/administrators/actions.ts` handles create, update, and delete operations.
15. Super admins cannot delete their own super-admin record.
16. Deleting a store admin triggers cleanup of that store's products and categories before deleting the administrator record.

## Phase 4 — Store Admin Categories
17. `app/admin/categories/page.tsx` lists categories for the current store only.
18. `app/admin/categories/new/page.tsx` creates a category in the current store.
19. `app/admin/categories/[id]/page.tsx` edits or deletes a category from the current store.
20. `app/admin/categories/actions.ts` performs store-scoped mutations and revalidation.

## Phase 5 — Store Admin Products
21. `app/admin/products/page.tsx` lists products alphabetically for the current store.
22. `components/ProductList.tsx` provides client-side live search/filtering.
23. `app/admin/products/new/page.tsx` creates store-scoped products.
24. `app/admin/products/[id]/page.tsx` edits or deletes store-scoped products.
25. `app/admin/products/actions.ts` validates duplicate product codes per store and supports CSV import.
26. `app/admin/products/export/route.ts` exports products only for store admins.

## Phase 6 — Purchase Flow
27. `app/scan/page.tsx` renders the purchase screen for store admins only.
28. `components/ScanScreen.tsx` shows alphabetical product buttons and live search.
29. `components/QuantityModal.tsx` captures purchase quantity.
30. `app/scan/actions.ts` decreases stock and revalidates the relevant pages.

## Phase 7 — Layout and Deployment
31. `app/admin/layout.tsx` renders role-aware navigation and logout.
32. `next.config.ts` uses standalone output for deployment.
33. `Dockerfile`, `docker-compose.yml`, and `fly.toml` support local and fly.io deployment.

---

## Relevant Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Current multi-tenant schema with `StoreAdministrator`, `Category`, `Product`, and `AdminRole` |
| `prisma/migrations/20260316190000_multitenant_admins/migration.sql` | Migration introducing store-scoped data and administrator roles |
| `lib/db.ts` | Prisma client singleton |
| `lib/auth.ts` | Session helpers and role guards |
| `lib/data.ts` | All DB access functions and store deletion cleanup logic |
| `proxy.ts` | Route protection and role-based redirects |
| `app/(auth)/login/` | Login page and server action |
| `app/admin/layout.tsx` | Role-aware admin navigation |
| `app/admin/administrators/**` | Super-admin-only administrator management |
| `app/admin/categories/**` | Store-scoped category CRUD |
| `app/admin/products/**` | Store-scoped product CRUD, import, and export |
| `app/scan/**` | Store-admin purchase flow |
| `components/ProductList.tsx` | Product filtering UI |
| `components/ScanScreen.tsx` | Purchase screen UI |
| `components/QuantityModal.tsx` | Quantity entry modal |
| `config/auth.ts` | Environment-backed session and optional super-admin bootstrap config |
| `Dockerfile` + `fly.toml` | Deployment config |

---

## Verification
1. `docker compose up -d` starts PostgreSQL and pgAdmin cleanly.
2. `npm run lint` passes.
3. `npm run build` passes.
4. Logging in as a super admin redirects to `/admin/administrators`.
5. Logging in as a store admin redirects to `/admin/products`.
6. A super admin cannot access `/admin/products`, `/admin/categories`, or `/scan`.
7. A store admin cannot access `/admin/administrators`.
8. Category CRUD affects only the current store.
9. Product CRUD affects only the current store and preserves alphabetical ordering plus live search.
10. The buy page lets a store admin decrease stock for products from their store only.
11. Deleting a store administrator also removes that store's categories and products.
12. Unauthenticated access to `/admin/*` or `/scan` redirects to `/login`.

---

## Out of Scope
- Audit log / stock history
- Email notifications
- Product images
- Advanced password hashing migration beyond the current implementation
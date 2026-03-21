# Project Guidelines

## Project Overview
This is a **sport mentoring application** written in **Next.js 16 (App Router)** with **React 19**, **TypeScript**, and **Tailwind CSS v4**. It is intended to be deployed on **fly.io**.

The UI language is **Romanian**. All user-facing text (labels, buttons, messages, placeholders) must be written in Romanian.

---

## Tech Stack
- **Framework**: Next.js 16 (App Router, `app/` directory, `output: 'standalone'`)
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS v4 (CSS-first config via `@import "tailwindcss"` in `globals.css`)
- **ORM**: Prisma 7 — uses `prisma.config.ts` for datasource config; client generated to `app/generated/prisma/`; **import from `@/app/generated/prisma/client`** (not `@/app/generated/prisma`)
- **Database adapter**: `@prisma/adapter-pg` + `pg` (required by Prisma 7 — no built-in connection string support)
- **Sessions**: iron-session v8 — `getIronSession(cookieStore, options)` in Server Components; `unsealData()` in edge middleware
- **Auth**: bcryptjs (SALT_ROUNDS=12)
- **Rich text**: Tiptap v3 (`@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-link`)
- **Runtime**: Node.js 20+
- **Deployment target**: fly.io

## Roles
- `SUPER_ADMIN` — manages mentors and playfield positions
- `MENTOR` — manages players, daily checkin forms, library, messages, profile
- `PLAYER` — daily checkin, journal, weekly scope, library, confidence level

## Route Map
| Prefix         | Role        | Description                        |
|----------------|-------------|-------------------------------------|
| `/login`       | Public      | Login page                          |
| `/admin/*`     | SUPER_ADMIN | Mentors CRUD, Positions CRUD        |
| `/mentor/*`    | MENTOR      | Dashboard, players, checkin, library, message, profile |
| `/player/*`    | PLAYER      | Dashboard, checkin, journal, scope, library, profile |
| `/api/upload`  | MENTOR      | File upload endpoint                |
| `/api/files/*` | AUTH        | Authenticated file serving          |

## Project Context
- Single SUPER_ADMIN user (no registration flow — seeded via `npm run db:seed`).
- All routes other than `/login` are protected by `middleware.ts`.
- Presence tracking via `lastActiveAt` field on `Mentor` and `Player`, updated on every page load.
- Mentor dashboard polls player activity every 60 seconds via `router.refresh`.

## Architecture
- Route protection: `middleware.ts` uses `unsealData()` (edge-compatible) to read the session cookie and redirect unauthorized users.
- `lib/auth.ts` provides `requireAuth()`, `requireMentor()`, `requirePlayer()`, `requireSuperAdmin()` — use in page Server Components.
- `lib/db.ts` exports a singleton `db` (PrismaClient with PrismaPg adapter).
- Server Actions in `actions/auth.ts`, `actions/admin.ts`, `actions/mentor.ts`, `actions/player.ts`.
- File uploads saved to `UPLOAD_DIR/[mentorId]/[uuid].[ext]`, served via `/api/files/[...path]`.

## Coding Conventions

### General
- Use **TypeScript** everywhere. Avoid `any`; define explicit types and interfaces.
- Prefer **named exports** for components, **default exports** only for Next.js pages/layouts.
- Use **React Server Components** by default. Add `'use client'` only when interactivity or browser APIs are needed.
- Keep components small and single-responsibility.
- Explicit types in `.map()` callbacks — never rely on implicit `any`.

### Prisma 7 Notes
- Import path: `import { SomeType } from "@/app/generated/prisma/client"` (NOT `@/app/generated/prisma`)
- Creating client requires adapter: `new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })`
- Run `npx prisma generate` after schema changes
- Apply schema: `npx prisma db push`
- Migrations path: `prisma/migrations/`
- Config file: `prisma.config.ts` (datasource URL, not in schema.prisma)

### Tiptap v3 Notes
- Hidden input pattern: `<input type="hidden" name={name} value={editor?.getHTML() ?? ""} readOnly />` inside a form
- Extensions: `StarterKit`, `Link` from `@tiptap/starter-kit`, `@tiptap/extension-link`
- SSR: use `isomorphic-dompurify` for sanitizing HTML in server components (`RichTextViewer`)

## Build and Test
| Script           | Command                  |
|------------------|--------------------------|
| Install          | `npm install`            |
| Dev server       | `npm run dev`            |
| Build            | `npm run build`          |
| Start            | `npm run start`          |
| Lint             | `npm run lint`           |
| Type check       | `npx tsc --noEmit`       |
| DB push          | `npx prisma db push`     |
| DB seed          | `npm run db:seed`        |
| Prisma generate  | `npx prisma generate`    |

## Conventions
- Keep changes small and focused; avoid introducing multiple competing frameworks at once.
- Update `README.md` whenever adding dependencies, scripts, environment variables, or developer setup steps.
- `.env.example` documents all required environment variables.
- Add tests alongside new logic once a test framework is chosen.

### Styling
- Use **Tailwind CSS utility classes** exclusively; avoid inline styles and CSS modules unless absolutely necessary.
- Design for **mobile-first**; player screens must work well on phones (bottom nav on mobile).
- Use dark mode support where it doesn't add complexity.
- Shared utility classes defined in `app/globals.css` `@layer utilities`: `.input`, `.label`, `.btn-primary`, `.btn-secondary`, `.btn-xs`, `.btn-xs-danger`.

### Data & State
- Database: PostgreSQL via `prisma/schema.prisma` (14 models).
- Use **server actions** (`'use server'`) for form mutations (create, update, delete).
- Use `revalidatePath` / `revalidateTag` after mutations to keep pages fresh.
- File uploads: max 20MB, allowed MIME types: pdf, doc, docx, jpg, png, gif.

### Security
- Sanitize and validate all user input on the server side.
- Do not expose credentials or secret config values to the client.
- All non-login routes reject unauthenticated requests with a redirect to `/login`.
- Passwords hashed with bcryptjs (rounds=12).
- Session cookie: HTTP-only, SameSite=Lax, TTL 7 days.

---

## Romanian UI Reference

| Concept                  | Romanian label              |
|--------------------------|-----------------------------|
| Login                    | Autentificare               |
| Logout                   | Deconectare                 |
| Username                 | Utilizator                  |
| Password                 | Parolă                      |
| Save                     | Salvează                    |
| Cancel                   | Anulează                    |
| Delete                   | Șterge                      |
| Edit                     | Editează                    |
| Add                      | Adaugă                      |
| Search                   | Căutare                     |
| Dashboard                | Panou principal             |
| Mentor                   | Antrenor                    |
| Player                   | Jucător                     |
| Daily checkin            | Checkin zilnic              |
| Journal                  | Jurnal                      |
| Weekly scope             | Scop săptămânal             |
| Accomplished             | Realizat                    |
| Not accomplished         | Nerealizat                  |
| Library                  | Bibliotecă                  |
| Message                  | Mesaj                       |
| Profile                  | Profil                      |
| Positions                | Poziții pe teren            |
| Confidence level         | Nivel de stare              |
| Good (confidence)        | Bine                        |
| OK (confidence)          | OK                          |
| Hard (confidence)        | Greu                        |
| Streak                   | Serie de zile               |
| Read / Unread            | Citit / Necitit             |
| Change password          | Schimbă parola              |
| Current password         | Parola curentă              |
| New password             | Parola nouă                 |

---

## What to Avoid
- Do **not** use class components.
- Do **not** use `pages/` directory (this is an App Router project).
- Do **not** add unnecessary dependencies; keep the bundle lean.
- Do **not** write English UI strings; always use Romanian.
- Do **not** store credentials in source code; use environment variables.
- Do **not** import from `@/app/generated/prisma` — always use `@/app/generated/prisma/client`.
- Do **not** construct `PrismaClient` without an adapter (`@prisma/adapter-pg` is required by Prisma 7).

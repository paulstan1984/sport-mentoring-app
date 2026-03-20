# Project Guidelines

## Project Overview
This is a **sport mentoring application** written in **Next.js 16 (App Router)** with **React 19**, **TypeScript**, and **Tailwind CSS v4**. It is intended to be deployed on **fly.io**.

The UI language is **Romanian**. All user-facing text (labels, buttons, messages, placeholders) must be written in Romanian.

---

## Tech Stack
- **Framework**: Next.js 16 (App Router, `app/` directory)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Runtime**: Node.js
- **Deployment target**: fly.io

## Project Context
- This repository is for a sport mentoring application for coaches and players.
- The project is currently in bootstrap state with minimal files.
- Prefer incremental setup: establish one clear stack and document it before adding many features.

## Architecture
- There is a single super_admin user (no registration flow).
- All routes other than the login page must be protected and accessible only to authenticated admins.
- Use Next.js middleware (`middleware.ts`) for route protection.

## Coding Conventions

### General
- Use **TypeScript** everywhere. Avoid `any`; define explicit types and interfaces.
- Prefer **named exports** for components, **default exports** only for Next.js pages/layouts.
- Use **React Server Components** by default. Add `'use client'` only when interactivity or browser APIs are needed.
- Keep components small and single-responsibility.

## Build and Test
- Build and test commands are not defined yet.
- Before running project commands, detect existing tooling first (for example `package.json`, `composer.json`, or `pyproject.toml`).
- If you add a toolchain, also add and maintain explicit commands in `README.md` for install, run, build, and test.

## Conventions
- Keep changes small and focused; avoid introducing multiple competing frameworks at once.
- Update `README.md` whenever adding dependencies, scripts, environment variables, or developer setup steps.
- Add `.env.example` when introducing required environment variables.
- Add tests alongside new logic once a test framework is chosen, and document how to run them.

### Styling
- Use **Tailwind CSS utility classes** exclusively; avoid inline styles and CSS modules unless absolutely necessary.
- Design for **mobile-first**; the buy screen must work well on phones.
- Use dark mode support where it doesn't add complexity.

### Data & State
- Until a database is added, data may be stored in-memory or in a JSON file on the server.
- Use **server actions** (`'use server'`) for form mutations (create, update, delete).
- Use `revalidatePath` / `revalidateTag` after mutations to keep pages fresh.

### Security
- Sanitize and validate all user input on the server side.
- Do not expose credentials or secret config values to the client.
- Admin routes must reject unauthenticated requests with a redirect to `/login`.

---

## Romanian UI Reference

| Concept         | Romanian label         |
|-----------------|------------------------|
| Login           | Autentificare          |
| Username        | Utilizator             |
| Password        | Parolă                 |
| Products        | Produse                |
| Categories      | Categorii              |
| Stock           | Stoc                   |
| Measure unit    | Unitate de măsură      |
| Search          | Căutare                |
| Quantity        | Cantitate              |
| Save            | Salvează               |
| Cancel          | Anulează               |
| Delete          | Șterge                 |
| Edit            | Editează               |
| Add             | Adaugă                 |
| Buy / Purchase  | Cumpărare              |
| Logout          | Deconectare            |

---

## What to Avoid
- Do **not** use class components.
- Do **not** use `pages/` directory (this is an App Router project).
- Do **not** add unnecessary dependencies; keep the bundle lean.
- Do **not** write English UI strings; always use Romanian.
- Do **not** store credentials in source code; use environment variables.

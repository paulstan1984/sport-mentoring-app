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



# Sport Mentoring App

Aplicație web de mentorat sportiv pentru antrenori și jucători, construită cu Next.js 16 (App Router), Prisma 7, și Tailwind CSS v4.

---

## Cerințe preliminare

- **Node.js** 20+
- **Docker** (pentru baza de date PostgreSQL)
- **npm** 10+

---

## Instalare și configurare

### 1. Clonare și instalare dependențe

```bash
npm install
```

### 2. Variabile de mediu

Copiați `.env.example` în `.env` și completați valorile:

```bash
cp .env.example .env
```

| Variabilă       | Descriere                                                                 |
|-----------------|---------------------------------------------------------------------------|
| `DATABASE_URL`  | URL PostgreSQL (`postgresql://user:pass@host:port/db`)                   |
| `SESSION_SECRET`| Cheie secretă pentru cookie-ul de sesiune (min. 32 caractere aleatorii)  |
| `UPLOAD_DIR`    | Directorul local pentru fișierele uploadate (implicit: `./uploads`)      |

Generare `SESSION_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Pornire bază de date

```bash
docker-compose up -d
```

Aceasta pornește PostgreSQL pe portul `5432` cu credențialele din `docker-compose.yml`.

### 4. Migrare schemă și seeding date inițiale

```bash
# Aplică schema Prisma în baza de date
npx prisma db push

# Creează utilizatorul admin și datele demo
npm run db:seed

# Resetează toate tabelele, apoi rulează seed
npx prisma db push --force-reset; npm run db:seed

# Resetează, regenerează Prisma Client, apoi rulează seed
npx prisma db push --force-reset; npm run db:generate; npm run db:seed
```

**Conturi create de seed:**

| Rol         | Utilizator  | Parolă       |
|-------------|-------------|--------------|
| SUPER_ADMIN | `admin`     | `admin1234`  |
| MENTOR      | `rada`      | `mentor1234` |
| PLAYER      | `jucator1`  | `jucator1234`|

> ⚠️ Schimbați parolele imediat după prima autentificare în producție!

### 5. Pornire server de dezvoltare

```bash
npm run dev
```

Aplicația va fi disponibilă la [http://localhost:3000](http://localhost:3000).

---

## Scripturi disponibile

| Script           | Descriere                                        |
|------------------|--------------------------------------------------|
| `npm run dev`    | Server de dezvoltare (cu hot reload)             |
| `npm run build`  | Build de producție                               |
| `npm run start`  | Pornire build de producție                       |
| `npm run lint`   | Rulează ESLint                                   |
| `npm run db:seed`| Populează baza de date cu date inițiale          |

---

## Structura proiectului

```
app/
  admin/          # Pagini SUPER_ADMIN (managament mentori, poziții)
  mentor/         # Pagini MENTOR (jucători, checkin, bibliotecă, mesaj)
  player/         # Pagini PLAYER (checkin zilnic, jurnal, scop săptămânal)
  login/          # Pagina de autentificare
  api/
    upload/       # Endpoint upload fișiere (mentor)
    files/        # Endpoint servire fișiere (autentificat)
actions/          # Server Actions Next.js (auth, admin, mentor, player)
components/       # Componente reutilizabile (RichTextEditor, PresenceBadge etc.)
lib/              # Utilitare server (db, session, auth, streak)
prisma/
  schema.prisma   # Schema bază de date
  seed.ts         # Script seeding date inițiale
uploads/          # Fișiere uploadate (gitignored, creat automat)
```

---

## Stack tehnic

- **Framework**: Next.js 16 (App Router, `output: 'standalone'`)
- **Limbaj**: TypeScript 5 (strict mode)
- **Stilizare**: Tailwind CSS v4 (configurare CSS-first)
- **ORM**: Prisma 7 cu adapter PostgreSQL (`@prisma/adapter-pg`)
- **Sesiuni**: iron-session v8 (cookie HTTP-only, criptat)
- **Parole**: bcryptjs (SALT_ROUNDS=12)
- **Editor text**: Tiptap v3 (StarterKit + Link)
- **Deploy**: fly.io (Docker standalone)

---

## Roluri și redirecționare

| Rol           | Redirecționare după login |
|---------------|---------------------------|
| `SUPER_ADMIN` | `/admin/mentors`          |
| `MENTOR`      | `/mentor/dashboard`       |
| `PLAYER`      | `/player/dashboard`       |

Middleware-ul Next.js (`middleware.ts`) protejează toate rutele și redirecționează utilizatorii neautentificați la `/login`.

---

## Deploy pe fly.io

```bash
# Prima dată
fly launch

# Deploy ulterior
fly deploy
```

Asigurați-vă că variabilele de mediu sunt configurate în fly.io:

```bash
fly secrets set DATABASE_URL="..." SESSION_SECRET="..." UPLOAD_DIR="/data/uploads"
```

# TODO
- display logout button on mobile always
- import players visible on demand / not always
- generate 10 demo players
- present to Ionut Rada 
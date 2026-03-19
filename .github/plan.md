# Plan: Sport Mentoring Application — TheRadaWay

## Viziune

Aplicația ajută jucătorii să își creeze obiceiuri bune, să își urmărească progresul și să fie conectați constant la un sistem de valori sănătoase: disciplină, respect, perseverență, educație, muncă, credință.

Ecranul de deschidere afișează logo-ul **TheRadaWay** împreună cu această misiune.

Aplicația este:
- simplă
- rapidă
- ușor de folosit zilnic
- fără funcții complicate

**NU este o aplicație complexă. Este un instrument de creștere personală.**

---

## Decizii tehnice

- **Framework**: Next.js 16 (App Router)
- **Limbaj**: TypeScript
- **Stilizare**: Tailwind CSS v4
- **BD**: PostgreSQL
- **ORM**: Prisma
- **Autentificare**: iron-session
- **Roluri**:
  - `MENTOR` — un singur mentor/antrenor; gestionează jucătorii, adaugă materiale și mesaje zilnice
  - `PLAYER` — jucător; completează check-in zilnic, jurnal, obiective
- **Limbă UI**: Română

---

## Model de date

### User (Utilizator)
- `id`: cheie primară
- `name`: nume complet
- `username`: login unic
- `password`: hash
- `role`: `MENTOR` | `PLAYER`

### PlayerProfile (Profil jucător)
- `id`
- `userId`: referință la User
- `age`: vârstă
- `position`: poziție în teren
- `team`: echipă / grupă
- `personalGoal`: obiectiv personal

### DailyCheckIn (Check-in zilnic)
Câmpuri binare (Da/Nu) completate zilnic de jucător:

| Câmp | Descriere |
|------|-----------|
| `wokeUpBy8` | Trezit nu mai târziu de ora 8 |
| `healthyBreakfast` | Mic dejun sănătos |
| `schoolOrReading` | Școală / Citit 30–40 min |
| `morningMobility` | Mobilitate / Prevenție (dimineață) |
| `morningSnack` | Gustare sănătoasă (dimineață) |
| `training1` | Antrenament 1 |
| `afternoonSnack` | Gustare sănătoasă (după-amiază) |
| `socialMediaMorningMax30` | Social media max 30 min (dimineață) |
| `healthyLunch` | Prânz sănătos |
| `rest` | Odihnă |
| `afternoonMobility` | Mobilitate / Prevenție (după-amiază) |
| `afternoonSnack2` | Gustare sănătoasă (a doua) |
| `training2` | Antrenament 2 |
| `recovery` | Recuperare / Detensionare / Băi calde-reci |
| `healthyDinner` | Cină sănătoasă |
| `socialMediaEveningMax60` | Social media max 1 oră (seară) |
| `reading` | Citit cărți / cursuri / materiale Biblioteca TheRadaWay |
| `inBedBy23` | Odihnă nu mai târziu de ora 23 |
| `goodAttitude` | Am avut o atitudine bună |
| `goodDeed` | Am făcut un lucru bun azi (câmp text opțional) |
| `learnedSomething` | Am învățat ceva (câmp text opțional) |
| `date`: data check-in-ului |
| `playerId`: referință la User |

### DailyJournal (Jurnal zilnic)
- `id`
- `playerId`
- `date`
- `wentWell`: ce am făcut bine azi
- `didntGoWell`: ce nu mi-a ieșit bine
- `improvement`: ce pot face mai bine mâine
- `selfScore`: notă 1–5

### WeeklyGoal (Obiectiv săptămânal)
- `id`
- `playerId`
- `weekStart`: data de luni a săptămânii
- `goal`: textul obiectivului
- `achieved`: boolean (bifat duminică)

### LibraryItem (Biblioteca TheRadaWay)
- `id`
- `title`: titlu material
- `type`: `TEXT` | `IMAGE`
- `content`: conținut text sau URL imagine
- `createdAt`

### LibraryRead (Progres lectură)
- `id`
- `playerId`
- `itemId`
- `read`: boolean

### DailyMessage (Mesajul zilei)
- `id`
- `date`: data pentru care este valabil mesajul
- `message`: textul mesajului motivațional (adăugat de mentor)

### EmotionalState (Stare emoțională)
- `id`
- `playerId`
- `date`
- `level`: `BINE` | `OK` | `GREU`

---

## Reguli de acces

- `/login` este public.
- `/mentor/**` este accesibil doar rolului `MENTOR`.
- `/player/**` este accesibil doar rolului `PLAYER`.
- Utilizatorii neautentificați sunt redirecționați la `/login`.
- Mentorul nu are profil de jucător; jucătorii nu au acces la zone de mentor.

---

## Funcționalități

### 1. Ecran de deschidere
- Logo TheRadaWay
- Misiunea aplicației afișată vizibil
- Buton de login

### 2. Profil jucător
- Câmpuri: nume, vârstă, poziție în teren, echipă / grupă, obiectiv personal
- Rapid de completat și ușor de editat

### 3. Check-in zilnic
- Listă de elemente binare (Da/Nu sau bifă)
- Două câmpuri text opționale: „lucrul bun de azi" și „ce am învățat"
- Scopul este consecvența, nu complexitatea

### 4. Jurnal zilnic
- Trei câmpuri text scurte: ce a mers bine, ce nu a mers, ce pot îmbunătăți
- Notă de la 1 (slab) la 5 (foarte bine)

### 5. Biblioteca TheRadaWay
- Materiale de tip text și imagini
- Doar mentorul poate adăuga materiale
- Jucătorii pot marca fiecare material: necitit / citit

### 6. Dashboard mentor
- Listă jucători cu status vizual:
  - 🟢 verde = activ (check-in completat azi)
  - 🟡 galben = parțial
  - 🔴 roșu = inactiv
- Vizualizare rapidă a cine a completat check-in-ul

### 7. Obiectiv săptămânal
- Jucătorul scrie un singur obiectiv la începutul săptămânii
- Duminică poate bifa dacă l-a atins sau nu

### 8. Scor de consecvență
- Zile consecutive cu check-in completat
- Progres personal vizibil
- Fără competiție între jucători

### 9. Mesajul zilei
- Mentorul adaugă un mesaj scurt de motivație pentru o anumită dată
- Jucătorii îl văd la deschiderea aplicației
- Exemplu: „Disciplina bate motivația."

### 10. Stare emoțională
- Selecție simplă: Bine / OK / Greu
- Ajută mentorul să înțeleagă starea jucătorului

---

## Principii

- Totul trebuie să fie rapid
- Interfață simplă
- Fără funcții inutile
- Focus pe consecvență zilnică

---

## Faze de implementare

### Faza 1 — Fundație
1. Schema Prisma: `User`, `PlayerProfile`, `DailyCheckIn`, `DailyJournal`, `WeeklyGoal`, `LibraryItem`, `LibraryRead`, `DailyMessage`, `EmotionalState`.
2. Migrații Prisma și seed cu un cont de mentor și câțiva jucători demo.
3. `lib/db.ts` — client Prisma singleton.

### Faza 2 — Autentificare
4. `lib/auth.ts` — sesiune iron-session, `requireMentor()`, `requirePlayer()`.
5. `app/(auth)/login/` — pagina de login și acțiunea server.
6. `middleware.ts` — protecție rute `/mentor/**` și `/player/**`.

### Faza 3 — Ecran de deschidere
7. `app/page.tsx` — ecran cu logo TheRadaWay, misiune și buton login.

### Faza 4 — Profil jucător
8. `app/player/profile/page.tsx` — vizualizare și editare profil.
9. `app/player/profile/actions.ts` — salvare profil.

### Faza 5 — Check-in zilnic
10. `app/player/checkin/page.tsx` — formular check-in zilnic.
11. `app/player/checkin/actions.ts` — salvare check-in.

### Faza 6 — Jurnal zilnic
12. `app/player/journal/page.tsx` — formular jurnal zilnic.
13. `app/player/journal/actions.ts` — salvare jurnal.

### Faza 7 — Stare emoțională
14. `app/player/emotional/page.tsx` — selecție stare emoțională.
15. `app/player/emotional/actions.ts` — salvare stare.

### Faza 8 — Obiectiv săptămânal
16. `app/player/weekly-goal/page.tsx` — scriere obiectiv și bifare la final de săptămână.
17. `app/player/weekly-goal/actions.ts` — salvare obiectiv și status.

### Faza 9 — Biblioteca TheRadaWay
18. `app/player/library/page.tsx` — lista materialelor cu status citit/necitit.
19. `app/player/library/actions.ts` — marcare material ca citit.
20. `app/mentor/library/page.tsx` — gestionare materiale (adăugare, ștergere).
21. `app/mentor/library/actions.ts` — CRUD materiale.

### Faza 10 — Mesajul zilei
22. `app/mentor/daily-message/page.tsx` — adăugare mesaj zilnic.
23. `app/mentor/daily-message/actions.ts` — salvare mesaj.

### Faza 11 — Scor de consecvență
24. `lib/consistency.ts` — calcul zile consecutive și progres personal.
25. `app/player/dashboard/page.tsx` — afișare scor consecvență și mesajul zilei.

### Faza 12 — Dashboard mentor
26. `app/mentor/dashboard/page.tsx` — lista jucători cu status verde/galben/roșu.

### Faza 13 — Layout și deployment
27. `app/mentor/layout.tsx` — navigație mentor.
28. `app/player/layout.tsx` — navigație jucător.
29. `next.config.ts` — output standalone.
30. `Dockerfile`, `fly.toml` — deployment pe fly.io.

---

## Fișiere relevante (țintă)

| Fișier | Scop |
|--------|------|
| `prisma/schema.prisma` | Schema completă TheRadaWay |
| `lib/db.ts` | Client Prisma singleton |
| `lib/auth.ts` | Sesiune și gardieni de rol |
| `lib/consistency.ts` | Calcul scor de consecvență |
| `middleware.ts` | Protecție rute |
| `app/page.tsx` | Ecran de deschidere cu logo TheRadaWay |
| `app/(auth)/login/` | Pagina și acțiunea de login |
| `app/player/**` | Zone jucător |
| `app/mentor/**` | Zone mentor |
| `config/auth.ts` | Configurare sesiune |
| `Dockerfile` + `fly.toml` | Deployment |

---

## Verificare

1. Ecranul de deschidere afișează logo-ul TheRadaWay și misiunea aplicației.
2. Login cu rol `MENTOR` redirecționează la `/mentor/dashboard`.
3. Login cu rol `PLAYER` redirecționează la `/player/dashboard`.
4. Mentorul nu poate accesa zonele de jucător și invers.
5. Check-in-ul zilnic se salvează corect și apare în dashboard-ul mentorului.
6. Jurnalul zilnic se salvează și poate fi editat.
7. Biblioteca afișează materiale; doar mentorul poate adăuga/șterge.
8. Mesajul zilei adăugat de mentor apare pe ecranul jucătorului.
9. Scorul de consecvență crește corect cu fiecare check-in consecutiv.
10. Dashboard-ul mentorului colorează corect jucătorii: verde/galben/roșu.
11. Accesul neautentificat la rute protejate redirecționează la `/login`.
12. `npm run lint` trece fără erori.
13. `npm run build` trece fără erori.

---

## În afara scopului

- Videoclipuri în bibliotecă (doar text și imagini)
- Competiție sau clasament între jucători
- Notificări email sau push
- Funcționalități complexe de raportare sau analiză
# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary — Players (athletes):** individuals in a one-on-one mentoring relationship with a coach. They are active on their phone daily, typically outside of training, performing a brief ritual of self-reflection and goal-tracking. Age range undecided; interface must be effortless on mobile. UI language is Romanian.

**Secondary — Mentors (coaches):** professionals or aspiring coaches using the platform to observe, guide, and communicate with each of their players individually. They review player activity via a dashboard on desktop or mobile.

**Administrator — Super Admin:** a single platform operator who manages mentor accounts, playfield positions, and access tiers.

The product serves two distinct themes — `SPORT_MENTOR` (sports coaching) and `MIND_MENTOR` (psychology/mental coaching) — and is designed to work for any sport or mental performance context.

## Product Purpose

A structured daily journaling and goal-tracking platform that creates a private, observable loop between a player and their personal mentor. Players log daily check-ins, journal entries, weekly objectives, and confidence levels; mentors observe all activity, communicate individually through daily messages and library resources, and track each player's consistency over time.

Success means: players build a daily reflection habit; mentors gain real-time visibility into player mindset and progress without requiring a conversation.

## Positioning

The product's core mechanism is **observable self-reflection**: every structured entry a player makes is immediately visible to their mentor. This goes beyond a personal journal (private, no mentor visibility) or a messaging app (unstructured, no habit loop) — the format disciplines players to reflect on what they did well, what went wrong, and what to do better, while giving the mentor a consistent data signal rather than a self-reported chat message.

## Operating Context

Players use the app daily on their personal mobile phone — before or after training, at home, or while travelling. The daily ritual is brief (check-in, journal, confidence level) and must feel lightweight and fast on a phone with one thumb.

Mentors primarily review player data on desktop but may check in via mobile. The mentor dashboard shows live presence/activity status and updates every 60 seconds.

## Capabilities and Constraints

- **Roles:** `SUPER_ADMIN`, `MENTOR`, `PLAYER`; access strictly separated by role
- **Mentor features:** player management, custom daily check-in form builder, daily messages, resource library, improvement-way tracking, player notes, profile
- **Player features:** daily check-in (structured form), daily journal (what went well / wrong / could improve + self-score), weekly objective (set + mark accomplished/not), confidence level (Bine / OK / Greu), improvement-way self-ratings, library, profile
- **Engagement signals:** streak tracking, last-active presence badges, mentor dashboard with live refresh
- **Mentor tiers:** FREE, MINIMUM, MEDIUM, PRO, ENTERPRISE (feature limits enforced per tier)
- **Two platform themes:** `SPORT_MENTOR` (green brand) and `MIND_MENTOR` (undecided visual world)
- **Language:** all user-facing copy is in Romanian
- **File uploads:** library supports PDF, DOC, DOCX, JPG, PNG, GIF; max 20 MB
- **Push notifications:** Web Push (VAPID) for player reminders
- **Deployment:** fly.io, containerised, standalone Next.js output
- **No public registration for players:** players are created by their mentor; mentors submit a sign-up request approved by the Super Admin
- **Offline support:** service worker + offline DB present (undecided feature maturity)

## Brand Commitments

No formal brand name or identity beyond "Sport Mentoring App" has been established. No logo, color palette, typography, or voice has been locked. Visual system is incumbent (dark slate + green from marketing pages) but not yet committed as a design system.

## Evidence on Hand

- Marketing landing pages at `public/marketing/sport.html` and `public/marketing/psychology.html` — dark navy/slate background, green (`#16a34a` / `#22c55e`) accent, Inter typeface
- Prisma schema defining 14 models and full feature set
- Working Next.js application with all player and mentor routes implemented
- `contracte/RadaWay/` — a contract template suggesting the platform has been (or is intended to be) used commercially

## Product Principles

1. **Habit over feature:** every surface serves the daily ritual; complexity that breaks the habit loop is waste.
2. **Visibility is the product:** the mentor's ability to see player truth in real time is the core value; never hide it behind friction.
3. **Mobile is the primary canvas:** player screens are designed for one thumb on a phone; desktop is secondary for players.
4. **Roles are strict boundaries:** players never see other players; mentors see only their own players; trust depends on this.
5. **Calm confidence:** the interface should feel steady and professional, not gamified or loud — mentors and athletes are serious about performance.

## Accessibility & Inclusion

No accessibility standard has been mandated. Mobile-first layout and legible typography are minimum expectations given the primary use context (phone, outdoors, on the move).

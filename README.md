# University API (Next.js + Prisma)

API-only Next.js 14 project with Prisma (SQL Server), JWT access + refresh tokens, role-based auth (ADMIN, INSTRUCTOR, STUDENT).

## Quick start

1. Copy `.env.example` to `.env` and fill `DATABASE_URL`, `JWT_SECRET`, `REFRESH_TOKEN_SECRET`.
2. Install: `npm i`
3. Prisma generate: `npm run prisma:generate`
4. Create DB tables: `npx prisma migrate dev --name init` (or `npx prisma db push`)
5. Seed: `npm run prisma:seed`
6. Run: `npm run dev`

Admin after seeding: `admin@example.com` / `AdminPass123!`

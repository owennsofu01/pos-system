# POS Terminal

A full-stack point-of-sale application for a single retail till: sales/checkout, dashboard analytics, product catalog, transaction ledger, inventory with audit trail, customer loyalty, reports, internal staff chat, and business/email settings.

Implemented from a [Claude Design](https://claude.ai/design) prototype (`POS Terminal.dc.html`) as a real two-tier app:

- **Backend** — Node.js + TypeScript + Express, layered Controller → Service → Repository, MySQL via parameterized SQL (`mysql2`), JWT auth.
- **Frontend** — React + Vite + TypeScript + Tailwind CSS.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Zustand, React Router |
| Backend | Node.js, Express, TypeScript, mysql2, JWT (access + refresh), Zod, bcrypt, Nodemailer |
| Database | MySQL 8 |

## Project layout

```
backend/    Node + TS API — see backend/src/{controllers,services,repositories}
frontend/   Vite + React + TS + Tailwind app — see frontend/src/{pages,components,services}
docker-compose.yml   local MySQL for dev (no Docker needed for the app itself)
```

## Getting started

1. **Database** — either run the bundled MySQL container:

   ```
   docker compose up -d mysql
   ```

   or point `backend/.env` at any MySQL 8 instance you already have.

2. **Backend**

   ```
   cd backend
   cp .env.example .env   # adjust DB_* / JWT_* as needed
   npm install
   npm run migrate
   npm run seed            # loads the same sample data as the original prototype
   npm run dev              # http://localhost:4000
   ```

3. **Frontend**

   ```
   cd frontend
   cp .env.example .env
   npm install
   npm run dev               # http://localhost:5173
   ```

   Or from the repo root, once both `.env` files exist: `npm install && npm run dev` runs both together.

## Sign in

Seeded staff accounts (password `till-2026` for all):

| Email | Role |
|---|---|
| r.vasquez@meridian.co | manager |
| d.okafor@meridian.co | cashier |
| a.whitfield@meridian.co | admin |
| s.pham@meridian.co | viewer |

Role determines which screens are visible (nav) and which API routes are reachable (enforced server-side too) — see `backend/src/types/roles.ts` / `frontend/src/utils/roles.ts`.

## Notes

- Checkout, refunds, and stock adjustments run inside real DB transactions (`backend/src/services/transactionService.ts`) so stock, the ledger, and loyalty points never drift apart.
- Outbound email (test send, receipt email, password reset) uses whatever SMTP host is configured under Settings → Email; without one configured it returns a descriptive failure instead of throwing.
- No Redis/rate-limiter-flexible in this MVP — login has a lightweight in-memory rate limit instead; see the trade-off note in `backend/src/routes/auth.routes.ts`.

# Startiq

A Vite + React frontend with an Express backend for:

- Founder / Investor / Agency application submissions
- Email/password authentication (JWT)
- Admin management endpoints
- PostgreSQL persistence for users and applications

## Tech stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- Storage: PostgreSQL (`pg`)
- Optional production hosting: Firebase Hosting + Firebase Functions

## Run locally

Install dependencies:

- `npm install`

Start backend API:

- `npm run dev:server`

Start frontend app:

- `npm run dev`

Run both backend and frontend together:

- `npm run dev:full`

Frontend runs at `http://localhost:5173` and proxies `/api` to backend at `http://localhost:5000`.

## API endpoints

- `GET /api/health`
- `POST /api/applications/founder`
- `POST /api/applications/investor`
- `POST /api/applications/agency`
- `POST /api/auth/login`
- `GET /api/applications`

## Demo login

- There is no permanent hardcoded demo user.
- Create an account from `/signup` (or register through `POST /api/auth/register`).
- Login uses the credentials stored in PostgreSQL.

If login shows a network error, ensure backend is running (`npm run dev:server` or `npm run dev:full`).

## Deploy to Firebase (Frontend + API)

This repo includes Firebase configuration for:

- Hosting static frontend from `dist`
- Rewriting `/api/**` to the Cloud Function `api`

### 1) Install dependencies

- Root app: `npm install`
- Functions runtime: `cd functions && npm install`

### 2) Configure environment

- Frontend production API base is set to `VITE_API_BASE_URL=/api` in `.env.production`
- Configure backend env vars for Functions using `functions/.env.example` as reference

### 3) Build frontend

- `npm run build`

### 4) Deploy

- `firebase deploy --only functions,hosting`

### 5) Verify

- `https://<your-site>.web.app/api/health`
- Then test login/signup in deployed site

## Free option (no Blaze plan)

If you cannot upgrade to Firebase Blaze, the app can still run on Firebase Hosting only:

- Production uses `VITE_DEMO_MODE=true`
- Login/Signup/Application submissions are stored in browser `localStorage`
- No server-side API is required for this mode

Deploy command:

- `firebase deploy --only hosting`

## Notes

- Ensure your PostgreSQL instance allows connections from Cloud Functions egress.
- Set a strong `JWT_SECRET` in production.

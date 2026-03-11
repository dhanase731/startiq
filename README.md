# Startiq

A Vite + React frontend with an Express backend for:

- Founder / Investor / Agency application submissions
- Basic login endpoint (demo credentials)
- Local JSON persistence for submitted applications

## Tech stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- Storage: `server/data/applications.json`

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

- Email: `admin@startiqo.com`
- Password: `password123`

If login shows a network error, ensure backend is running (`npm run dev:server` or `npm run dev:full`).

## Notes

- Application data is stored in `server/data/applications.json`.
- This backend is suitable for development/demo use. For production, add proper auth, a real database, and rate limiting.

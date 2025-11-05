Hackathon Portal
=========================

Project layout
--------------

- `frontend/` – React application (Create React App) for all portal UI.
  - `public/`, `src/`, `tests/`, `wireframes/`, `package.json`, `.env*`
- `backend/` – Express/Mongo API used by the portal.
  - `src/` (config, models, routes, middleware), `scripts/`, `uploads/`, `package.json`, `.env*`
- Root files – workspace `package.json`, `.env.example`, `.gitignore`, documentation.

Install everything
------------------

```bash
npm install
```

The root workspace installs dependencies for both the frontend and backend packages in one go.  
Need a refresh later? Run `npm run install:all` to reinstall both workspaces explicitly.

Run the apps
------------

- Frontend dev server: `npm run start:frontend` (http://localhost:3000 by default)
- Frontend production build: `npm run build:frontend`
- Backend API: `npm run start:backend`
- Backend dev with auto-reload (nodemon): `npm run dev:backend`

Environment configuration
-------------------------

- Copy `frontend/.env.example` to `frontend/.env` and provide the React variables (Firebase keys, API URL, mock toggle).
- Copy `backend/.env.example` to `backend/.env` and add secure server credentials (Mongo URI, JWT secret, custom port).
- The root `.env.example` is only a pointer; never commit real `.env` files.

Key frontend routes
-------------------

- Public: `/`, `/help`, `/hackathons`
- Protected: `/base`, `/leaderboard`, `/profile`, `/notifications`, `/surveys`
- Role-gated
  - Student: `/student`, `/team`, `/team-selection`, `/submission`, `/certificate`
  - Mentor: `/mentor`, `/mentor/teams`, `/mentor/feedback`
  - Judge: `/judge`, `/judge/evaluation`, `/judge/feedback`
  - Admin: `/admin`, `/admin/manage`, `/admin/reports`, `/admin/schedule`

Backend notes
-------------

- Uses Express, Mongoose, JWT, and Multer. Files land in `backend/uploads/` (ignored in git).
- Sample utility scripts live under `backend/scripts/` (e.g., database checks, cleanup helpers).

Mock API option
---------------

Set `REACT_APP_USE_MOCK_API=true` in `frontend/.env` to exercise the UI without the backend. The mock client persists state in `frontend/src/services/mockApi.js`.

Troubleshooting
---------------

- If a port is occupied, stop the existing process or set `PORT`/`REACT_APP_*` overrides before running.
- Ensure MongoDB is reachable when the backend starts; the console logs will confirm connection success.

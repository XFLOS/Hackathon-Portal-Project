Deployment checklist for the frontend

1) Install dependencies (run once)

```powershell
cd frontend
npm install
```

2) Create a production .env file from `.env.example` (do NOT commit secrets):

- Copy `.env.example` to `.env.production` or `.env` in the `frontend/` folder and populate with real values. Example keys:
  - REACT_APP_API_URL=https://api.example.com
  - REACT_APP_USE_MOCK_API=false
  - REACT_APP_FIREBASE_API_KEY=...
  - REACT_APP_FIREBASE_AUTH_DOMAIN=...
  - REACT_APP_FIREBASE_PROJECT_ID=...
  - REACT_APP_FIREBASE_STORAGE_BUCKET=...
  - REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
  - REACT_APP_FIREBASE_APP_ID=...

3) Build locally for a sanity check

```powershell
cd frontend
npm run build
npx serve -s build   # optional, serves on http://localhost:5000
```

4) Deploy to Netlify
- Option A: Connect the repo in Netlify and set the following Build settings:
  - Base directory: frontend
  - Build command: npm run build
  - Publish directory: frontend/build
- Add the environment variables (REACT_APP_*) in Netlify UI under Site settings → Build & deploy → Environment.

- Option B: Use Netlify CLI
```powershell
npm i -g netlify-cli
cd frontend
npm run build
netlify deploy --prod --dir=build
```

5) Backend
- Deploy your Express API to Render/Railway/Fly/AWS and set `REACT_APP_API_URL` to the public API URL.
- Ensure CORS on the backend allows your Netlify domain (e.g. https://your-site.netlify.app)

6) Post-deploy checks
- Visit the site and exercise login/registration and API calls while monitoring the browser Network tab.
- Add the Netlify domain to Firebase Authentication authorized domains if using Firebase auth links.

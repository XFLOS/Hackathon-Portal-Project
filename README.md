# 🎓 Hackathon Portal - Complete Platform

A full-stack hackathon management system with role-based dashboards for Students, Mentors, Judges, and Coordinators.

---

## 🌐 Live Demo

- **Frontend**: https://hackathonportalproject4g5.netlify.app
- **Backend API**: https://hackathon-portal-project-8737.onrender.com
- **GitHub**: https://github.com/XFLOS/Hackathon-Portal-Project

---

## 🎭 Demo Accounts

**All accounts use password: `12345678`**

| Role | Email | Dashboard Features |
|------|-------|-------------------|
| 👤 Student | `student@demo.com` | Team "Phoenix Rising", 5 members, file upload |
| 🧑‍🏫 Mentor | `mentor@demo.com` | Assigned teams, progress monitoring |
| ⚖️ Judge | `judge@demo.com` | 2 submissions to evaluate, scores 85 & 92 |
| 🛠 Coordinator | `coordinator@demo.com` | Platform stats, leaderboard, admin tools |

**Quick Demo:** Login → See role-specific dashboard → Explore features  
**Full Guide:** See [DEMO-QUICK-REFERENCE.md](./DEMO-QUICK-REFERENCE.md)

---

## ✨ Features

### 👤 Student Role
- ✅ View/create teams (max 5 members)
- ✅ Submit projects with Cloudinary file upload
- ✅ View team submission status
- ✅ Check event schedule and deadlines
- ✅ View leaderboard rankings

### 🧑‍🏫 Mentor Role
- ✅ View assigned teams
- ✅ Monitor team progress
- ✅ Provide feedback and guidance
- ✅ Review team submissions

### ⚖️ Judge Role
- ✅ View all submissions
- ✅ Evaluate projects with detailed rubrics
- ✅ Score teams and provide feedback
- ✅ View evaluation history

### 🛠 Coordinator Role
- ✅ Dashboard with real-time statistics
- ✅ View all teams and submissions
- ✅ Manage event schedule
- ✅ View ranked leaderboard
- ✅ Full platform administration

---

## 🏗️ Project Structure

```
Hackathon-Portal-Project/
├── hackathon-frontend/          # React application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Dashboard pages for each role
│   │   ├── services/            # API integration (axios)
│   │   └── context/             # Auth context provider
│   ├── public/
│   ├── .env.example            # Frontend environment template
│   └── package.json
│
├── hackathon-backend/          # Express.js API server
│   ├── src/
│   │   ├── app.js             # Express app configuration
│   │   ├── server.js          # Server entry point
│   │   ├── config/            # Database & Cloudinary config
│   │   ├── controllers/       # Business logic (6 controllers)
│   │   ├── middleware/        # Auth & error handling
│   │   └── routes/            # API endpoints (40+ routes)
│   ├── COMPLETE-DATABASE-SETUP.sql  # Database schema & demo data
│   ├── .env.example           # Backend environment template
│   └── package.json
│
├── DEMO-SETUP-GUIDE.md         # Complete demo preparation guide
├── DEMO-QUICK-REFERENCE.md     # Quick demo reference card
├── TROUBLESHOOTING.md          # Common errors & fixes
├── setup.ps1                   # Windows automated setup
└── setup.sh                    # Mac/Linux automated setup
```

```

Hackathon-Portal-Project/│       ├── QUICKSTART.md│FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...","client_email":"...","client_id":"..."}'

├── hackathon-frontend/          # React frontend

│   ├── src/│       ├── DEPLOY_TO_RENDER.md

│   │   ├── pages/              # Dashboard components

│   │   ├── components/         # Reusable UI components│       └── ...more docs├── hackathon-backend/          # Express.js API serverCLOUDINARY_CLOUD_NAME=""

│   │   ├── services/           # API client

│   │   └── firebase/           # Firebase config│

│   ├── public/

│   └── package.json└── README.md                   # This file│   ├── src/CLOUDINARY_API_KEY=""

│

├── hackathon-backend/          # Express.js backend```

│   ├── src/

│   │   ├── controllers/        # Business logic│   │   ├── app.js             # Express app configurationCLOUDINARY_API_SECRET=""

│   │   ├── routes/            # API endpoints

│   │   ├── middleware/        # Auth & validation## 🚀 Quick Start

│   │   └── config/           # Database & services

│   ├── COMPLETE-DATABASE-SETUP.sql│   │   ├── server.js          # Server entry pointPORT=8080

│   └── package.json

│### Prerequisites

├── DEMO-GUIDE.md              # Complete demo walkthrough

├── SETUP-INSTRUCTIONS.md      # Deployment guide- Node.js 16+ and npm│   │   ├── config/            # Database & Cloudinary config```

└── README.md                  # This file

```- PostgreSQL database (recommend [Neon](https://neon.tech))



## 🚀 Quick Start- Cloudinary account for file uploads│   │   ├── controllers/       # Business logic



### Prerequisites- Firebase project for authentication

- Node.js 16+

- PostgreSQL database (we use [Neon](https://neon.tech))│   │   ├── middleware/        # Auth & error handling## 3) Instalação

- Cloudinary account (for file uploads)

### 1. Clone Repository

### 1. Clone Repository

```bash```bash│   │   └── routes/            # API endpoints```bash

git clone https://github.com/XFLOS/Hackathon-Portal-Project.git

cd Hackathon-Portal-Projectgit clone https://github.com/XFLOS/Hackathon-Portal-Project.git

```

cd Hackathon-Portal-Project│   ├── schema.sql             # PostgreSQL database schemanpm install

### 2. Setup Frontend

```bash```

cd hackathon-frontend

npm install│   ├── .env.example           # Backend environment templatenpx prisma generate

cp .env.example .env

# Edit .env with your configuration### 2. Setup Frontend

npm start

``````bash│   ├── package.jsonnpx prisma migrate dev --name init



### 3. Setup Backendcd hackathon-frontend

```bash

cd hackathon-backendnpm install│   └── Documentation/npm run dev

npm install

cp .env.example .env

# Edit .env with your credentials

npm run dev# Copy and configure environment variables│       ├── QUICKSTART.md```

```

cp .env.example .env

### 4. Setup Database

```bash# Edit .env with your Firebase credentials│       ├── DEPLOY_TO_RENDER.md

# In Neon SQL Editor, run:

COMPLETE-DATABASE-SETUP.sql```

```

│       └── ...more docsA API deve subir em `http://localhost:8080/health`.

## 📊 Demo Data Included

### 3. Setup Backend

The database setup includes:

```bash│

- **13 Users**: 4 demo accounts + 9 fake students

- **2 Teams**: cd hackathon-backend

  - Team Phoenix (AI Study Assistant)

  - Team Dragons (Campus Event Manager)npm install└── README.md                   # This file## 4) Rotas principais

- **2 Submissions**: Complete project data with files

- **2 Evaluations**: Pre-scored by judge

- **2 Mentor Feedback**: Sample feedback for teams

- **8 Schedule Events**: Full hackathon timeline# Copy and configure environment variables```- `GET /health` → status

- **3 Announcements**: Welcome messages

cp .env.example .env

## 🔌 API Endpoints

# Edit .env with your database and Cloudinary credentials- `GET /teams` (auth) → lista times (inclui membros e projeto)

### Authentication

```

POST /auth/register    - Register new student

POST /auth/login       - Login (returns JWT token)# Create database tables## 🚀 Quick Start- `POST /teams` (auth) → cria time `{ name }`

GET  /auth/profile     - Get current user

```# Run schema.sql in your PostgreSQL database



### Student Endpoints```- `POST /scores` (auth) → cria/atualiza nota `{ projectId, judgeUid, criteria }`

```

POST /team/create         - Create team

GET  /team/me            - Get my team

POST /team/add-member    - Add team member### 4. Run Development Servers### Prerequisites- `GET /scores/projects/:id` (auth) → notas de um projeto + média

POST /submission         - Create/update submission

GET  /submission/me      - Get my submission

```

**Frontend** (in `hackathon-frontend/` directory):- Node.js 16+ and npm- `GET /cloudinary/signature` (auth) → assinatura para upload

### Mentor Endpoints

``````bash

GET  /mentor/teams              - Get assigned teams

GET  /mentor/team/:teamId       - Get team detailsnpm start- PostgreSQL database (recommend [Neon](https://neon.tech))

POST /mentor/feedback/:teamId   - Provide feedback

GET  /mentor/feedback/:teamId   - Get feedback history# Runs on http://localhost:3000

```

```- Cloudinary account for file uploads> **Auth**: enviar `Authorization: Bearer <ID_TOKEN_FIREBASE>`

### Judge Endpoints

```
GET  /judge/submissions                  - Get all submissions
POST /judge/evaluate/:submissionId       - Create or update evaluation (upsert)
GET  /judge/history                      - Get evaluation history
GET  /judge/evaluation/:submissionId     - Get specific evaluation
GET  /judge/assignments/:judgeId         - Get teams assigned to a judge (submission & evaluation summary)
GET  /judge/assignments/me               - Convenience: assignments for authenticated judge
```

npm run dev## 5) Integração no Frontend (CRA)

### Coordinator Endpoints

```# Runs on http://localhost:4000

GET  /coordinator/teams          - Get all teams

GET  /coordinator/submissions    - Get all submissions```### 1. Clone RepositoryCrie `src/services/api.js`:

GET  /coordinator/stats          - Dashboard statistics

GET  /coordinator/leaderboard    - View rankings

POST /coordinator/schedule       - Create schedule event

GET  /coordinator/schedule       - Get all events## 📚 Documentation```bash

POST /coordinator/assign-mentor  - Assign mentor to team

```



### Public Endpoints- **Frontend**: See `hackathon-frontend/DEPLOY.md`git clone https://github.com/XFLOS/Hackathon-Portal-Project.git```js

```

GET  /users/me             - Get profile- **Backend**: See `hackathon-backend/QUICKSTART.md`

PUT  /users/me             - Update profile

GET  /users/schedule       - Get event schedule- **Deployment**: See `hackathon-backend/DEPLOY_TO_RENDER.md`cd Hackathon-Portal-Projectimport axios from 'axios'

GET  /users/leaderboard    - Get leaderboard

GET  /users/announcements  - Get announcements- **API Reference**: See `hackathon-backend/SETUP_COMPLETE.md`

```

```import { auth } from '../firebase/config'

## 🔐 Environment Variables

## 🔧 Environment Variables

### Frontend (.env)

```envimport { getIdToken } from 'firebase/auth'

REACT_APP_API_URL=https://hackathon-portal-project-8737.onrender.com

REACT_APP_USE_MOCK_API=false### Frontend (.env)

EXTEND_ESLINT=true

DISABLE_ESLINT_PLUGIN=true```env### 2. Setup Frontend



# Firebase (optional)REACT_APP_FIREBASE_API_KEY=your_api_key

REACT_APP_FIREBASE_API_KEY=your_api_key

REACT_APP_FIREBASE_AUTH_DOMAIN=your_domainREACT_APP_FIREBASE_AUTH_DOMAIN=your_domain```bashconst api = axios.create({

REACT_APP_FIREBASE_PROJECT_ID=your_project_id

```REACT_APP_FIREBASE_PROJECT_ID=your_project_id



### Backend (.env)REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucketcd frontend  baseURL: process.env.REACT_APP_API_BASE_URL

```env

DATABASE_URL=postgresql://user:pass@host/dbREACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id

JWT_SECRET=your_secret_key_here

CLOUDINARY_CLOUD_NAME=your_cloud_nameREACT_APP_FIREBASE_APP_ID=your_app_idnpm install})

CLOUDINARY_API_KEY=your_api_key

CLOUDINARY_API_SECRET=your_api_secretREACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id

PORT=4000

```REACT_APP_API_URL=http://localhost:4000



## 🛠️ Technology Stack```



### Frontend# Copy and configure environment variablesapi.interceptors.request.use(async (config) => {

- **React 19** - UI framework

- **React Router** - Navigation### Backend (.env)

- **Axios** - HTTP client

- **Firebase** - Authentication (optional)```envcp .env.example .env  const user = auth.currentUser

- **CSS3** - Styling

PORT=4000

### Backend

- **Express.js** - Web frameworkDATABASE_URL=postgresql://user:password@host/database?sslmode=require# Edit .env with your Firebase credentials  if (user) {

- **PostgreSQL** - Database

- **JWT** - AuthenticationJWT_SECRET=your_secret_key

- **Bcrypt** - Password hashing

- **Cloudinary** - File storageCLOUDINARY_CLOUD_NAME=your_cloud_name```    const token = await getIdToken(user, true)

- **Node.js** - Runtime

CLOUDINARY_API_KEY=your_api_key

## 📖 How to Demo

CLOUDINARY_API_SECRET=your_api_secret    config.headers.Authorization = `Bearer ${token}`

### 1. **Student Flow**

``````

1. Login as student@demo.com / 12345678

2. Navigate to "My Team"### 3. Setup Backend  }

3. See Team Phoenix with 5 members

4. Go to "Submissions"## 🗄️ Database Setup

5. View submitted project: "AI Study Assistant"

6. Check schedule for hackathon events```bash  return config

7. View leaderboard rankings

```1. Create a PostgreSQL database (use [Neon](https://neon.tech) for free hosting)



### 2. **Mentor Flow**2. Run the SQL schema:cd hackathon-backend})

```

1. Login as mentor@demo.com / 12345678   ```bash

2. View 2 assigned teams (Phoenix & Dragons)

3. Click on Team Phoenix   # In Neon SQL Editor or psqlnpm install

4. See team members and submission

5. View existing feedback   \i hackathon-backend/schema.sql

6. (Optional) Add new feedback

```   ```export default api



### 3. **Judge Flow**3. Update `DATABASE_URL` in `hackathon-backend/.env`

```

1. Login as judge@demo.com / 12345678# Copy and configure environment variables```

2. View all 2 submissions

3. See Team Dragons (already evaluated)## 🔐 Security Notes

4. Click "Evaluate" on Team Phoenix

5. Enter scores (Innovation, Technical, Presentation)cp .env.example .env

6. Add comments and submit

7. View evaluation history- **NEVER** commit `.env` files

```

- Use `.env.example` as templates only# Edit .env with your database and Cloudinary credentialsNo `.env` do front (CRA):

### 4. **Coordinator Flow**

```- Keep Firebase keys, database credentials, and API secrets secure

1. Login as coordinator@demo.com / 12345678

2. View dashboard statistics- Rotate JWT_SECRET in production```

3. See all teams (2) and submissions (2)

4. Check leaderboard with rankings

5. View/edit event schedule (8 events)

6. Manage mentor assignments## 🚀 Deployment# Create database tablesREACT_APP_API_BASE_URL=http://localhost:8080

```



## 🎬 Deployment

### Frontend (Vercel/Netlify)# Run schema.sql in your PostgreSQL database```

### Frontend (Netlify)

```bashSee `hackathon-frontend/DEPLOY.md` for detailed instructions.

# Netlify automatically deploys from GitHub

# Configuration in netlify.toml:```

# - base: hackathon-frontend

# - publish: build### Backend (Render)

# - build: npm run build

```See `hackathon-backend/DEPLOY_TO_RENDER.md` for step-by-step deployment guide.Uso no componente/página:



### Backend (Render)

```bash

# Manual deploy or GitHub auto-deploy**Important Render Configuration:**### 4. Run Development Servers```js

# Environment variables must be set in Render dashboard

# Required: DATABASE_URL, JWT_SECRET, CLOUDINARY_*- **Root Directory**: `hackathon-backend`

```

- **Build Command**: `npm install`import api from '../services/api'

### Database (Neon)

```bash- **Start Command**: `npm start`

# Run COMPLETE-DATABASE-SETUP.sql in SQL Editor

# Sets up all tables and demo data- Add all environment variables from `hackathon-backend/.env.example`**Frontend** (in `frontend/` directory):

```



## 📝 Testing Checklist

## 🛠️ Technology Stack```bashconst { data: teams } = await api.get('/teams')

- [ ] Can login with all 4 demo accounts

- [ ] Student redirects to `/student-dashboard`

- [ ] Mentor redirects to `/mentor-dashboard`

- [ ] Judge redirects to `/judge-dashboard`### Frontendnpm startawait api.post('/scores', { projectId, judgeUid: user.uid, criteria: { inovacao: 8, impacto: 9 } })

- [ ] Coordinator redirects to `/coordinator-dashboard`

- [ ] API calls work (check Network tab)- React 19

- [ ] Leaderboard displays correctly

- [ ] Schedule shows 8 events- Firebase Authentication & Analytics# Runs on http://localhost:3000```

- [ ] Team data displays properly

- React Router

## 🐛 Troubleshooting

- Axios```

### Login fails

- Verify password is exactly `12345678`

- Check database has demo users

- Confirm JWT_SECRET is set in Render### Backend## 6) Deploy



### API errors- Express.js

- Check REACT_APP_API_URL in frontend

- Verify backend is deployed and running- PostgreSQL (via node-postgres)**Backend** (in `hackathon-backend/` directory):- Suba o banco (Neon/Railway).

- Check Render logs for errors

- JWT Authentication

### No data showing

- Confirm database setup SQL was executed- Cloudinary (file storage)```bash- Configure as variáveis de ambiente na plataforma de deploy do backend.

- Check browser console for errors

- Verify API endpoints in Network tab- Bcrypt (password hashing)



## 📚 Documentationnpm run dev- Execute `npx prisma migrate deploy` ao iniciar o container.



- **`DEMO-GUIDE.md`** - Complete demo walkthrough with all role flows## 📖 Features

- **`SETUP-INSTRUCTIONS.md`** - Step-by-step deployment guide

- **`COMPLETE-DATABASE-SETUP.sql`** - Database schema + demo data# Runs on http://localhost:4000- No front, aponte `REACT_APP_API_BASE_URL` para a URL pública da API.



## 🤝 Contributing- User authentication (students, mentors, judges, coordinators)



1. Fork the repository- Team formation and management``````)

2. Create a feature branch

3. Make your changes- Project submissions

4. Test thoroughly

5. Submit a pull request- Judge scoring and evaluations



## 📄 License- Leaderboards



This project is for educational purposes. See LICENSE file for details.- Event scheduling## 📚 Documentation



## 🆘 Support- File uploads



- **Documentation**: See `DEMO-GUIDE.md` and `SETUP-INSTRUCTIONS.md`- Real-time updates- **Frontend**: See `frontend/DEPLOY.md`

- **Issues**: Open a GitHub issue

- **Questions**: Review API documentation in this README- **Backend**: See `hackathon-backend/QUICKSTART.md`



## 🎉 Credits## 🤝 Contributing- **Deployment**: See `hackathon-backend/DEPLOY_TO_RENDER.md`



Built for hackathon management with ❤️- **API Reference**: See `hackathon-backend/SETUP_COMPLETE.md`



- Full-stack platform with role-based access1. Fork the repository

- JWT authentication

- PostgreSQL database2. Create a feature branch## 🔧 Environment Variables

- Cloudinary file storage

- Deployed on Netlify + Render + Neon3. Make your changes



---4. Test locally### Frontend (.env)



**Live App**: https://hackathonportalproject4g5.netlify.app5. Submit a pull request```env



**Demo Password**: `12345678` for all accountsREACT_APP_FIREBASE_API_KEY=your_api_key



**Happy Hacking!** 🚀## 📄 LicenseREACT_APP_FIREBASE_AUTH_DOMAIN=your_domain


REACT_APP_FIREBASE_PROJECT_ID=your_project_id

See LICENSE file for details.REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket

REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id

## 🆘 SupportREACT_APP_FIREBASE_APP_ID=your_app_id

REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id

For issues or questions:REACT_APP_API_URL=http://localhost:4000

- Check the documentation in `hackathon-backend/` folder```

- Open an issue on GitHub

- Review `QUICKSTART.md` and deployment guides### Backend (.env)

```env

---PORT=4000

DATABASE_URL=postgresql://user:password@host/database?sslmode=require

**Happy Hacking!** 🎉JWT_SECRET=your_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🗄️ Database Setup

1. Create a PostgreSQL database (use [Neon](https://neon.tech) for free hosting)
2. Run the SQL schema:
   ```bash
   # In Neon SQL Editor or psql
   \i hackathon-backend/schema.sql
   ```
3. Update `DATABASE_URL` in `hackathon-backend/.env`

## 🔐 Security Notes

- **NEVER** commit `.env` files
- Use `.env.example` as templates only
- Keep Firebase keys, database credentials, and API secrets secure
- Rotate JWT_SECRET in production

## 🚀 Deployment

### Frontend (Vercel/Netlify)
See `frontend/DEPLOY.md` for detailed instructions.

### Backend (Render)
See `hackathon-backend/DEPLOY_TO_RENDER.md` for step-by-step deployment guide.

## 🛠️ Technology Stack

### Frontend
- React 19
- Firebase Authentication & Analytics
- React Router
- Axios

### Backend
- Express.js
- PostgreSQL (via node-postgres)
- JWT Authentication
- Cloudinary (file storage)
- Bcrypt (password hashing)

## 📖 Features

- User authentication (students, mentors, judges, coordinators)
- Team formation and management
- Project submissions
- Judge scoring and evaluations
- Leaderboards
- Event scheduling
- File uploads
- Real-time updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📄 License

See LICENSE file for details.

## 🆘 Support

For issues or questions:
- Check the documentation in `hackathon-backend/` folder
- Open an issue on GitHub
- Review `QUICKSTART.md` and deployment guides

---

## 🧪 Judge Evaluation Flow (Updated)

This section supersedes older single-score evaluation notes and clarifies the current multi-rubric contract.

### Endpoints

```
GET  /judge/submissions              # List submissions + any existing evaluation for this judge
POST /judge/evaluate/:submissionId   # Create OR update evaluation (upsert)
GET  /judge/history                  # List all evaluations by this judge (includes computed total_score)
GET  /judge/evaluation/:submissionId # Fetch one evaluation for this judge & submission
```

### Request Payload (POST /judge/evaluate/:submissionId)

```jsonc
{
  "innovation_score": 0-10,          // Required numeric (int/float) 0..10
  "technical_score": 0-10,           // Required numeric 0..10
  "presentation_score": 0-10,       // Required numeric 0..10
  "comments": "Optional feedback"   // Optional string
}
```

Validation: All three scores must be within [0,10]. Re-submitting updates the existing row (no duplicates). `total_score` is derived (innovation + technical + presentation). Use GET endpoints to retrieve computed totals; don’t attempt to send a `total_score` field.

### Response Samples

Create:
```json
{
  "message": "Evaluation submitted successfully",
  "evaluation": {
    "id": 42,
    "submission_id": 7,
    "judge_id": 3,
    "innovation_score": 8,
    "technical_score": 9,
    "presentation_score": 7,
    "comments": "Great technical depth.",
    "evaluated_at": "2025-11-24T15:05:12.345Z"
  }
}
```

Update:
```json
{
  "message": "Evaluation updated successfully",
  "evaluation": {
    "id": 42,
    "submission_id": 7,
    "judge_id": 3,
    "innovation_score": 9,
    "technical_score": 9,
    "presentation_score": 8,
    "comments": "Refined after live demo.",
    "evaluated_at": "2025-11-24T15:12:01.123Z"
  }
}
```

History item (GET /judge/history):
```json
{
  "id": 42,
  "submission_id": 7,
  "judge_id": 3,
  "innovation_score": 9,
  "technical_score": 9,
  "presentation_score": 8,
  "comments": "Refined after live demo.",
  "evaluated_at": "2025-11-24T15:12:01.123Z",
  "submission_title": "AI Study Assistant",
  "team_name": "Team Phoenix",
  "total_score": 26
}
```

### Legacy Migration

Older clients used `POST /api/judge/evaluations/:id` with a single `score` field. Migrate by:
1. Renaming endpoint to `/judge/evaluate/:submissionId`.
2. Replacing `score` with three fields: `innovation_score`, `technical_score`, `presentation_score`.
3. Optionally derive all three from the legacy `score` if you must retain prior UI (not recommended).

Optional adapter (for temporary backward compatibility):
```js
// NOT enabled by default; add only if you must support legacy clients.
app.post('/api/judge/evaluations/:id', authMiddleware, (req, res) => {
  const { score = 0, comments = '' } = req.body;
  req.params.submissionId = req.params.id;
  req.body = {
    innovation_score: score,
    technical_score: score,
    presentation_score: score,
    comments
  };
  evaluateSubmission(req, res);
});
```

### Test Checklist (Judge Flow)
Use these after deployment or local development:
1. Dashboard loads `/judge/assignments/:judgeId` (or `/judge/assignments/me`) showing only assigned teams.
2. Evaluation page pre-fills existing scores if present.
3. Submitting invalid scores (<0 or >10) returns 400.
4. Updating scores changes `evaluated_at` timestamp and dashboard total.
5. History page lists items in descending `evaluated_at` order with `total_score` when unpaginated.
6. History pagination (`/judge/history?page=0&pageSize=10`) returns object with `{ page, pageSize, total, totalPages, items }`.
7. Search/filter/sort on dashboard behave correctly (team name match, status filter, ordering by score/time/team).
8. Expanding a history item reveals metric breakdown & comments.
9. Inline edit from history updates local item without full refetch.
10. `/judge/assignments/me` returns identical payload shape to `/judge/assignments/:judgeId` for the logged-in judge.
11. **Phase 4:** Judge schedule page (`/judge/schedule`) toggles between "All Events" and "My Assigned Presentations". The latter derives per-team presentation slots from the aggregate "Presentations & Judging" event using assigned teams and parses slot duration from event description (defaults to 10 minutes). Current live slot is highlighted with gradient background and "Live Slot" badge.
12. **Phase 4:** Slot derivation correctly splits total window evenly among assigned teams if description doesn't specify duration or if specified duration exceeds window capacity.

**Happy Hacking!** 🎉

# Hackathon Portal Project# Hackathon Backend (Express + Prisma + Firebase Auth)



A full-stack hackathon management platform with React frontend and Express.js backend.## 1) Pré-requisitos

- Node.js 18+

## 📁 Project Structure- Banco PostgreSQL (Neon, Railway, Render, etc.)

- Firebase Service Account (JSON)

```- Conta Cloudinary (para assinar upload)

Hackathon-Portal-Project/

├── frontend/                    # React application## 2) Configuração

│   ├── src/Crie um arquivo `.env` na raiz com base no `.env.example`:

│   ├── public/

│   ├── .env.example            # Frontend environment template```

│   └── package.jsonDATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?schema=public"

│FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...","client_email":"...","client_id":"..."}'

├── hackathon-backend/          # Express.js API serverCLOUDINARY_CLOUD_NAME=""

│   ├── src/CLOUDINARY_API_KEY=""

│   │   ├── app.js             # Express app configurationCLOUDINARY_API_SECRET=""

│   │   ├── server.js          # Server entry pointPORT=8080

│   │   ├── config/            # Database & Cloudinary config```

│   │   ├── controllers/       # Business logic

│   │   ├── middleware/        # Auth & error handling## 3) Instalação

│   │   └── routes/            # API endpoints```bash

│   ├── schema.sql             # PostgreSQL database schemanpm install

│   ├── .env.example           # Backend environment templatenpx prisma generate

│   ├── package.jsonnpx prisma migrate dev --name init

│   └── Documentation/npm run dev

│       ├── QUICKSTART.md```

│       ├── DEPLOY_TO_RENDER.md

│       └── ...more docsA API deve subir em `http://localhost:8080/health`.

│

└── README.md                   # This file## 4) Rotas principais

```- `GET /health` → status

- `GET /teams` (auth) → lista times (inclui membros e projeto)

## 🚀 Quick Start- `POST /teams` (auth) → cria time `{ name }`

- `POST /scores` (auth) → cria/atualiza nota `{ projectId, judgeUid, criteria }`

### Prerequisites- `GET /scores/projects/:id` (auth) → notas de um projeto + média

- Node.js 16+ and npm- `GET /cloudinary/signature` (auth) → assinatura para upload

- PostgreSQL database (recommend [Neon](https://neon.tech))

- Cloudinary account for file uploads> **Auth**: enviar `Authorization: Bearer <ID_TOKEN_FIREBASE>`

- Firebase project for authentication

## 5) Integração no Frontend (CRA)

### 1. Clone RepositoryCrie `src/services/api.js`:

```bash

git clone https://github.com/XFLOS/Hackathon-Portal-Project.git```js

cd Hackathon-Portal-Projectimport axios from 'axios'

```import { auth } from '../firebase/config'

import { getIdToken } from 'firebase/auth'

### 2. Setup Frontend

```bashconst api = axios.create({

cd frontend  baseURL: process.env.REACT_APP_API_BASE_URL

npm install})



# Copy and configure environment variablesapi.interceptors.request.use(async (config) => {

cp .env.example .env  const user = auth.currentUser

# Edit .env with your Firebase credentials  if (user) {

```    const token = await getIdToken(user, true)

    config.headers.Authorization = `Bearer ${token}`

### 3. Setup Backend  }

```bash  return config

cd hackathon-backend})

npm install

export default api

# Copy and configure environment variables```

cp .env.example .env

# Edit .env with your database and Cloudinary credentialsNo `.env` do front (CRA):

```

# Create database tablesREACT_APP_API_BASE_URL=http://localhost:8080

# Run schema.sql in your PostgreSQL database```

```

Uso no componente/página:

### 4. Run Development Servers```js

import api from '../services/api'

**Frontend** (in `frontend/` directory):

```bashconst { data: teams } = await api.get('/teams')

npm startawait api.post('/scores', { projectId, judgeUid: user.uid, criteria: { inovacao: 8, impacto: 9 } })

# Runs on http://localhost:3000```

```

## 6) Deploy

**Backend** (in `hackathon-backend/` directory):- Suba o banco (Neon/Railway).

```bash- Configure as variáveis de ambiente na plataforma de deploy do backend.

npm run dev- Execute `npx prisma migrate deploy` ao iniciar o container.

# Runs on http://localhost:4000- No front, aponte `REACT_APP_API_BASE_URL` para a URL pública da API.

``````)



## 📚 Documentation

- **Frontend**: See `frontend/DEPLOY.md`
- **Backend**: See `hackathon-backend/QUICKSTART.md`
- **Deployment**: See `hackathon-backend/DEPLOY_TO_RENDER.md`
- **API Reference**: See `hackathon-backend/SETUP_COMPLETE.md`

## 🔧 Environment Variables

### Frontend (.env)
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
REACT_APP_API_URL=http://localhost:4000
```

### Backend (.env)
```env
PORT=4000
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=your_secret_key
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

**Happy Hacking!** 🎉

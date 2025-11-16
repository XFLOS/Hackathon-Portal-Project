# Hackathon Portal Project# Hackathon Portal Project# Hackathon Backend (Express + Prisma + Firebase Auth)



A full-stack hackathon management platform with React frontend and Express.js backend.



## 📁 Project StructureA full-stack hackathon management platform with React frontend and Express.js backend.## 1) Pré-requisitos



```- Node.js 18+

Hackathon-Portal-Project/

├── hackathon-frontend/          # React application## 📁 Project Structure- Banco PostgreSQL (Neon, Railway, Render, etc.)

│   ├── src/

│   ├── public/- Firebase Service Account (JSON)

│   ├── .env.example            # Frontend environment template

│   └── package.json```- Conta Cloudinary (para assinar upload)

│

├── hackathon-backend/          # Express.js API serverHackathon-Portal-Project/

│   ├── src/

│   │   ├── app.js             # Express app configuration├── frontend/                    # React application## 2) Configuração

│   │   ├── server.js          # Server entry point

│   │   ├── config/            # Database & Cloudinary config│   ├── src/Crie um arquivo `.env` na raiz com base no `.env.example`:

│   │   ├── controllers/       # Business logic

│   │   ├── middleware/        # Auth & error handling│   ├── public/

│   │   └── routes/            # API endpoints

│   ├── schema.sql             # PostgreSQL database schema│   ├── .env.example            # Frontend environment template```

│   ├── .env.example           # Backend environment template

│   ├── package.json│   └── package.jsonDATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?schema=public"

│   └── Documentation/

│       ├── QUICKSTART.md│FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...","client_email":"...","client_id":"..."}'

│       ├── DEPLOY_TO_RENDER.md

│       └── ...more docs├── hackathon-backend/          # Express.js API serverCLOUDINARY_CLOUD_NAME=""

│

└── README.md                   # This file│   ├── src/CLOUDINARY_API_KEY=""

```

│   │   ├── app.js             # Express app configurationCLOUDINARY_API_SECRET=""

## 🚀 Quick Start

│   │   ├── server.js          # Server entry pointPORT=8080

### Prerequisites

- Node.js 16+ and npm│   │   ├── config/            # Database & Cloudinary config```

- PostgreSQL database (recommend [Neon](https://neon.tech))

- Cloudinary account for file uploads│   │   ├── controllers/       # Business logic

- Firebase project for authentication

│   │   ├── middleware/        # Auth & error handling## 3) Instalação

### 1. Clone Repository

```bash│   │   └── routes/            # API endpoints```bash

git clone https://github.com/XFLOS/Hackathon-Portal-Project.git

cd Hackathon-Portal-Project│   ├── schema.sql             # PostgreSQL database schemanpm install

```

│   ├── .env.example           # Backend environment templatenpx prisma generate

### 2. Setup Frontend

```bash│   ├── package.jsonnpx prisma migrate dev --name init

cd hackathon-frontend

npm install│   └── Documentation/npm run dev



# Copy and configure environment variables│       ├── QUICKSTART.md```

cp .env.example .env

# Edit .env with your Firebase credentials│       ├── DEPLOY_TO_RENDER.md

```

│       └── ...more docsA API deve subir em `http://localhost:8080/health`.

### 3. Setup Backend

```bash│

cd hackathon-backend

npm install└── README.md                   # This file## 4) Rotas principais



# Copy and configure environment variables```- `GET /health` → status

cp .env.example .env

# Edit .env with your database and Cloudinary credentials- `GET /teams` (auth) → lista times (inclui membros e projeto)



# Create database tables## 🚀 Quick Start- `POST /teams` (auth) → cria time `{ name }`

# Run schema.sql in your PostgreSQL database

```- `POST /scores` (auth) → cria/atualiza nota `{ projectId, judgeUid, criteria }`



### 4. Run Development Servers### Prerequisites- `GET /scores/projects/:id` (auth) → notas de um projeto + média



**Frontend** (in `hackathon-frontend/` directory):- Node.js 16+ and npm- `GET /cloudinary/signature` (auth) → assinatura para upload

```bash

npm start- PostgreSQL database (recommend [Neon](https://neon.tech))

# Runs on http://localhost:3000

```- Cloudinary account for file uploads> **Auth**: enviar `Authorization: Bearer <ID_TOKEN_FIREBASE>`



**Backend** (in `hackathon-backend/` directory):- Firebase project for authentication

```bash

npm run dev## 5) Integração no Frontend (CRA)

# Runs on http://localhost:4000

```### 1. Clone RepositoryCrie `src/services/api.js`:



## 📚 Documentation```bash



- **Frontend**: See `hackathon-frontend/DEPLOY.md`git clone https://github.com/XFLOS/Hackathon-Portal-Project.git```js

- **Backend**: See `hackathon-backend/QUICKSTART.md`

- **Deployment**: See `hackathon-backend/DEPLOY_TO_RENDER.md`cd Hackathon-Portal-Projectimport axios from 'axios'

- **API Reference**: See `hackathon-backend/SETUP_COMPLETE.md`

```import { auth } from '../firebase/config'

## 🔧 Environment Variables

import { getIdToken } from 'firebase/auth'

### Frontend (.env)

```env### 2. Setup Frontend

REACT_APP_FIREBASE_API_KEY=your_api_key

REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain```bashconst api = axios.create({

REACT_APP_FIREBASE_PROJECT_ID=your_project_id

REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucketcd frontend  baseURL: process.env.REACT_APP_API_BASE_URL

REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id

REACT_APP_FIREBASE_APP_ID=your_app_idnpm install})

REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id

REACT_APP_API_URL=http://localhost:4000

```

# Copy and configure environment variablesapi.interceptors.request.use(async (config) => {

### Backend (.env)

```envcp .env.example .env  const user = auth.currentUser

PORT=4000

DATABASE_URL=postgresql://user:password@host/database?sslmode=require# Edit .env with your Firebase credentials  if (user) {

JWT_SECRET=your_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name```    const token = await getIdToken(user, true)

CLOUDINARY_API_KEY=your_api_key

CLOUDINARY_API_SECRET=your_api_secret    config.headers.Authorization = `Bearer ${token}`

```

### 3. Setup Backend  }

## 🗄️ Database Setup

```bash  return config

1. Create a PostgreSQL database (use [Neon](https://neon.tech) for free hosting)

2. Run the SQL schema:cd hackathon-backend})

   ```bash

   # In Neon SQL Editor or psqlnpm install

   \i hackathon-backend/schema.sql

   ```export default api

3. Update `DATABASE_URL` in `hackathon-backend/.env`

# Copy and configure environment variables```

## 🔐 Security Notes

cp .env.example .env

- **NEVER** commit `.env` files

- Use `.env.example` as templates only# Edit .env with your database and Cloudinary credentialsNo `.env` do front (CRA):

- Keep Firebase keys, database credentials, and API secrets secure

- Rotate JWT_SECRET in production```



## 🚀 Deployment# Create database tablesREACT_APP_API_BASE_URL=http://localhost:8080



### Frontend (Vercel/Netlify)# Run schema.sql in your PostgreSQL database```

See `hackathon-frontend/DEPLOY.md` for detailed instructions.

```

### Backend (Render)

See `hackathon-backend/DEPLOY_TO_RENDER.md` for step-by-step deployment guide.Uso no componente/página:



**Important Render Configuration:**### 4. Run Development Servers```js

- **Root Directory**: `hackathon-backend`

- **Build Command**: `npm install`import api from '../services/api'

- **Start Command**: `npm start`

- Add all environment variables from `hackathon-backend/.env.example`**Frontend** (in `frontend/` directory):



## 🛠️ Technology Stack```bashconst { data: teams } = await api.get('/teams')



### Frontendnpm startawait api.post('/scores', { projectId, judgeUid: user.uid, criteria: { inovacao: 8, impacto: 9 } })

- React 19

- Firebase Authentication & Analytics# Runs on http://localhost:3000```

- React Router

- Axios```



### Backend## 6) Deploy

- Express.js

- PostgreSQL (via node-postgres)**Backend** (in `hackathon-backend/` directory):- Suba o banco (Neon/Railway).

- JWT Authentication

- Cloudinary (file storage)```bash- Configure as variáveis de ambiente na plataforma de deploy do backend.

- Bcrypt (password hashing)

npm run dev- Execute `npx prisma migrate deploy` ao iniciar o container.

## 📖 Features

# Runs on http://localhost:4000- No front, aponte `REACT_APP_API_BASE_URL` para a URL pública da API.

- User authentication (students, mentors, judges, coordinators)

- Team formation and management``````)

- Project submissions

- Judge scoring and evaluations

- Leaderboards

- Event scheduling## 📚 Documentation

- File uploads

- Real-time updates- **Frontend**: See `frontend/DEPLOY.md`

- **Backend**: See `hackathon-backend/QUICKSTART.md`

## 🤝 Contributing- **Deployment**: See `hackathon-backend/DEPLOY_TO_RENDER.md`

- **API Reference**: See `hackathon-backend/SETUP_COMPLETE.md`

1. Fork the repository

2. Create a feature branch## 🔧 Environment Variables

3. Make your changes

4. Test locally### Frontend (.env)

5. Submit a pull request```env

REACT_APP_FIREBASE_API_KEY=your_api_key

## 📄 LicenseREACT_APP_FIREBASE_AUTH_DOMAIN=your_domain

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

**Happy Hacking!** 🎉

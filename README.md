# Hackathon Backend (Express + Prisma + Firebase Auth)

## 1) Pré-requisitos
- Node.js 18+
- Banco PostgreSQL (Neon, Railway, Render, etc.)
- Firebase Service Account (JSON)
- Conta Cloudinary (para assinar upload)

## 2) Configuração
Crie um arquivo `.env` na raiz com base no `.env.example`:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?schema=public"
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...","client_email":"...","client_id":"..."}'
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
PORT=8080
```

## 3) Instalação
```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

A API deve subir em `http://localhost:8080/health`.

## 4) Rotas principais
- `GET /health` → status
- `GET /teams` (auth) → lista times (inclui membros e projeto)
- `POST /teams` (auth) → cria time `{ name }`
- `POST /scores` (auth) → cria/atualiza nota `{ projectId, judgeUid, criteria }`
- `GET /scores/projects/:id` (auth) → notas de um projeto + média
- `GET /cloudinary/signature` (auth) → assinatura para upload

> **Auth**: enviar `Authorization: Bearer <ID_TOKEN_FIREBASE>`

## 5) Integração no Frontend (CRA)
Crie `src/services/api.js`:

```js
import axios from 'axios'
import { auth } from '../firebase/config'
import { getIdToken } from 'firebase/auth'

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL
})

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser
  if (user) {
    const token = await getIdToken(user, true)
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

No `.env` do front (CRA):
```
REACT_APP_API_BASE_URL=http://localhost:8080
```

Uso no componente/página:
```js
import api from '../services/api'

const { data: teams } = await api.get('/teams')
await api.post('/scores', { projectId, judgeUid: user.uid, criteria: { inovacao: 8, impacto: 9 } })
```

## 6) Deploy
- Suba o banco (Neon/Railway).
- Configure as variáveis de ambiente na plataforma de deploy do backend.
- Execute `npx prisma migrate deploy` ao iniciar o container.
- No front, aponte `REACT_APP_API_BASE_URL` para a URL pública da API.
```)


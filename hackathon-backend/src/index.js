import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { requireAuth } from './middleware/auth.js'

import teams from './routes/teams.js'
import scores from './routes/scores.js'
import cloudinary from './routes/cloudinary.js'

const app = express()
app.use(cors())
app.use(helmet())
app.use(express.json({ limit: '2mb' }))
app.use(morgan('dev'))

app.get('/health', (_req, res) => res.json({ ok: true }))

app.use('/teams', requireAuth, teams)
app.use('/scores', requireAuth, scores)
app.use('/cloudinary', requireAuth, cloudinary)

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`API on http://localhost:${port}`))

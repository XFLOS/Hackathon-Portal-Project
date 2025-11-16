import { Router } from 'express'
import { prisma } from '../config/prisma.js'

const r = Router()

r.post('/', async (req, res) => {
  const { projectId, judgeUid, criteria } = req.body
  if (!projectId || !judgeUid) return res.status(400).json({ error: 'projectId and judgeUid required' })

  const user = await prisma.user.findUnique({ where: { uid: judgeUid } })
  if (!user) return res.status(400).json({ error: 'judge user not found' })

  // Ensure Judge entity
  const judge = await prisma.judge.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id }
  })

  const total = Object.values(criteria || {}).reduce((sum, n) => sum + Number(n || 0), 0)

  const s = await prisma.score.upsert({
    where: { projectId_judgeId: { projectId, judgeId: judge.id } },
    update: { criteria, total },
    create: { projectId, judgeId: judge.id, criteria, total }
  })

  res.status(201).json(s)
})

r.get('/projects/:id', async (req, res) => {
  const { id } = req.params
  const scores = await prisma.score.findMany({ where: { projectId: id } })
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b.total, 0) / scores.length) : 0
  res.json({ scores, average: avg })
})

export default r

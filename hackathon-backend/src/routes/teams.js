import { Router } from 'express'
import { prisma } from '../config/prisma.js'

const r = Router()

r.get('/', async (_req, res) => {
  const teams = await prisma.team.findMany({ include: { members: true, project: true } })
  res.json(teams)
})

r.post('/', async (req, res) => {
  const { name } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })
  const t = await prisma.team.create({ data: { name } })
  res.status(201).json(t)
})

export default r

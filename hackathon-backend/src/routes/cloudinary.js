import { Router } from 'express'
import crypto from 'crypto'

const r = Router()

r.get('/signature', (req, res) => {
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const timestamp = Math.round(new Date().getTime() / 1000)
  if (!apiSecret) return res.status(500).json({ error: 'CLOUDINARY_API_SECRET missing' })

  const signature = crypto
    .createHash('sha1')
    .update(`timestamp=${timestamp}${apiSecret}`)
    .digest('hex')

  res.json({
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    signature
  })
})

export default r

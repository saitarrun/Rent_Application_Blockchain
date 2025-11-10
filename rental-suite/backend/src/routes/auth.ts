import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const router = Router()

router.post('/token', (req, res) => {
  const schema = z.object({ email: z.string().email().or(z.string().min(1)) })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid request' })
  const secret = process.env.JWT_SECRET || 'dev'
  const token = jwt.sign({ sub: parsed.data.email }, secret, { expiresIn: '2h' })
  res.json({ token })
})

export default router


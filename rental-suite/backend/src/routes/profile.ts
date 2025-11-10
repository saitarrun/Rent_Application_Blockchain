import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const router = Router()

function requireAuth(req: any, res: any, next: any) {
  try {
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    const secret = process.env.JWT_SECRET || 'dev'
    jwt.verify(token, secret)
    next()
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
  }
}

router.get('/', async (_req, res) => {
  const p = await prisma.profile.upsert({ where: { id: 'default' }, update: {}, create: { id: 'default' } })
  res.json({ name: p.name || '', contact: p.contact || '' })
})

router.put('/', requireAuth, async (req, res) => {
  const { name, contact } = req.body || {}
  const p = await prisma.profile.upsert({ where: { id: 'default' }, update: { name, contact }, create: { id: 'default', name, contact } })
  res.json({ name: p.name || '', contact: p.contact || '' })
})

export default router


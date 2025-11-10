import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs/promises'
import { z } from 'zod'

const prisma = new PrismaClient()
const router = Router()

const storageDir = path.join(__dirname, '..', 'storage')

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

// Auth middleware
function requireAuth(req: any, res: any, next: any) {
  try {
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    const secret = process.env.JWT_SECRET || 'dev'
    const payload = jwt.verify(token, secret)
    ;(req as any).user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
  }
}

// Schemas
const createSchema = z.object({
  landlordName: z.string().min(1),
  landlordContact: z.string().min(1),
  tenantName: z.string().min(1),
  tenantContact: z.string().min(1),
  propertyAddress: z.string().min(1),
  unit: z.string().nullish(),
  startISO: z.string().min(1),
  endISO: z.string().min(1),
  dueDay: z.number().int().min(1).max(28),
  monthlyRentEth: z.string().min(1),
  securityDepositEth: z.string().min(1),
  notes: z.string().nullish()
})

const patchSchema = z.object({
  chainId: z.string().optional(),
  txHash: z.string().optional(),
  termsHash: z.string().optional(),
  status: z.string().optional(),
  pdfPath: z.string().optional()
})

// Routes
router.get('/', async (_req, res) => {
  const items = await prisma.lease.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(items)
})

router.get('/:id', async (req, res) => {
  const item = await prisma.lease.findUnique({ where: { id: req.params.id } })
  if (!item) return res.status(404).json({ error: 'Not found' })
  res.json(item)
})

router.post('/', requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' })
  const data = parsed.data
  const item = await prisma.lease.create({ data: {
    landlordName: data.landlordName,
    landlordContact: data.landlordContact,
    tenantName: data.tenantName,
    tenantContact: data.tenantContact,
    propertyAddress: data.propertyAddress,
    unit: data.unit ?? undefined,
    startISO: data.startISO,
    endISO: data.endISO,
    dueDay: data.dueDay,
    monthlyRentEth: data.monthlyRentEth,
    securityDepositEth: data.securityDepositEth,
    notes: data.notes ?? undefined
  } })
  res.json(item)
})

router.patch('/:id', requireAuth, async (req, res) => {
  const parsed = patchSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid patch' })
  const item = await prisma.lease.update({ where: { id: req.params.id }, data: parsed.data })
  res.json(item)
})

router.post('/:id/pdf', requireAuth, upload.single('pdf'), async (req, res) => {
  try {
    await fs.mkdir(storageDir, { recursive: true })
    const dest = path.join(storageDir, `${req.params.id}.pdf`)
    await fs.writeFile(dest, req.file?.buffer || new Uint8Array())
    const rel = `/storage/${req.params.id}.pdf`
    await prisma.lease.update({ where: { id: req.params.id }, data: { pdfPath: rel } })
    res.json({ pdfPath: rel })
  } catch (e) {
    res.status(500).json({ error: 'Failed to save PDF' })
  }
})

export default router

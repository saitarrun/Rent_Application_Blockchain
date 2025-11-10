import express from 'express'
import cors from 'cors'
import path from 'node:path'
import leasesRouter from './routes/leases'
import authRouter from './routes/auth'
import profileRouter from './routes/profile'

const app = express()
// CORS: allow configured origin or common local dev ports (3000/5173)
const ORIGIN = process.env.CORS_ORIGIN
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true)
    const allowList = new Set([
      ORIGIN,
      'http://localhost:3000', 'http://127.0.0.1:3000',
      'http://localhost:5173', 'http://127.0.0.1:5173',
    ].filter(Boolean) as string[])
    if (allowList.has(origin)) return cb(null, true)
    // For local dev, be permissive for other localhost ports
    if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return cb(null, true)
    return cb(null, false)
  }
}))
app.use(express.json({ limit: '5mb' }))

// static for PDFs
app.use('/storage', express.static(path.join(__dirname, 'storage')))

app.use('/api/auth', authRouter)
app.use('/api/leases', leasesRouter)
app.use('/api/profile', profileRouter)

// Minimal root and health endpoints so hitting http://localhost:3001/ is informative
app.get('/', (_req, res) => {
  res.type('text/plain').send(
    'Rental Suite API\n' +
    'Endpoints:\n' +
    '  GET  /api/leases\n' +
    '  GET  /api/profile\n' +
    '  POST /api/leases  (JWT)\n' +
    '  PATCH /api/leases/:id  (JWT)\n' +
    '  POST /api/leases/:id/pdf  (JWT)\n'
  )
})

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})

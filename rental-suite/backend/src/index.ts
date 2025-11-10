import express from 'express'
import cors from 'cors'
import path from 'node:path'
import leasesRouter from './routes/leases'
import authRouter from './routes/auth'
import profileRouter from './routes/profile'

const app = express()
const ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

app.use(cors({ origin: ORIGIN }))
app.use(express.json({ limit: '5mb' }))

// static for PDFs
app.use('/storage', express.static(path.join(__dirname, 'storage')))

app.use('/api/auth', authRouter)
app.use('/api/leases', leasesRouter)
app.use('/api/profile', profileRouter)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})
